package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func RolesRoute() chi.Router {
	r := chi.NewRouter()
	r.Get("/", controller.GetAllRoles)
	r.Get("/{roleId}/doors", controller.GetDoorAssociations)
	r.Post("/{roleId}/doors", controller.ReplaceDoorAssociation)
	r.Patch("/{roleId}", controller.UpdateRole)
	r.Post("/", controller.CreateRole)
	r.Delete("/{roleId}", controller.DeleteRole)

	return r
}
