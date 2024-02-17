package models

type ActiveTokens struct {
	Token  string `gorm:"primaryKey" json:"token"`
	UserId uint   `json:"user_id"`
	User   User
}
