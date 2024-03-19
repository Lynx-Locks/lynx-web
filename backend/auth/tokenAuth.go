package auth

import (
	"github.com/go-chi/jwtauth"
	"net/http"
)

var TokenAuth *jwtauth.JWTAuth
var ActiveSessions = map[string]uint{}

func ClearCookie(w http.ResponseWriter) {
	// Delete (expire) the invalidated cookie
	cookie := http.Cookie{
		Name:   "jwt",
		Value:  "",
		Path:   "/",
		MaxAge: -1,
	}
	http.SetCookie(w, &cookie)
}

func ClearAllSessions(uId uint) {
	for key, val := range ActiveSessions {
		if val == uId {
			delete(ActiveSessions, key)
		}
	}
}
