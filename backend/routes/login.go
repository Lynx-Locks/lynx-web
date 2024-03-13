package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func LoginRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/request/{userId}", controller.LoginRequest)
	r.Post("/{userId}", controller.LoginResponse)
	return r
}

func LogoutRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/", controller.LogoutRequest)
	return r
}
