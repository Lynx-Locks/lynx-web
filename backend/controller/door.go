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

func CreateDoor(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var role models.Door
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "400 malformed request", http.StatusBadRequest)
	}
	// essentially reset if the user inputted anything to common as it should not be editable
	role.Common = models.Common{}
	err, user := helpers.CreateNewRecord(w, role)

	if err != nil {
		return
	}
	helpers.JsonWriter(w, user)
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
	err = db.DB.Debug().Unscoped().Model(&models.Door{Common: models.Common{Id: dId}}).Association("Roles").Unscoped().Clear()
	if err != nil {
		http.Error(w, "500 unable to delete associations", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(200)
}
