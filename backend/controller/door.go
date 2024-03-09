package controller

import (
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/json"
	"net/http"
)

func GetAllDoors(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, doors := helpers.GetAllTable(w, []models.Door{})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, doors)
}

func UpdateDoor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	door := models.Door{}
	err := json.NewDecoder(r.Body).Decode(&door)

	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
		return
	}
	err, door = helpers.UpdateObject(w, door)
	if err != nil {
		return
	}
	helpers.JsonWriter(w, door)

}

func CreateDoor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var door models.Door
	err := json.NewDecoder(r.Body).Decode(&door)
	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
	}
	err, _ = helpers.CreateNewRecord(w, door)

	if err != nil {
		return
	}
	helpers.JsonWriter(w, door)
}

func DeleteDoor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, dId := helpers.ParseInt(w, r, "doorId")
	if err != nil {
		return
	}
	err = helpers.DeleteByPk(w, models.Door{}, dId)
	if err != nil {
		return
	}
	err = db.DB.Unscoped().Model(&models.Door{Id: dId}).Association("Roles").Unscoped().Clear()
	if err != nil {
		http.Error(w, "Unable to delete associations", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(200)
}
