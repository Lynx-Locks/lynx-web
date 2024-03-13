package auth

import "github.com/go-chi/jwtauth"

var TokenAuth *jwtauth.JWTAuth
var ActiveSessions = map[string]bool{}
