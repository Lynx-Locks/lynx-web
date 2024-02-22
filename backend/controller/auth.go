package controller

import (
	"api/config"
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/json"
	webauthn2 "github.com/go-webauthn/webauthn/webauthn"
	"net/http"
)

// https://developers.google.com/codelabs/passkey-form-autofill

// https://webauthn.guide/#registration
func RegisterRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user models.User
	result := db.DB.First(&user) // TODO: parse user from request body

	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
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
		// TODO: handle error
	}

	// store sesion data
	result = db.DB.Create(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	errJson := json.NewEncoder(w).Encode(&options.Response)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func RegisterResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get the user
	var user models.User
	result := db.DB.First(&user) // TODO: parse user from request
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	// Get the session data stored from the function above
	sessionData := models.SessionData{
		UserId: user.WebAuthnID(),
	}
	result = db.DB.First(&sessionData)
	//db.DB.Where("user_id = ?", sessionData.UserId).Delete(&models.SessionData{}) // TODO: FIX THIS @adam_barroso
	db.DB.Delete(models.SessionData{UserId: user.WebAuthnID()})
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
		// TODO: Handle Error

		return
	}

	// save credentials
	transports := make([]string, 0)
	for _, val := range credential.Transport {
		transports = append(transports, string(val))
	}

	flags := models.Flags{
		UserPresent:    credential.Flags.UserPresent,
		UserVerified:   credential.Flags.UserVerified,
		BackupEligible: credential.Flags.BackupEligible,
		BackupState:    credential.Flags.BackupState,
	}

	authenticator := models.Authenticator{
		AAGUID:       credential.Authenticator.AAGUID,
		SignCount:    credential.Authenticator.SignCount,
		CloneWarning: credential.Authenticator.CloneWarning,
		Attachment:   string(credential.Authenticator.Attachment),
	}

	// Add public key to DB
	dbCredential := models.Credential{
		UserId:          user.Id,
		Roles:           nil, // TODO: use activeTokens table to find roles
		WebauthnId:      credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		Transport:       transports,
		Flags:           flags,
		Authenticator:   authenticator,
	}
	result = db.DB.Create(&dbCredential)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	// TODO: delete token from activeTokens table

	errJson := json.NewEncoder(w).Encode("Registration Success")
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func SigninRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Find the user
	body := struct {
		Id uint `json:"id"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&body)

	var user models.User
	result := db.DB.First(&user, body.Id)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	options, session, err := config.WebAuthn.BeginLogin(user)
	if err != nil {
		// Handle Error and return.

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

	// handle errors
	if err != nil {
		// TODO: handle error
	}

	// store sesion data
	result = db.DB.Create(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	errJson := json.NewEncoder(w).Encode(&options.Response)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func SigninResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Get the user
	var user models.User
	result := db.DB.First(&user) // TODO: parse user from request
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	// Get the session data stored from the function above
	var sessionData models.SessionData
	result = db.DB.Where("user_id = ?", user.Id).Delete(&sessionData)
	//db.DB.Unscoped().Delete(&sessionData)
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

	credential, err := config.WebAuthn.FinishLogin(user, session, r)
	if err != nil {
		// TODO: Handle Error

		return
	}

	// If login was successful, update the credential object
	transports := make([]string, 0)
	for _, val := range credential.Transport {
		transports = append(transports, string(val))
	}

	flags := models.Flags{
		credential.Flags.UserPresent,
		credential.Flags.UserVerified,
		credential.Flags.BackupEligible,
		credential.Flags.BackupState,
	}

	authenticator := models.Authenticator{
		AAGUID:       credential.Authenticator.AAGUID,
		SignCount:    credential.Authenticator.SignCount,
		CloneWarning: credential.Authenticator.CloneWarning,
		Attachment:   string(credential.Authenticator.Attachment),
	}

	dbCredential := models.Credential{
		WebauthnId:      credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		Transport:       transports,
		Flags:           flags,
		Authenticator:   authenticator,
	}
	result = db.DB.Save(&dbCredential)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	errJson := json.NewEncoder(w).Encode("Login Success")
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}
