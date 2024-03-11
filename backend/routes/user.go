package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func UsersRoute() chi.Router {
	r := chi.NewRouter()
	r.Get("/", controller.GetAllUsers)
	r.Get("/{userId}", controller.GetUser)
	r.Get("/login", controller.GetUserByEmail)
	r.Put("/", controller.UpdateUser)
	r.Post("/", controller.CreateUser)
	r.Delete("/{userId}", controller.DeleteUser)
	r.Get("/{userId}/roles", controller.GetRoleAssociations)
	r.Get("/{userId}/creds", controller.GetCredAssociations)
	return r
}
