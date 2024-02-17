package models

type Role struct {
	Common
	Name string  `json:"name"`
	Keys []*Key  `gorm:"many2many:key_role;"`
	Door []*Door `gorm:"many2many:role_door;"`
}
