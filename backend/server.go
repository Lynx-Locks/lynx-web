package main

import (
	"api/auth"
	"api/config"
	"api/helpers"
	"api/routes"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/acme/autocert"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path/filepath"
	"strings"
)

// See https://github.com/go-chi/chi for documentation

func init() {
	if value, ok := os.LookupEnv("NODE_ENV"); !ok || value != "production" {
		err := godotenv.Load("../.env")
		if err != nil {
			panic("Error loading .env file")
		}
	}

	if value, ok := os.LookupEnv("JWT_SECRET"); ok {
		auth.TokenAuth = jwtauth.New("HS256", []byte(value), nil)
	} else {
		panic("JWT_SECRET environment variable not set")
	}

	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		// List of all BAKED environment variables to replace.
		// If the given env variable is not present on runtime, the preset is used as default.
		allVars := []envVar{
			{key: "API_BASE_URL", preset: "/api"},
		}

		// Replace all BAKED environment variables in frontend with current runtime environment variables.
		err := filepath.Walk("/static/_next", func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}

			if !info.IsDir() && filepath.Ext(path) == ".js" {
				err := replaceVarsInFile(path, allVars)
				if err != nil {
					fmt.Printf("Error replacing vars in file %s: %v\n", path, err)
				}
			}

			return nil
		})

		if err != nil {
			fmt.Printf("Error walking the path: %v\n", err)
		}
	}
}

func main() {
	var origins []string
	var clientDomain string
	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		if domain, ok := os.LookupEnv("CLIENT_DOMAIN"); ok {
			clientDomain = domain
			origins = []string{fmt.Sprintf("https://%s*", domain)}
		} else {
			panic("Missing CLIENT_DOMAIN environment variable")
		}
	} else {
		origins = []string{"http://localhost:3000*"}
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins: origins,
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
	}))
	config.Connect()

	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		FileServer(r, "/", http.Dir("./static"))
	} else {
		target := "http://frontend:3000"
		targetURL, _ := url.Parse(target)
		proxy := httputil.NewSingleHostReverseProxy(targetURL)

		r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
			proxy.ServeHTTP(w, r)
		})
	}

	r.Mount("/api", api())

	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		port := 443

		m := &autocert.Manager{
			Cache:      autocert.DirCache("cert-cache"),
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(clientDomain),
		}

		server := &http.Server{
			Addr:      fmt.Sprintf(":%d", port),
			Handler:   r,
			TLSConfig: m.TLSConfig(),
		}

		fmt.Printf("Server running on port %d\n", port)

		// Listen on port 80 with http-01 challenge handler (Let's Encrypt)
		go func() {
			err := http.ListenAndServe(":80", m.HTTPHandler(nil))
			helpers.CheckErr(err)
		}()

		// Listen on port 443 with our custom application handler
		err := server.ListenAndServeTLS("", "")
		helpers.CheckErr(err)
	} else {
		port := 5001

		fmt.Printf("Server running on port %d\n", port)
		err := http.ListenAndServe(fmt.Sprintf(":%d", port), r)
		helpers.CheckErr(err)
	}
}

func api() chi.Router {
	r := chi.NewRouter()
	r.Mount("/users", routes.UsersRoute())
	r.Mount("/auth", routes.WebAuthnRoute())
	r.Mount("/login", routes.LoginRoute())
	r.Mount("/logout", routes.LogoutRoute())
	r.Mount("/doors", routes.DoorsRoute())
	r.Mount("/roles", routes.RolesRoute())
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

type envVar struct {
	key    string
	preset string
}

func replaceVarsInFile(filePath string, vars []envVar) error {
	content, err := os.ReadFile(filePath)
	if err != nil {
		return err
	}

	for _, v := range vars {
		bakedVar := fmt.Sprintf("BAKED_%s", v.key)
		value, ok := os.LookupEnv(v.key)
		if !ok {
			value = v.preset
		}
		content = []byte(strings.ReplaceAll(string(content), bakedVar, value))
	}

	err = os.WriteFile(filePath, content, 0644)
	if err != nil {
		return err
	}

	return nil
}
