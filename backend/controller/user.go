package controller

import (
	"api/helpers"
	"api/models"
	"encoding/json"
	"net/http"
)

func GetAllUsers(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, users := helpers.GetAllTable(w, []models.User{})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, users)
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	err, uId := helpers.ParseInt(w, r, "userId")
	err, user := helpers.GetFirstTable(w, models.User{}, models.Common{Id: uId})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, user)
}

func GetUserByEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email parameter is required", http.StatusBadRequest)
		return
	}

	err, user := helpers.GetFirstTable(w, models.User{}, models.User{Email: email})
	if err != nil {
		return
	}

	helpers.JsonWriter(w, &user)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "400 malformed request", http.StatusBadRequest)
	}
	// essentially reset if the user inputted anything to common ass it should not be editable
	user.Common = models.Common{}
	err, user = helpers.CreateNewRecord(w, user)
	if err != nil {
		return
	}
	helpers.JsonWriter(w, user)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	err = helpers.DeleteByPk(w, models.User{}, uId)
	if err != nil {
		return
	}
	w.WriteHeader(200)
}
