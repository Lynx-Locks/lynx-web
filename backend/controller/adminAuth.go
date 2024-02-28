package controller

import (
	"api/models"
	"encoding/json"
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

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	user, valid := GetUserByUrlParam(w, r)
	if !valid {
		return
	}

	if user.IsAdmin {
		err := ExecAuthResponse(w, r, user)
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
