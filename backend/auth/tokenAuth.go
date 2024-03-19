package auth

import (
	"api/db"
	"api/models"
	"fmt"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"
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
			log.WithField("status", http.StatusUnauthorized).Error("invalid jwt token")
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		if !verifySession(w, r, claims) {
			return
		}

		isAdmin, ok := claims["isAdmin"]
		if !ok || !isAdmin.(bool) {
			log.WithField("status", http.StatusUnauthorized).Warn("user is not admin")
			http.Redirect(w, r, "/denied", http.StatusSeeOther)
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
			log.WithField("status", http.StatusUnauthorized).Error("invalid jwt token")
			http.Error(w, "invalid token", http.StatusUnauthorized)
			return
		}

		if !verifySession(w, r, claims) {
			return
		}

		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

func VerifyNotLoggedIn(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := jwtauth.FromContext(r.Context())

		if err == nil && token != nil && jwt.Validate(token) == nil && claims != nil && verifySession(w, r, claims) {
			if isAdmin, ok := claims["isAdmin"]; ok && isAdmin.(bool) {
				log.WithField("status", http.StatusSeeOther).Info("admin already logged in")
				http.Redirect(w, r, "/admin", http.StatusSeeOther)
				return
			} else {
				log.WithField("status", http.StatusSeeOther).Info("user already logged in")
				http.Redirect(w, r, "/", http.StatusSeeOther)
				return
			}
		}

		// Token is authenticated, pass it through
		next.ServeHTTP(w, r)
	})
}

func InitialAdminCheck(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var count int64
		db.DB.Model(&models.ActiveTokens{Id: uuid.Max}).Count(&count)
		adminTokenExists := count > 0
		db.DB.Model(&models.User{}).Count(&count)
		onlyAdminExists := count == 1
		if adminTokenExists && onlyAdminExists {
			log.WithField("status", http.StatusSeeOther).Info("no users exist, redirecting to initial admin register")
			http.Redirect(w, r, fmt.Sprintf("/register/?token=%s", uuid.Max.String()), http.StatusSeeOther)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func verifySession(w http.ResponseWriter, r *http.Request, claims map[string]interface{}) bool {
	sessionId, ok := claims["sessionId"]
	if !ok {
		log.WithField("status", http.StatusUnauthorized).Error("sessionId missing in jwt")
		ClearCookie(w)
		http.Error(w, http.StatusText(401), http.StatusUnauthorized)
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
