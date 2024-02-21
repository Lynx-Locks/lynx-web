package models

import (
	"time"
)

type Key struct {
	Common
	UserId       uint `json:"userId"`
	User         User
	Roles        []*Role   `gorm:"many2many:key_role;"`
	PublicKey    []byte    `gorm:"serializer:json" json:"publicKey"`
	Expiration   uint      `json:"expiration"` // unix timestamp
	LatestAccess time.Time `json:"latestAccess"`
}
