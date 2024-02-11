package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func UsersRoute() chi.Router {
	r := chi.NewRouter()
	r.Get("/", controller.GetAllUsers)
	r.Get("/{userId}", controller.GetUser)
	r.Post("/", controller.CreateUser)
	r.Delete("/{userId}", controller.DeleteUser)
	return r
}
