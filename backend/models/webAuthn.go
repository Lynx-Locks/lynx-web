package models

import (
	"github.com/go-webauthn/webauthn/protocol"
	"time"
)

type SessionData struct {
	Challenge            string    `json:"challenge"`
	UserId               []byte    `gorm:"serializer:json" json:"userId"`
	AllowedCredentialIds [][]byte  `gorm:"serializer:json" json:"allowedCredentials,omitempty"`
	Expires              time.Time `json:"expires"`

	UserVerification protocol.UserVerificationRequirement `gorm:"serializer:json" json:"userVerification"`
	Extensions       protocol.AuthenticationExtensions    `gorm:"serializer:json" json:"extensions,omitempty"`
}

type response struct {
	AttestationObject string   `json:"attestationObject"`
	ClientDataJson    string   `json:"clientDataJson"`
	Transports        []string `json:"transports"`
}

type CompleteRegistration struct {
	Id                      string   `json:"id"`
	RawId                   string   `json:"rawId"`
	AuthenticatorAttachment string   `json:"authenticatorAttachment"`
	Response                response `json:"response"`
	Type                    string   `json:"type"`
	Challenge               string   `json:"challenge"`
}
