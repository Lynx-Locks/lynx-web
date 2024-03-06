package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func DoorsRoute() chi.Router {
	r := chi.NewRouter()
	r.Get("/", controller.GetAllDoors)
	r.Post("/", controller.CreateDoor)
	r.Put("/", controller.UpdateDoor)
	r.Delete("/{doorId}", controller.DeleteDoor)
	return r
}
