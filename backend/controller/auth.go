package controller

import (
	"api/models"
	"crypto/rand"
	"encoding/json"
	"github.com/google/uuid"
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

	options := models.WebAuthnOptions{
		Challenge: challenge,
		Rp: models.Rp{
			Name: "Lynx Locks",
		},
		User: models.UserInfo{
			Id:          uuid.NewString(), // TODO: get uuid token from url and fetch user id from activeTokens table
			Name:        "john_james",
			DisplayName: "John",
		},
		PubKeyCredParams: []models.PubKeyCredParams{
			{
				Alg:  -7,
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
	// pass
}

func GetKeys(w http.ResponseWriter, r *http.Request) {
	// pass
}
