package models

type Role struct {
	Common
	Name  string `json:"name"`
	Doors []Door `json:"doors,omitempty" gorm:"many2many:role_door;"`
}
