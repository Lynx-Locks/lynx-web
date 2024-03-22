package routes

import (
	"api/controller"
	"github.com/go-chi/chi/v5"
)

func CredsRoute() chi.Router {
	r := chi.NewRouter()
	r.Delete("/session", controller.DeleteSessionData)
	return r
}
