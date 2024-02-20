package models

type Rp struct {
	Id   string `json:"id" default:"localhost"`
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

type SigninReq struct {
	RpId      string `json:"rp_id"`
	Challenge []byte `json:"challenge"`
}

type AuthReq struct {
	Id                      string `json:"id"`
	AuthenticatorAttachment string `json:"authenticator_attachment"`
	Type                    string `json:"type"`
	// might require user field or some other identifying info
}
