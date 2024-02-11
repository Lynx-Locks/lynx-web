package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name    string
	Email   string
	IsAdmin bool `json:"default;False"`
}

type UserReq struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email,omitempty"`
	IsAdmin bool   `json:"is_admin,string,default;False"`
}
