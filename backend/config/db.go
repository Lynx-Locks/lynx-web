package config

import (
	db2 "api/db"
	"api/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"os"
	"path/filepath"
)

func Connect() {
	dbpath := filepath.Join(".", "data")
	err := os.MkdirAll(dbpath, os.ModePerm)
	if err != nil {
		panic("failed to create data directory")
	}
	db, err := gorm.Open(sqlite.Open("data/lynx-web.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	// Migrate the schema
	db.AutoMigrate(&models.User{}, &models.Key{}, &models.Role{}, &models.ActiveTokens{}, &models.Door{}, &models.SessionData{}, &models.Credential{})
	if err != nil {
		panic("failed to migrate database")
	}
	db2.DB = db
}
