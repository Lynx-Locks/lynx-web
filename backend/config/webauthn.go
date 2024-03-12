package config

import (
	"fmt"
	"github.com/go-webauthn/webauthn/webauthn"
	"os"
)

var (
	WebAuthn *webauthn.WebAuthn
	err      error
)

func init() {
	var id string
	var origins []string
	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		if domain, ok := os.LookupEnv("CLIENT_DOMAIN"); ok {
			id = domain
			origins = []string{fmt.Sprintf("https://%s", domain)}
		} else {
			panic("Missing CLIENT_DOMAIN environment variable")
		}
	} else {
		id = "localhost"
		origins = []string{"http://localhost:3000", "http://localhost:5001"}
	}

	wconfig := &webauthn.Config{
		RPDisplayName: "Lynx Locks", // Display Name for your site
		RPID:          id,           // Generally the FQDN for your site
		RPOrigins:     origins,      // The origin URLs allowed for WebAuthn requests
	}

	if WebAuthn, err = webauthn.New(wconfig); err != nil {
		fmt.Println(err)
	}
}
