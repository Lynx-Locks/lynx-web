package routes

import (
	"api/controller"

	"github.com/go-chi/chi/v5"
)

func AuthRoute() chi.Router {
	r := chi.NewRouter()
	r.Get("/registerRequest", controller.RegisterRequest)
	r.Get("/registerResponse", controller.RegisterResponse)
	r.Get("/getKeys", controller.GetKeys)
	return r
}
