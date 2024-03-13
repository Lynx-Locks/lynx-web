package controller

import (
	"api/auth"
	"api/config"
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/json"
	webauthn2 "github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
	"net/http"
)

func LoginRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Find the user
	user, valid := GetUserByUrlParam(w, r)
	if !valid {
		return
	}

	options, session, err := config.WebAuthn.BeginLogin(user)
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

	errJson := json.NewEncoder(w).Encode(&options.Response)
	if errJson != nil {
		http.Error(w, "Could not return results", http.StatusInternalServerError)
		return
	}
}

func LoginResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user, valid := GetUserByUrlParam(w, r)
	if !valid {
		return
	}

	// Get the session data stored from the function above
<<<<<<< HEAD
	sessionData := models.SessionData{}
	result := db.DB.Where(models.SessionData{UserId: user.WebAuthnID()}).Take(&sessionData)
=======
<<<<<<< HEAD
	sessionData := models.SessionData{
		UserId: user.WebAuthnID(),
	}
	result := db.DB.First(&sessionData)
>>>>>>> 0890bf3 (WIP backend authentication issues)
	if result.Error == nil {
		result = db.DB.Delete(&sessionData)
	}
=======
	sessionData := models.SessionData{}
	result := db.DB.Where(models.SessionData{UserId: user.WebAuthnID()}).Take(&sessionData)
	if result.Error == nil {
		result = db.DB.Delete(&sessionData)
	}
>>>>>>> fd0e002 (WIP backend authentication issues)
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
		http.Error(w, "Could not finish log in", http.StatusInternalServerError)
		return
	}

	err = SaveDBCredential(w, credential)
	if err != nil {
		return
	}

	sessionId, _ := uuid.NewUUID()
	_, tokenString, err := auth.TokenAuth.Encode(map[string]interface{}{
		"sessionId": sessionId.String(),
		"userId":    user.Id,
		"isAdmin":   user.IsAdmin,
	})
	if err != nil {
		http.Error(w, "Could create token", http.StatusInternalServerError)
		return
	}
	cookie := http.Cookie{
		Name:   "jwt",
		Value:  tokenString,
		Path:   "/",
		MaxAge: 60 * 60 * 24 * 7 * 4, // Expires in 4 weeks
	}
	http.SetCookie(w, &cookie)
	auth.ActiveSessions[sessionId.String()] = true
	w.WriteHeader(200)
}

func LogoutRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	at, err := r.Cookie("jwt")
	if err != nil {
		http.Error(w, "not logged in", http.StatusUnauthorized)
		return
	}
	t := at.Value
	token, err := auth.TokenAuth.Decode(t)
	if sid, ok := token.Get("sessionId"); ok {
		delete(auth.ActiveSessions, sid.(string))
	}

	auth.ClearCookie(w)

	w.WriteHeader(200)
}
