package models

import (
	"time"
)

type Credential struct {
	WebauthnId      []byte `gorm:"serializer:json;primaryKey" json:"webauthnId"`
	UserId          uint   `json:"userId"`
	User            User
	Roles           []Role        `gorm:"many2many:key_role;"`
	PublicKey       []byte        `gorm:"serializer:json" json:"publicKey"`
	Expiration      uint          `json:"expiration"` // unix timestamp
	LatestAccess    time.Time     `json:"latestAccess"`
	AttestationType string        `json:"attestationType"`
	Transport       []string      `gorm:"serializer:json" json:"transport"`
	Flags           Flags         `gorm:"serializer:json" json:"flags"`
	Authenticator   Authenticator `gorm:"serializer:json" json:"authenticator"`
}

type Flags struct {
	UserPresent    bool `json:"userPresent"`
	UserVerified   bool `json:"userVerified"`
	BackupEligible bool `json:"backupEligible"`
	BackupState    bool `json:"backupState"`
}

type Authenticator struct {
	AAGUID       []byte `gorm:"serializer:json" json:"AAGUID"`
	SignCount    uint32 `json:"signCount"`
	CloneWarning bool   `json:"cloneWarning"`
	Attachment   string `json:"attachment"`
}
