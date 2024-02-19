package models

type Rp struct {
	Name string `json:"name" default:"Lynx Locks"`
}

type UserInfo struct {
	Id          string `json:"id"`
	Name        string `json:"name"`
	DisplayName string `json:"display_name"`
}

type PubKeyCredParams struct {
	Type string `json:"type"`
	Alg  int    `json:"alg"`
}

type ExcludeCredentials struct {
	Id         string   `json:"id"`
	Type       string   `json:"type"`
	Transports []string `json:"transports"`
}

type AuthenticatorSelection struct {
	AuthenticatorAttachment string `json:"authenticator_attachment"`
	RequireResidentKey      bool   `json:"require_resident_key"`
}

type WebAuthnOptions struct {
	Challenge              []byte                 `json:"challenge"`
	Rp                     Rp                     `json:"rp"` // TODO: experiment with id attribute as well
	User                   UserInfo               `json:"user"`
	PubKeyCredParams       []PubKeyCredParams     `json:"pub_key_cred_params"`
	ExcludeCredentials     []ExcludeCredentials   `json:"exclude_credentials,omitempty"` // TODO: figure out how to use this (/if we need it) to prevent user from making multiple creds
	AuthenticatorSelection AuthenticatorSelection `json:"authenticator_selection"`
}

type UserReq struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email,omitempty"`
	IsAdmin bool   `json:"is_admin,string,default;False"`
}

authenticatorAttachment
:
"platform"
id
:
"5Hn5Xwlc9Jk4EKOBsL9hMpaYrNk"
rawId
:
"5Hn5Xwlc9Jk4EKOBsL9hMpaYrNk"
response
:
{,…}
type
:
"public-key"
