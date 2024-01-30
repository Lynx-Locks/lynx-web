package controller

import (
	"api/config"
	"api/models"
	"encoding/json"
	"net/http"
)

func GetAllUsers(w http.ResponseWriter, r *http.Request) {
	users := []models.User{}
	config.DB.Find(&users)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(&users)
}
