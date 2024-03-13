package auth

import (
	"github.com/go-chi/jwtauth"
	"github.com/lestrrat-go/jwx/jwt"
	log "github.com/sirupsen/logrus"
	"net/http"
)

var TokenAuth *jwtauth.JWTAuth
var ActiveSessions = map[string]bool{}

func VerifyAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := jwtauth.FromContext(r.Context())

		if err != nil {
			log.WithError(err).Warn("no token found")
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		if token == nil || jwt.Validate(token) != nil || claims == nil {
			log.Error("invalid token in jwt")
			http.Error(w, "invalid token", 401)
			return
		}

		if !verifySession(w, r, claims) {
			return
		}

		isAdmin, ok := claims["isAdmin"]
		if !ok || !isAdmin.(bool) {
			http.Error(w, "user not admin", 401)
			return
		}

		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

func VerifyUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := jwtauth.FromContext(r.Context())

		if err != nil {
			log.WithError(err).Warn("no token found")
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		if token == nil || jwt.Validate(token) != nil || claims == nil {
			log.Error("invalid token in jwt")
			http.Error(w, "invalid token", 401)
			return
		}

		if !verifySession(w, r, claims) {
			return
		}

		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

func verifySession(w http.ResponseWriter, r *http.Request, claims map[string]interface{}) bool {
	sessionId, ok := claims["sessionId"]
	if !ok {
		log.Error("sessionId missing in jwt")
		ClearCookie(w)
		http.Error(w, http.StatusText(401), 401)
		return false
	}
	if _, ok := ActiveSessions[sessionId.(string)]; !ok {
		log.Warn("token expired")
		ClearCookie(w)
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return false
	}
	return true
}

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
