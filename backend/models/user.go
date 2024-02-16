package models

type User struct {
	Common
	Name    string `json:"name"`
	Email   string `json:"email"`
	IsAdmin bool   `json:"is_admin,default;False"`
}

type UserReq struct {
	Name    string `json:"name,omitempty"`
	Email   string `json:"email,omitempty"`
	IsAdmin bool   `json:"is_admin,string,default;False"`
}
