package models

import (
	"github.com/go-webauthn/webauthn/protocol"
	"time"
)

type SessionData struct {
	Challenge            string    `gorm:"primaryKey" json:"challenge"`
	UserId               []byte    `gorm:"serializer:json" json:"userId"`
	AllowedCredentialIds [][]byte  `gorm:"serializer:json" json:"allowedCredentials,omitempty"`
	Expires              time.Time `json:"expires"`

	UserVerification protocol.UserVerificationRequirement `gorm:"serializer:json" json:"userVerification"`
	Extensions       protocol.AuthenticationExtensions    `gorm:"serializer:json" json:"extensions,omitempty"`
}

type WebauthnResponseCommon struct {
	Id                      string `json:"id"`
	RawId                   string `json:"rawId"`
	AuthenticatorAttachment string `json:"authenticatorAttachment"`
	Type                    string `json:"type"`
	Challenge               string `json:"challenge"`
}

type registerResponse struct {
	AttestationObject string   `json:"attestationObject"`
	ClientDataJson    string   `json:"clientDataJson"`
	Transports        []string `json:"transports"`
}

type authorizeResponse struct {
	ClientDataJson    string `json:"clientDataJson"`
	AuthenticatorData string `json:"authenticatorData"`
	Signature         string `json:"signature"`
	UserHandle        string `json:"userHandle"`
}

type WebauthnRegisterResponse struct {
	WebauthnResponseCommon
	Response registerResponse `json:"response"`
}

type WebauthnAuthorizeResponse struct {
	WebauthnResponseCommon
	Response authorizeResponse `json:"response"`
}
