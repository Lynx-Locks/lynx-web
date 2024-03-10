package controller

import (
	"api/db"
	"api/helpers"
	"api/models"
	"encoding/json"
	"errors"
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
	if err != nil {
		return
	}
	err, user := helpers.GetFirstTable(w, models.User{}, models.User{Id: uId})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, user)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	user := models.User{}
	err := json.NewDecoder(r.Body).Decode(&user)

	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
		return
	}
	err, user = helpers.UpdateObject(w, user)
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
	roles := user.Roles
	for i, _ := range roles {
		res := db.DB.First(&roles[i])
		if res.Error != nil {
			http.Error(w, "One or more invalid roles entered", http.StatusBadRequest)
			return
		}
	}
	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
	}
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

func ReplaceRoleAssociations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	roleIds := []uint{}
	err = json.NewDecoder(r.Body).Decode(&roleIds)
	if err != nil {
		http.Error(w, "Malformed roleIds", http.StatusBadRequest)
		return
	}

	if len(roleIds) == 0 {
		http.Error(w, "Missing role ids", http.StatusBadRequest)
		return
	}
	roles := []models.Role{}
	results := db.DB.Where(&roleIds).Find(&roles)
	if results.RowsAffected != int64(len(roleIds)) {
		http.Error(w, "One or more invalid door id/s", http.StatusBadRequest)
		return
	}

	credentials := []models.Credential{}
	db.DB.Find(&credentials, "user_id = ?", uId)
	for _, credential := range credentials {
		err = db.DB.Model(&credential).Association("Roles").Replace(&roles)
		if err != nil {
			http.Error(w, "Failed to add one or more roles", http.StatusInternalServerError)
			helpers.DBErrorHandling(err, w)
			return
		}
		helpers.JsonWriter(w, &credential)
	}

}

func GetAndReturnRoleAssociationsById(w http.ResponseWriter, uId uint) (error, []models.Role) {
	credentials := []models.Credential{}
	db.DB.Find(&credentials, "user_id = ?", uId)
	allRoles := []models.Role{}
	for _, credential := range credentials {
		roles := []models.Role{}
		err := db.DB.Model(&credential).Association("Roles").Find(&roles)
		if err != nil {
			http.Error(w, "Failed to get associations for one or more roles", http.StatusInternalServerError)
			helpers.DBErrorHandling(err, w)
			return errors.New("500"), nil
		}
		allRoles = append(allRoles, roles...)
	}
	return nil, helpers.RemoveDuplicates(allRoles)
}
func GetCredAssociations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	user := models.User{Id: uId}
	creds := []models.Credential{}
	err = db.DB.Model(&user).Association("Credentials").Find(&creds)
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, &creds)

}

func GetRoleAssociations(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	user := models.User{Id: uId}
	roles := []models.Role{}
	err = db.DB.Model(&user).Association("Roles").Find(&roles)
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, &roles)
}
