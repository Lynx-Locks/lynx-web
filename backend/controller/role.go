package controller

import (
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"net/http"
)

func GetAllRoles(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, roles := helpers.GetAllTable(w, []models.Role{})
	if err == nil {
		helpers.JsonWriter(w, roles)
	}

	//for viewing all connections
	//roles = []models.Role{}
	//config.DB.Preload("Doors").Find(&roles)
	//helpers.JsonWriter(w, roles)
}

func CreateRole(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var role models.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	role.Common = models.Common{}
	err, role = helpers.CreateNewRecord(w, role, err)
	if err == nil {
		helpers.JsonWriter(w, role)
	}
}

func DeleteRole(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	rId := chi.URLParam(r, "roleId")
	err := helpers.DeleteById(w, models.Role{}, rId)
	if err == nil {
		w.WriteHeader(200)
	}
}

func ReplaceDoorAssociation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, rId := helpers.ParseInt(w, r, "roleId")
	if err != nil {
		return
	}
	doorIDs := []uint{}
	err = json.NewDecoder(r.Body).Decode(&doorIDs)
	if err != nil {
		http.Error(w, "400 malformed doorIDs", http.StatusBadRequest)
		return
	}
	doors := []models.Door{}

	if len(doorIDs) == 0 {
		http.Error(w, "400 missing door ids", http.StatusBadRequest)
		return
	}
	results := db.DB.Where(&doorIDs).Find(&doors)

	if results.RowsAffected != int64(len(doorIDs)) {
		http.Error(w, "40 one or more invalid door id/s", http.StatusBadRequest)
		return
	}

	err, role := helpers.GetFirstTable(w, models.Role{}, models.Role{Common: models.Common{Id: uint(rId)}})
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}

	err = db.DB.Model(&role).Association("Doors").Replace(&doors)
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, &role)
}

func GetDoorAssociations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, rId := helpers.ParseInt(w, r, "roleId")
	if err != nil {
		return
	}
	role := models.Role{Common: models.Common{Id: rId}}
	doors := []models.Door{}
	err = db.DB.Model(&role).Association("Doors").Find(&doors)
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, &doors)
}
