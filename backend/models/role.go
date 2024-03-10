package models

type Role struct {
	Id    uint   `json:"id"`
	Name  string `json:"name"`
	Doors []Door `json:"doors,omitempty" gorm:"many2many:role_door;"`
	Users []User `json:"users,omitempty" gorm:"many2many:user_role;"`
}

func (role Role) GetId() uint { return role.Id }
