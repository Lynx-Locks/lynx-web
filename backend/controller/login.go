package controller

import (
	"api/config"
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/json"
	webauthn2 "github.com/go-webauthn/webauthn/webauthn"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"time"
)

var secretKey = []byte("secret")

// as per https://medium.com/@cheickzida/golang-implementing-jwt-token-authentication-bba9bfd84d60
func createToken(user models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"email":   user.Email,
			"isAdmin": user.IsAdmin,
			"exp":     time.Now().Add(time.Hour * 24).Unix(),
		})

	tokenString, err := token.SignedString(secretKey)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

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

	if user.IsAdmin {
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

		credential, err := config.WebAuthn.FinishLogin(user, session, r)
		if err != nil {
			http.Error(w, "Could not finish log in", http.StatusInternalServerError)
			return
		}

		err = SaveDBCredential(w, credential)
		if err != nil {
			return
		}

		token, err := createToken(user)

		if err != nil {
			http.Error(w, "Could not generate validation token", http.StatusInternalServerError)
			return
		}

		payload := struct {
			Token string `json:"token"`
		}{
			token,
		}

		errJson := json.NewEncoder(w).Encode(payload)
		if errJson != nil {
			http.Error(w, "Could not return results", http.StatusInternalServerError)
			return
		}
	} else {
		http.Error(w, "User not admin", http.StatusUnauthorized)
	}
}
