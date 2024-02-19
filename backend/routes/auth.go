package routes

import (
	"api/controller"

	"github.com/go-chi/chi/v5"
)

func AuthRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/register/request", controller.RegisterRequest)
	r.Post("/register/response", controller.RegisterResponse)
	r.Get("/keys", controller.GetKeys)
	return r
}
