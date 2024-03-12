package controller

import (
	"api/config"
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/base64"
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	webauthn2 "github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
	"net/http"
	"slices"
	"time"
)

// https://developers.google.com/codelabs/passkey-form-autofill

func GetUserAndToken(w http.ResponseWriter, r *http.Request) (user models.User, activeToken models.ActiveTokens, valid bool) {
	token, err := uuid.Parse(chi.URLParam(r, "token"))
	if err != nil {
		return user, activeToken, false
	}
	activeToken = models.ActiveTokens{Id: token}

	res := db.DB.First(&activeToken)
	if res.Error != nil {
		http.Error(w, "Unable to validate as existing token", http.StatusUnauthorized)
		return user, activeToken, false
	}
	if time.Now().Unix() > activeToken.ExpiryDate {
		http.Error(w, "Token has expired", http.StatusUnauthorized)
		return user, activeToken, false
	}
	err = db.DB.Model(&activeToken).Association("User").Find(&user)
	if err != nil {
		http.Error(w, "Unable to get a user from token", http.StatusInternalServerError)
		return user, activeToken, false
	}

	return user, activeToken, true
}

func SaveDBCredential(w http.ResponseWriter, credential *webauthn2.Credential) error {
	// If login was successful, update the credential object
	transports := make([]string, 0)
	for _, val := range credential.Transport {
		transports = append(transports, string(val))
	}

	dbCredential := models.Credential{
		Id:              credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		Transport:       transports,
		Flags: models.Flags{
			UserPresent:    credential.Flags.UserPresent,
			UserVerified:   credential.Flags.UserVerified,
			BackupEligible: credential.Flags.BackupEligible,
			BackupState:    credential.Flags.BackupState,
		},
		Authenticator: models.Authenticator{
			AAGUID:       credential.Authenticator.AAGUID,
			SignCount:    credential.Authenticator.SignCount,
			CloneWarning: credential.Authenticator.CloneWarning,
			Attachment:   string(credential.Authenticator.Attachment),
		},
	}

	result := db.DB.Save(&dbCredential)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return errors.New("could not save credentials")
	}

	return nil
}

// https://webauthn.guide/#registration
func RegisterRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user, _, valid := GetUserAndToken(w, r)
	if !valid {
		return
	}

	options, session, err := config.WebAuthn.BeginRegistration(user)

	// store session data values
	sessionData := models.SessionData{
		Challenge:            session.Challenge,
		UserId:               session.UserID,
		AllowedCredentialIds: session.AllowedCredentialIDs,
		Expires:              session.Expires,
		UserVerification:     session.UserVerification,
		Extensions:           session.Extensions,
	}

	// handle errors
	if err != nil {
		http.Error(w, "Could not begin registration for provided user", http.StatusInternalServerError)
		return
	}

	// store sesion data
	result := db.DB.Create(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	errJson := json.NewEncoder(w).Encode(&options.Response)
	if errJson != nil {
		http.Error(w, "Could not return results", http.StatusInternalServerError)
		return
	}
}

func RegisterResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user, activeToken, valid := GetUserAndToken(w, r)
	if !valid {
		return
	}

	// Get the session data stored from the function above
	sessionData := models.SessionData{
		UserId: user.WebAuthnID(),
	}
	result := db.DB.First(&sessionData)
	if result.Error == nil {
		result = db.DB.Delete(&sessionData)
	}
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	session := webauthn2.SessionData{
		Challenge:            sessionData.Challenge,
		UserID:               sessionData.UserId,
		AllowedCredentialIDs: sessionData.AllowedCredentialIds,
		Expires:              sessionData.Expires,
		UserVerification:     sessionData.UserVerification,
		Extensions:           sessionData.Extensions,
	}

	credential, err := config.WebAuthn.FinishRegistration(user, session, r)
	if err != nil {
		http.Error(w, "Could not finish registration for provided user", http.StatusInternalServerError)
		return
	}

	// save credentials
	transports := make([]string, 0)
	for _, val := range credential.Transport {
		transports = append(transports, string(val))
	}

	// Add public key to DB
	dbCredential := models.Credential{
		Id:              credential.ID,
		UserId:          user.Id,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		Transport:       transports,
		Flags: models.Flags{
			UserPresent:    credential.Flags.UserPresent,
			UserVerified:   credential.Flags.UserVerified,
			BackupEligible: credential.Flags.BackupEligible,
			BackupState:    credential.Flags.BackupState,
		},
		Authenticator: models.Authenticator{
			AAGUID:       credential.Authenticator.AAGUID,
			SignCount:    credential.Authenticator.SignCount,
			CloneWarning: credential.Authenticator.CloneWarning,
			Attachment:   string(credential.Authenticator.Attachment),
		},
	}

	result = db.DB.Create(&dbCredential)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	result = db.DB.Unscoped().Select(clause.Associations).Delete(&activeToken)
	if result.Error != nil {
		http.Error(w, "Failed to delete active token", http.StatusInternalServerError)
		return
	}

	errJson := json.NewEncoder(w).Encode("Registration Success")
	if errJson != nil {
		http.Error(w, "Could not return results", http.StatusInternalServerError)
		return
	}
}

func AuthorizeRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	login, session, err := config.WebAuthn.BeginDiscoverableLogin()
	if err != nil {
		http.Error(w, "Could not begin log in", http.StatusInternalServerError)
		return
	}

	// store the session values
	sessionData := models.SessionData{
		Challenge:            session.Challenge,
		UserId:               session.UserID,
		AllowedCredentialIds: session.AllowedCredentialIDs,
		Expires:              session.Expires,
		UserVerification:     session.UserVerification,
		Extensions:           session.Extensions,
	}

	// store sesion data
	result := db.DB.Create(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	errJson := json.NewEncoder(w).Encode(&login.Response)
	if errJson != nil {
		http.Error(w, "Could not return results", http.StatusInternalServerError)
		return
	}
}

func AuthorizeResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	err, dId := helpers.ParseInt(w, r, "doorId")
	if err != nil {
		return
	}
	// Get the session
	challenge, _ := base64.StdEncoding.DecodeString(chi.URLParam(r, "challenge"))

	// Get the session data stored from the function above
	sessionData := models.SessionData{
		Challenge: string(challenge),
	}
	result := db.DB.First(&sessionData)
	if result.Error == nil {
		result = db.DB.Delete(&sessionData)
	}
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	session := webauthn2.SessionData{
		Challenge:            sessionData.Challenge,
		UserID:               sessionData.UserId,
		AllowedCredentialIDs: sessionData.AllowedCredentialIds,
		Expires:              sessionData.Expires,
		UserVerification:     sessionData.UserVerification,
		Extensions:           sessionData.Extensions,
	}

	getUser := webauthn2.DiscoverableUserHandler(func(rawId []byte, userHandle []byte) (webauthn2.User, error) {
		user := models.User{}
		result := db.DB.Where(models.User{WebauthnId: userHandle}).Take(&user)
		if result.Error != nil {
			return models.User{}, errors.New(result.Error.Error())
		}
		return user, nil
	})

	credential, err := config.WebAuthn.FinishDiscoverableLogin(getUser, session, r)
	if err != nil {
		http.Error(w, "Could not finish log in", http.StatusInternalServerError)
		return
	}

	// The below code is some logic from https://github.com/go-webauthn/webauthn
	// This was commented out because when logging in without passing user explicitly it sets the user to 0
	// In addition it did not seem to be updating anything
	//err = SaveDBCredential(w, credential)
	//if err != nil {
	//	http.Error(w, "Could not finish log in", http.StatusInternalServerError)
	//	return
	//}

	user := models.User{}
	creds := models.Credential{Id: credential.ID}
	res := db.DB.First(&creds)
	if res.Error != nil {
		http.Error(w, "Could retrieve credential", http.StatusInternalServerError)
		return
	}
	db.DB.Model(&creds).Association("User").Find(&user)
	roles := []models.Role{}
	db.DB.Model(&user).Association("Roles").Find(&roles)
	doors := []models.Door{}
	db.DB.Distinct("id").Model(&roles).Association("Doors").Find(&doors)
	idx := slices.IndexFunc(doors, func(d models.Door) bool { return d.Id == dId })
	if idx == -1 {
		http.Error(w, "User does not have access to door", http.StatusBadRequest)
		return
	}

	errJson := json.NewEncoder(w).Encode("Login Success, opening door")
	if errJson != nil {
		http.Error(w, "Could not return results", http.StatusInternalServerError)
		return
	}
	go unlockDoor(dId)
}

func unlockDoor(doorId uint) {
	models.DoorUnlocked[doorId] = true
	time.Sleep(3 * time.Second)
	delete(models.DoorUnlocked, doorId)
}
