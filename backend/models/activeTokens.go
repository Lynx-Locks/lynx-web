package models

type ActiveTokens struct {
	Token  string `gorm:"primaryKey" json:"token"`
	UserId uint   `json:"userId"`
	User   User
	Roles  []*Role `gorm:"many2many:token_role;"`
}
