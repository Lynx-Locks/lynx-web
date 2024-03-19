package models

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
	"time"
)

type ActiveTokens struct {
	Id         uuid.UUID `gorm:"primaryKey" json:"id"`
	UserId     uint      `json:"userId"`
	User       User
	ExpiryDate int64 `json:"expiryDate"`
}

func (a *ActiveTokens) BeforeCreate(tx *gorm.DB) error {
	if a.ExpiryDate == 0 {
		a.ExpiryDate = time.Now().AddDate(0, 1, 0).Unix()
	}
	return nil
}
