package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func AdminAuthRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/login/{userId}", controller.LoginHandler)
	return r
}
