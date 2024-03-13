package controller

import (
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
	err, door = helpers.CreateNewRecord(w, door)

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
	err = helpers.DeleteObjandAssociationsByPk(w, models.Door{Id: dId})
	if err != nil {
		return
	}
	w.WriteHeader(200)
}

func IsDoorOpen(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, dId := helpers.ParseInt(w, r, "doorId")
	if err != nil {
		return
	}
	uId, hasAccess := models.DoorUnlocked[dId]
	if !hasAccess {
		http.Error(w, "Door not unlocked", http.StatusUnauthorized)
		return
	}

	err = UpdateLastTimeIn(w, uId)
	if err != nil {
		http.Error(w, "Unable to update last time in", http.StatusInternalServerError)
		return
	}
	delete(models.DoorUnlocked, dId)
	w.WriteHeader(200)
}
