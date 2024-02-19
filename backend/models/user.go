package models

import (
	"errors"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	Common
	Name       string    `json:"name"`
	Email      string    `gorm:"unique" json:"email"`
	IsAdmin    bool      `json:"is_admin,default;False"`
	WebauthnId uuid.UUID `gorm:"type:uuid" json:"webauthnId"`
}

type UserReq struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email,omitempty"`
	IsAdmin bool   `json:"is_admin,default;False"`
}

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	webauthnId, err := uuid.NewUUID()
	u.WebauthnId = webauthnId
	if err != nil {
		err = errors.New("can't save invalid data")
	}
	return
}

func (user User) WebAuthnID() []byte {
	bin, err := user.WebauthnId.MarshalBinary()
	if err != nil {
		// TODO: handle err
	}
	return bin
}

func (user User) WebAuthnName() string {
	return user.Email
}

func (user User) WebAuthnDisplayName() string {
	return user.Name
}

func (user User) WebAuthnIcon() string {
	return ""
}

func (user User) WebAuthnCredentials() []webauthn.Credential {
	return []webauthn.Credential{}
}
