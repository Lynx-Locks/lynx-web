package controller

import (
	"api/db"
	"api/dbHelpers"
	"api/helpers"
	"api/models"
	"encoding/json"
	"net/http"
)

func GetAllRoles(w http.ResponseWriter, _ *http.Request) {
	err, roles := dbHelpers.GetAllTable(w, []models.Role{})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, roles)
}

func UpdateRole(w http.ResponseWriter, r *http.Request) {
	reqRole := models.Role{}
	err := json.NewDecoder(r.Body).Decode(&reqRole)
	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
		return
	}
	ids := dbHelpers.GetAllIdsFromList(reqRole.Doors)
	err, role := dbHelpers.GetFirstTable(w, models.Role{}, models.Role{Id: reqRole.Id})
	if err != nil {
		http.Error(w, "Invalid Role", http.StatusBadRequest)
		return
	}
	doors := []models.Door{}
	if len(ids) != 0 {
		res := db.DB.Find(&doors, ids)
		if res.Error != nil {
			dbHelpers.DBErrorHandling(res.Error, w)
			return
		}
		if len(doors) != len(ids) {
			http.Error(w, "One or more invalid doors", http.StatusBadRequest)
			return
		}
		role.Doors = doors
	}
	if reqRole.Name != "" {
		role.Name = reqRole.Name
	}
	err, role = dbHelpers.UpdateObject(w, role)
	if err != nil {
		return
	}
	err = db.DB.Model(&role).Association("Doors").Replace(&doors)
	helpers.JsonWriter(w, role)
}

func CreateRole(w http.ResponseWriter, r *http.Request) {
	var role models.Role
	err := json.NewDecoder(r.Body).Decode(&role)
	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
		return
	}
	doorIds := dbHelpers.GetAllIdsFromList(role.Doors)
	if len(doorIds) != 0 {
		doors := []models.Door{}
		res := db.DB.Find(&doors, doorIds)
		if res.Error != nil {
			dbHelpers.DBErrorHandling(res.Error, w)
			return
		}
		if len(doors) != len(doorIds) {
			http.Error(w, "One or more invalid roles", http.StatusBadRequest)
			return
		}
		role.Doors = doors
	}
	userIds := dbHelpers.GetAllIdsFromList(role.Users)
	if len(userIds) != 0 {
		users := []models.User{}
		res := db.DB.Find(&users, userIds)
		if res.Error != nil {
			dbHelpers.DBErrorHandling(res.Error, w)
			return
		}
		if len(users) != len(userIds) {
			http.Error(w, "One or more invalid users", http.StatusBadRequest)
			return
		}
		role.Users = users
	}
	err, role = dbHelpers.CreateNewRecord(w, role)
	if err != nil {
		return
	}
	helpers.JsonWriter(w, role)
}

func DeleteRole(w http.ResponseWriter, r *http.Request) {
	err, rId := helpers.ParseInt(w, r, "roleId")
	if err != nil {
		return
	}
	err = dbHelpers.DeleteObjandAssociationsByPk(w, models.Role{Id: rId})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, "Delete Successful")
}

func ReplaceDoorAssociation(w http.ResponseWriter, r *http.Request) {
	err, rId := helpers.ParseInt(w, r, "roleId")
	if err != nil {
		return
	}
	doorIds := struct {
		DoorIds []uint `json:"doorIds"`
	}{}
	err = json.NewDecoder(r.Body).Decode(&doorIds)
	if err != nil {
		http.Error(w, "Malformed doorIDs", http.StatusBadRequest)
		return
	}
	doors := []models.Door{}

	if len(doorIds.DoorIds) == 0 {
		http.Error(w, "Missing door ids", http.StatusBadRequest)
		return
	}
	results := db.DB.Where(&doorIds.DoorIds).Find(&doors)

	if results.RowsAffected != int64(len(doorIds.DoorIds)) {
		http.Error(w, "One or more invalid door id/s", http.StatusBadRequest)
		return
	}

	err, role := dbHelpers.GetFirstTable(w, models.Role{}, models.Role{Id: rId})
	if err != nil {
		dbHelpers.DBErrorHandling(err, w)
		return
	}

	err = db.DB.Model(&role).Association("Doors").Replace(&doors)
	if err != nil {
		dbHelpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, role)
}
func GetDoorAssociations(w http.ResponseWriter, r *http.Request) {
	err, rId := helpers.ParseInt(w, r, "roleId")
	if err != nil {
		return
	}
	role := models.Role{Id: rId}
	doors := []models.Door{}
	err = db.DB.Model(&role).Association("Doors").Find(&doors)
	if err != nil {
		dbHelpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, doors)
}
