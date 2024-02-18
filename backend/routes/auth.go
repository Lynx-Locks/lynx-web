package routes

import (
	"api/controller"

	"github.com/go-chi/chi/v5"
)

func AuthRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/register/request", controller.RegisterRequest)
<<<<<<< HEAD
=======
	r.Post("/register/response", controller.RegisterResponse)
>>>>>>> 2ba4abb (WIP implement authentication flow)
	r.Post("/register/response", controller.RegisterResponse)
	r.Get("/keys", controller.GetKeys)
	r.Post("/signin/request", controller.SigninRequest)
	r.Post("/signin/response", controller.SigninResponse)
	return r
}
