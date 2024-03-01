package main

import (
	"api/config"
	"api/helpers"
	"api/routes"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"golang.org/x/crypto/acme/autocert"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// See https://github.com/go-chi/chi for documentation

const PORT = 5001 // todo: put into environment var

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000*", "https://app.lynx-locks.com*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	}))
	config.Connect()
	FileServer(r, "/", http.Dir("./static"))
	r.Mount("/api", api())

	var PORT int
	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		PORT = 443

		m := &autocert.Manager{
			Cache:      autocert.DirCache("cert-cache"),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist("app.lynx-locks.com"),
		}

		server := &http.Server{
			Addr:      fmt.Sprintf(":%d", PORT),
			Handler:   r,
			TLSConfig: m.TLSConfig(),
		}

		fmt.Printf("Server running on port %d\n", PORT)
		go func() {
			err := http.ListenAndServe(":80", m.HTTPHandler(nil))
			helpers.CheckErr(err)
		}()

		err := server.ListenAndServeTLS("", "")
		helpers.CheckErr(err)
	} else {
		PORT = 5001

		fmt.Printf("Server running on port %d\n", PORT)
		err := http.ListenAndServe(fmt.Sprintf(":%d", PORT), r)
		helpers.CheckErr(err)
	}
}

func api() chi.Router {
	r := chi.NewRouter()
	r.Mount("/users", routes.UsersRoute())
	r.Mount("/auth", routes.AuthRoute())
	r.Mount("/roles", routes.RolesRoute())
	r.Mount("/doors", routes.DoorsRoute())
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("hello: world"))
	})
	return r
}

// FileServer conveniently sets up a http.FileServer handler to serve
// static files from a http.FileSystem.
func FileServer(r chi.Router, path string, root http.FileSystem) {
	if strings.ContainsAny(path, "{}*") {
		panic("FileServer does not permit any URL parameters.")
	}

	if path != "/" && path[len(path)-1] != '/' {
		r.Get(path, http.RedirectHandler(path+"/", 301).ServeHTTP)
		path += "/"
	}
	path += "*"

	r.Get(path, func(w http.ResponseWriter, r *http.Request) {
		rctx := chi.RouteContext(r.Context())
		pathPrefix := strings.TrimSuffix(rctx.RoutePattern(), "/*")
		fs := http.StripPrefix(pathPrefix, http.FileServer(root))
		fs.ServeHTTP(w, r)
	})
}
