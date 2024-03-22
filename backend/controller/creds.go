package controller

import (
	"api/db"
	"api/helpers"
	"api/models"
	"gorm.io/gorm"
	"net/http"
)

func DeleteSessionData(w http.ResponseWriter, r *http.Request) {
	res := db.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.SessionData{})
	if res.Error != nil {
		http.Error(w, "Unable to delete session data", http.StatusInternalServerError)
		return
	}
	helpers.JsonWriter(w, "Session data successfully deleted")
}
