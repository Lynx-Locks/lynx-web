package controller

import (
	"api/config"
	"api/db"
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
	result := db.DB.First(&user)

	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
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
	result = db.DB.Create(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
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

	bodyContents, _ := io.ReadAll(r.Body)
	err := r.Body.Close()
	if err != nil {
		log.Print("Cannot read body")
		return
	}
	r.Body = io.NopCloser(bytes.NewReader(bodyContents))

	var completeRegistration models.CompleteWebauthnResponse
	err = json.NewDecoder(bytes.NewReader(bodyContents)).Decode(&completeRegistration)

	if err != nil {
		log.Print(err)
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	// Get the session data stored from the function above
	var sessionData models.SessionData
	challenge := completeRegistration.Challenge
	result := db.DB.Where("challenge = ?", challenge).First(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}

	// Get the user
	var user models.User
	u := uuid.UUID{}
	err = u.UnmarshalBinary(sessionData.UserId)
	if err != nil {
		// TODO: handle error
	}
	result = db.DB.First(&user)
	db.DB.First(&user)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
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
		Id:              credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		Transport:       transports,
		Flags:           flags,
		Authenticator:   authenticator,
	}
	result = db.DB.Create(&dbCredential)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}

	// TODO: add public key to DB
	key := models.Key{
		UserId:    user.Id,
		Roles:     nil, // TODO: use activeTokens table to find roles
		PublicKey: credential.PublicKey,
	}

	result = db.DB.Create(&key) // pass pointer of data to Create
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}

	// TODO: delete token from activeTokens table & session from sessions table

	errJson := json.NewEncoder(w).Encode("Registration Success")
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func GetKeys(w http.ResponseWriter, r *http.Request) {
	// TODO
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
		helpers.DBErrorHandling(result.Error, w, r)
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
		helpers.DBErrorHandling(result.Error, w, r)
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

	contents, _ := io.ReadAll(r.Body)
	err := r.Body.Close()
	if err != nil {
		log.Print("Cannot read body")
		return
	}
	r.Body = io.NopCloser(bytes.NewReader(contents))

	var completeRegistration models.CompleteWebauthnResponse
	err = json.NewDecoder(bytes.NewReader(contents)).Decode(&completeRegistration)

	if err != nil {
		log.Print(err)
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	// Get the session data stored from the function above
	var sessionData models.SessionData
	challenge := completeRegistration.Response.ClientDataJson
	result := db.DB.Where("challenge = ?", challenge).First(&sessionData)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}

	// Get the user
	var user models.User
	u := uuid.UUID{}
	err = u.UnmarshalBinary(sessionData.UserId)
	if err != nil {
		// TODO: handle error
	}
	result = db.DB.First(&user)
	db.DB.First(&user)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
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
		Id:              credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		Transport:       transports,
		Flags:           flags,
		Authenticator:   authenticator,
	}
	result = db.DB.Save(&dbCredential)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}

	errJson := json.NewEncoder(w).Encode("Login Success")
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}
