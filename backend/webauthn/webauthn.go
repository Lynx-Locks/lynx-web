package webauthn

import (
	"fmt"
	"github.com/go-webauthn/webauthn/webauthn"
)

var (
	WebAuthn *webauthn.WebAuthn
	err      error
)

func init() {
	wconfig := &webauthn.Config{
		RPDisplayName: "Lynx Locks",                      // Display Name for your site
		RPID:          "localhost",                       // Generally the FQDN for your site
		RPOrigins:     []string{"http://localhost:3000"}, // The origin URLs allowed for WebAuthn requests
	}

	if WebAuthn, err = webauthn.New(wconfig); err != nil {
		fmt.Println(err)
	}
}
