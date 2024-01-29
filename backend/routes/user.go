package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func UsersRoute() chi.Router {
	r := chi.NewRouter()
	r.Get("/", controller.GetAllUsers)
	return r
}
