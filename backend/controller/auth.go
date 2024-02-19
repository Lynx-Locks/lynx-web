package controller

import (
	"api/config"
	"api/helpers"
	"api/models"
	"bytes"
	"encoding/json"
	webauthn2 "github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
	"io"
	"log"
	"net/http"
)

// https://developers.google.com/codelabs/passkey-form-autofill

// https://webauthn.guide/#registration
func RegisterRequest(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	// TODO: parse uuid token from request body and fetch user id from activeTokens table
	var user models.User
	result := config.DB.First(&user)

	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	options, session, err := config.WebAuthn.BeginRegistration(user)
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
	result = config.DB.Create(&sessionData)
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

	contents, _ := io.ReadAll(r.Body)
	err := r.Body.Close()
	if err != nil {
		log.Print("Cannot read body")
		return
	}
	r.Body = io.NopCloser(bytes.NewReader(contents))

	var completeRegistration models.CompleteRegistration
	err = json.NewDecoder(bytes.NewReader(contents)).Decode(&completeRegistration)

	if err != nil {
		log.Print(err)
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	// Get the session data stored from the function above
	var sessionData models.SessionData
	config.DB.First(&sessionData)
	challenge := completeRegistration.Challenge
	result := config.DB.Where("challenge = ?", challenge).First(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}

	// Get the user
	var user models.User
	u := uuid.UUID{}
	err = u.UnmarshalBinary(sessionData.UserId)
	if err != nil {
		// TODO: handle error
	}
	result = config.DB.First(&user)
	config.DB.First(&user)
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
	println(credential)
	if err != nil {
		// TODO: Handle Error

		return
	}

	// TODO: add public key to DB

	// TODO: delete token from activeTokens table & session from sessions table

	// If creation was successful, store the credential object
	// Pseudocode to add the user credential.
	// user.AddCredential(credential)
	// datastore.SaveUser(user)

	errJson := json.NewEncoder(w).Encode("Registration Success")
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func GetKeys(w http.ResponseWriter, r *http.Request) {
	// TODO
}
