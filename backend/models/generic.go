package models

import (
	"time"
)

type Common struct {
	Id        uint      `json:"id" gorm:"->"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type AllTables interface {
	User | Role | Door | Key | Common
}
