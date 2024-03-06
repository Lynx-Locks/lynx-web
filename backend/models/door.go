package models

type Door struct {
	Id          uint   `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Roles       []Role `json:"roles,omitempty" gorm:"many2many:role_door;"`
}

func (door Door) GetId() uint { return door.Id }
