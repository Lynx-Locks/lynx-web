package controller

import (
	"api/helpers"
	"api/models"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func GetAllUsers(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, users := helpers.GetAllTable(w, []models.User{})
	if err == nil {
		helpers.JsonWriter(w, users)
	}
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	uId, err := strconv.ParseUint(chi.URLParam(r, "userId"), 10, 32)
	if err != nil {
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	//extra uint is for 64 bit to 32 bit
	err2, user := helpers.GetFirstTable(w, models.User{}, models.Common{Id: uint(uId)})
	if err2 == nil {
		helpers.JsonWriter(w, user)
	}
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	// essentially reset if the user inputted anything to common as it should not be editable
	user.Common = models.Common{}
	err2, user := helpers.CreateNewRecord(w, user, err)
	if err2 == nil {
		helpers.JsonWriter(w, user)
	}
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	uId := chi.URLParam(r, "userId")
	err := helpers.DeleteById(w, models.User{}, uId)
	if err == nil {
		w.WriteHeader(200)
	}
}
