package routes

import (
	"api/controller"

	"github.com/go-chi/chi/v5"
)

func WebAuthnRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/register/request/{userId}", controller.RegisterRequest)
	r.Post("/register/response/{userId}", controller.RegisterResponse)
	r.Post("/authorize/request", controller.AuthorizeRequest)
	r.Post("/authorize/response/{challenge}", controller.AuthorizeResponse)
	return r
}
