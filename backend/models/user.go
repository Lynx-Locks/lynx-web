package models

import (
	"api/db"
	"errors"
	"github.com/go-webauthn/webauthn/protocol"
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
	credentials := []Credential{}

	result := db.DB.Table(
		"credentials",
	).Joins(
		"LEFT JOIN keys ON keys.public_key = credentials.public_key",
	).Joins(
		"LEFT JOIN users ON keys.user_id = users.id",
	).Find(&credentials)

	if result.Error != nil {
		return []webauthn.Credential{}
	}

	var credentialsFinal = make([]webauthn.Credential, 0)

	for _, cred := range credentials {
		var transport = make([]protocol.AuthenticatorTransport, 0)
		for _, tp := range cred.Transport {
			transport = append(transport, protocol.AuthenticatorTransport(tp))
		}
		credentialsFinal = append(credentialsFinal, webauthn.Credential{
			ID:              cred.Id,
			PublicKey:       cred.PublicKey,
			AttestationType: cred.AttestationType,
			Transport:       transport,
			Flags: webauthn.CredentialFlags{
				UserPresent:    cred.Flags.UserPresent,
				UserVerified:   cred.Flags.UserVerified,
				BackupEligible: cred.Flags.BackupEligible,
				BackupState:    cred.Flags.BackupState,
			},
			Authenticator: webauthn.Authenticator{
				AAGUID:       cred.Authenticator.AAGUID,
				SignCount:    cred.Authenticator.SignCount,
				CloneWarning: cred.Authenticator.CloneWarning,
				Attachment:   protocol.AuthenticatorAttachment(cred.Authenticator.Attachment),
			},
		})
	}

	return credentialsFinal
}
