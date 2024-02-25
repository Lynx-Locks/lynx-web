package controller

import (
	"api/helpers"
	"api/models"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"net/http"
)

func GetAllDoors(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, doors := helpers.GetAllTable(w, []models.Door{})
	if err == nil {
		helpers.JsonWriter(w, doors)
	}
}

func CreateDoor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var role models.Door
	err := json.NewDecoder(r.Body).Decode(&role)
	// essentially reset if the user inputted anything to common as it should not be editable
	role.Common = models.Common{}
	err, user := helpers.CreateNewRecord(w, role, err)
	if err == nil {
		helpers.JsonWriter(w, user)
	}
}

func DeleteDoor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	dId := chi.URLParam(r, "doorId")
	err := helpers.DeleteById(w, models.Door{}, dId)
	if err == nil {
		w.WriteHeader(200)
	}
}
