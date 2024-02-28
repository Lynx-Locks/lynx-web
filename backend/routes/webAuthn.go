package routes

import (
	"api/controller"

	"github.com/go-chi/chi/v5"
)

func WebAuthnRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/register/request/{userId}", controller.RegisterRequest)
	r.Post("/register/response/{userId}", controller.RegisterResponse)
	r.Post("/signin/request/{userId}", controller.SigninRequest)
	r.Post("/signin/response/{userId}", controller.SigninResponse)
	return r
}
