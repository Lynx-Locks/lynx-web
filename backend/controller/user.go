package controller

import (
	"api/helpers"
	"api/models"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"net/http"
)

func GetAllUsers(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	helpers.GetAllTable(w, []models.User{})
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uId := chi.URLParam(r, "userId")
	helpers.GetById(w, models.User{}, uId)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	// essentially reset if the user inputted anything to common as it should not be editable
	user.Common = models.Common{}
	helpers.CreateNewRecord(w, user, err)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uId := chi.URLParam(r, "userId")
	helpers.DeleteById(w, models.User{}, uId)
}
