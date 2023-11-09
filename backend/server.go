package main

import (
	"api/helpers"
	"fmt"
	"github.com/go-chi/chi/v5"
	"net/http"
)

// See https://github.com/go-chi/chi for documentation

const PORT = 5001 // todo: put into environment var

func main() {
	r := chi.NewRouter()
	r.Mount("/api", api())

	fmt.Printf("Server running on port %d\n", PORT)
	err := http.ListenAndServe(fmt.Sprintf(":%d", PORT), r)
	helpers.CheckErr(err)
}

// todo: folder for API routes (ex: /users, /admin, etc.)
func api() chi.Router {
	r := chi.NewRouter()
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello: world"))
	})
	return r
}
