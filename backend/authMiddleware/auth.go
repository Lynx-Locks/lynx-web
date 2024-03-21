package authMiddleware

import (
	"api/auth"
	"api/db"
	"api/models"
	"fmt"
	"github.com/go-chi/jwtauth"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/jwt"
	log "github.com/sirupsen/logrus"
	"net/http"
)

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
func VerifyAdmin(redirect bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, claims, err := jwtauth.FromContext(r.Context())

			if err != nil {
				log.WithError(err).Warn("no token found")
				if redirect {
					http.Redirect(w, r, "/login/?next="+r.URL.Path, http.StatusSeeOther)
				} else {
					http.Error(w, "no token found", http.StatusUnauthorized)
				}
				return
			}

			if token == nil || jwt.Validate(token) != nil || claims == nil {
				log.WithField("status", http.StatusUnauthorized).Error("invalid jwt token")
				if redirect {
					http.Redirect(w, r, "/denied", http.StatusSeeOther)
				} else {
					http.Error(w, "invalid token", http.StatusUnauthorized)
				}
				return
			}

			if !verifySession(w, r, redirect, claims) {
				return
			}

			isAdmin, ok := claims["isAdmin"]
			if !ok || !isAdmin.(bool) {
				log.WithField("status", http.StatusUnauthorized).Warn("user is not admin")
				if redirect {
					http.Redirect(w, r, "/denied", http.StatusSeeOther)
				} else {
					http.Error(w, "unauthorized", http.StatusUnauthorized)
				}
				return
			}

			// Token is authenticated, pass it through
			next.ServeHTTP(w, r)
		})
	}
}

func VerifyUser(redirect bool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token, claims, err := jwtauth.FromContext(r.Context())

			if err != nil {
				log.WithError(err).Warn("no token found")
				if redirect {
					http.Redirect(w, r, "/login/?next="+r.URL.Path, http.StatusSeeOther)
				} else {
					http.Error(w, "no token found", http.StatusUnauthorized)
				}
				return
			}

			if token == nil || jwt.Validate(token) != nil || claims == nil {
				log.WithField("status", http.StatusUnauthorized).Error("invalid jwt token")
				if redirect {
					http.Redirect(w, r, "/denied", http.StatusSeeOther)
				} else {
					http.Error(w, "invalid token", http.StatusUnauthorized)
				}
				return
			}

			if !verifySession(w, r, redirect, claims) {
				return
			}

			// Token is authenticated, pass it through
			next.ServeHTTP(w, r)
		})
	}
}

func VerifyNotLoggedIn(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		token, claims, err := jwtauth.FromContext(r.Context())

		if err == nil && token != nil && jwt.Validate(token) == nil && claims != nil && verifySession(w, r, true, claims) {
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

func verifySession(w http.ResponseWriter, r *http.Request, redirect bool, claims map[string]interface{}) bool {
	sessionId, ok := claims["sessionId"]
	if !ok {
		log.WithField("status", http.StatusUnauthorized).Error("sessionId missing in jwt")
		auth.ClearCookie(w)
		if redirect {
			http.Redirect(w, r, "/denied", http.StatusSeeOther)
		} else {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
		}
		return false
	}
	if _, ok := auth.ActiveSessions[sessionId.(string)]; !ok {
		log.Warn("token expired")
		auth.ClearCookie(w)
		if redirect {
			http.Redirect(w, r, "/login/?next="+r.URL.Path, http.StatusSeeOther)
		} else {
			http.Error(w, "token expired", http.StatusUnauthorized)
		}
		return false
	}
	return true
}
