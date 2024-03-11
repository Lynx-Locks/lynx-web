package config

import (
	db2 "api/db"
	"api/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"os"
	"path/filepath"
)

func Connect() {
	dbpath := filepath.Join(".", "data")
	err := os.MkdirAll(dbpath, os.ModePerm)
	if err != nil {
		panic("failed to create data directory")
	}
	db, err := gorm.Open(sqlite.Open("data/lynx-web.db"), &gorm.Config{TranslateError: true, Logger: logger.Default.LogMode(logger.Info)})
	if err != nil {
		panic("failed to connect database")
	}
	// Migrate the schema
	db.AutoMigrate(&models.User{}, &models.Credential{}, &models.Role{}, &models.ActiveTokens{}, &models.Door{}, &models.SessionData{})
	if err != nil {
		panic("failed to migrate database")
	}
	db2.DB = db
}
