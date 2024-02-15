package controller

import (
	"api/config"
	"api/helpers"
	"api/models"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"log"
	"net/http"
)

func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	users := []models.User{}
	result := config.DB.Find(&users)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}
	//go yells at you if you don't error check this, better to be safe
	errJson := json.NewEncoder(w).Encode(&users)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uId := chi.URLParam(r, "userId")
	var user models.User
	result := config.DB.First(&user, uId)

	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}
	errJson := json.NewEncoder(w).Encode(&user)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user models.UserReq
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil || !helpers.CheckFields(user) {
		if err != nil {
			log.Print(err)
		} else {
			log.Print("Request doesn't contain all params")
		}
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	dbUser := models.User{Name: user.Name,
		Email: user.Email, IsAdmin: user.IsAdmin}
	result := config.DB.Create(&dbUser)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}
	errJson := json.NewEncoder(w).Encode(dbUser)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}

}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uId := chi.URLParam(r, "userId")
	var user models.User
	result := config.DB.Unscoped().Delete(&user, uId)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w, r)
		return
	}
	if result.RowsAffected < 1 {
		http.Error(w, "404", http.StatusBadRequest)
		return
	}
	w.WriteHeader(200)
}
