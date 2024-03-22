package controller

import (
	"api/db"
	"api/helpers"
	"api/models"
	"fmt"
	"gorm.io/gorm"
	"net/http"
)

func DeleteSessionData(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	res := db.DB.Session(&gorm.Session{AllowGlobalUpdate: true}).Delete(&models.SessionData{})
	if res.Error != nil {
		http.Error(w, "Unable to delete session data", http.StatusInternalServerError)
		return
	}
	helpers.JsonWriter(w, fmt.Sprintf("Successfully deleted %d rows from session data", res.RowsAffected))
}
