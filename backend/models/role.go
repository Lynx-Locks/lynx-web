package models

type Role struct {
	Common
	Name  string       `json:"name"`
	Doors []Door       `json:"doors,omitempty" gorm:"many2many:role_door;"`
	Keys  []Credential `json:"keys,omitempty" gorm:"many2many:key_role;"`
}
