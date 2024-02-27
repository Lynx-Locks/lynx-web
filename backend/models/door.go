package models

type Door struct {
	Common
	Name        string `json:"name"`
	Description string `json:"description"`
	Roles       []Role `json:"roles,omitempty" gorm:"many2many:role_door;"`
}
