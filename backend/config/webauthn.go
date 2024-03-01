package config

import (
	"fmt"
	"github.com/go-webauthn/webauthn/webauthn"
)

var (
	WebAuthn *webauthn.WebAuthn
	err      error
)

// TODO make these values configurable via environment variables
func init() {
	wconfig := &webauthn.Config{
		RPDisplayName: "Lynx Locks",                                                                             // Display Name for your site
		RPID:          "app.lynx-locks.com",                                                                     // Generally the FQDN for your site
		RPOrigins:     []string{"http://localhost:3000", "http://localhost:5001", "https://app.lynx-locks.com"}, // The origin URLs allowed for WebAuthn requests
	}

	if WebAuthn, err = webauthn.New(wconfig); err != nil {
		fmt.Println(err)
	}
}
