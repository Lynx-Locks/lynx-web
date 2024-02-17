package models

type Door struct {
	Common
	Name        string `json:"name"`
	Description string `json:"description"`
	Roles       []*Key `gorm:"many2many:role_door;"`
}
