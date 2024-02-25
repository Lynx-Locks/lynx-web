package controller

import (
	"api/config"
	"api/helpers"
	"api/models"
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"log"
	"net/http"
	"strconv"
)

func GetAllRoles(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, roles := helpers.GetAllTable(w, []models.Role{})
	if err == nil {
		helpers.JsonWriter(w, roles)
	}
	roles = []models.Role{}
	config.DB.Preload("Doors").Find(&roles)
	helpers.JsonWriter(w, roles)
}

func CreateRole(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var role models.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	// essentially reset if the user inputted anything to common as it should not be editable
	role.Common = models.Common{}
	err2, role := helpers.CreateNewRecord(w, role, err)
	if err2 == nil {
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

func UpsertDoorAssociation(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	rId, err := strconv.ParseUint(chi.URLParam(r, "roleId"), 10, 32)
	if err != nil {
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	doorIDs := []uint{}
	err = json.NewDecoder(r.Body).Decode(&doorIDs)
	if err != nil {
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	doors := []models.Door{}
	json.NewEncoder(w).Encode(&doors)
	if len(doorIDs) == 0 {
		log.Println("HUH")
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	results := config.DB.Where(&doorIDs).Find(&doors)
	json.NewEncoder(w).Encode(&results.RowsAffected)
	if results.RowsAffected != int64(len(doorIDs)) {
		http.Error(w, "400", http.StatusBadRequest)
		return
	}

	err, role := helpers.GetFirstTable(w, models.Role{}, models.Role{Common: models.Common{Id: uint(rId)}})
	if err != nil {
		return
	}

	config.DB.Debug().Model(&role).Association("Doors").Replace(&doors)
	json.NewEncoder(w).Encode(&role)
}

func GetDoorAssociations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	rId, err := strconv.ParseUint(chi.URLParam(r, "roleId"), 10, 32)
	if err != nil {
		http.Error(w, "400", http.StatusBadRequest)
		return
	}
	role := models.Role{Common: models.Common{Id: uint(rId)}}
	doors := []models.Door{}
	config.DB.Model(&role).Association("Doors").Find(&doors)
	json.NewEncoder(w).Encode(&doors)
}
