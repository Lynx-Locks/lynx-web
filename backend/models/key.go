package models

import (
	"time"
)

type Key struct {
	Common
	UserId       uint `json:"user_id"`
	User         User
	Roles        []*Role   `gorm:"many2many:key_role;"`
	PublicKey    string    `json:"public_key"`
	Expiration   uint      `json:"expiration"` // unix timestamp
	LatestAccess time.Time `json:"latest_access"`
}
