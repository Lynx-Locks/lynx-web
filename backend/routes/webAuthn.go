package routes

import (
	"api/controller"

	"github.com/go-chi/chi/v5"
)

func WebAuthnRoute() chi.Router {
	r := chi.NewRouter()
	r.Post("/register/request/{token}", controller.RegisterRequest)
	r.Post("/register/response/{token}/{yubiKeyId}", controller.RegisterResponse)
	r.Post("/authorize/request", controller.AuthorizeRequest)
	r.Post("/authorize/response/{doorId}/{challenge}", controller.AuthorizeResponse)
	r.Get("/authorize/{doorId}/{yubiKeyId}", controller.GetYubiKeyDoorAccess)
	r.Delete("/sessionData", controller.DeleteSessionData)
	r.Get("/unlocked/{doorId}", controller.IsDoorOpen)
	return r
}
