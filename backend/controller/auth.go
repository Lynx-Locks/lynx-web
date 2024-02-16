package controller

import (
	"api/config"
	"api/helpers"
	"api/models"
	"crypto/rand"
	"encoding/json"
	"github.com/google/uuid"
	"log"
	"net/http"
)

// https://developers.google.com/codelabs/passkey-form-autofill

// https://webauthn.guide/#registration
func RegisterRequest(w http.ResponseWriter, r *http.Request) {
	challenge := make([]byte, 8) // maybe needs to be 16?
	_, err := rand.Read(challenge)
	if err != nil {
		// TODO: handle error
	}

	// TODO: parse uuid token from url param and fetch user id from activeTokens table
	var user models.User
	result := config.DB.First(&user)

	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}

	options := models.WebAuthnOptions{
		Challenge: challenge,
		Rp: models.Rp{
			Name: "Lynx Locks",
		},
		User: models.UserInfo{
			Id:          uuid.NewString(), // not sure if this is important
			Name:        user.Name,
			DisplayName: user.Name,
		},
		PubKeyCredParams: []models.PubKeyCredParams{
			{
				Alg:  -7,
				Type: "public-key",
			},
			{
				Alg:  -257,
				Type: "public-key",
			},
		},
		AuthenticatorSelection: models.AuthenticatorSelection{
			AuthenticatorAttachment: "platform",
			RequireResidentKey:      true,
		},
	}

	errJson := json.NewEncoder(w).Encode(&options)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func RegisterResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var registerReq models.RegisterReq
	err := json.NewDecoder(r.Body).Decode(&registerReq)
	if err != nil {
		log.Print(err)
		http.Error(w, "400", http.StatusBadRequest)
		return
	}

	// TODO: add to DB

	// TODO: delete token from activeTokens table

	errJson := json.NewEncoder(w).Encode(registerReq) // TODO: send meaningful response
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func GetKeys(w http.ResponseWriter, r *http.Request) {
	// TODO
}
