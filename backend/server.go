package main

import (
	"api/config"
	"api/helpers"
	"api/routes"
	"fmt"
	"github.com/go-chi/chi/v5"
	"net/http"
)

// See https://github.com/go-chi/chi for documentation

const PORT = 5001 // todo: put into environment var

func main() {
	r := chi.NewRouter()
	config.Connect()
	r.Mount("/api", api())
	r.Mount("/api/users", routes.UsersRoute())
	fmt.Printf("Server running on port %d\n", PORT)
	err := http.ListenAndServe(fmt.Sprintf(":%d", PORT), r)
	helpers.CheckErr(err)
}

func api() chi.Router {
	r := chi.NewRouter()
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello: world"))
	})
	return r
}
