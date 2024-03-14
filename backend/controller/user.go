package controller

import (
	"api/db"
	"api/helpers"
	"api/models"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"html/template"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"time"
)

func GetAllUsers(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, users := helpers.GetAllTable(w, []models.User{})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, users)
}
func GetUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	err, user := helpers.GetFirstTable(w, models.User{}, models.User{Id: uId})
	if err != nil {
		return
	}
	helpers.JsonWriter(w, user)
}

func UpdateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	user := models.User{}
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
		return
	}
	ids := helpers.GetAllIdsFromList(user.Roles)
	roles := []models.Role{}
	if len(ids) != 0 {
		res := db.DB.Find(&roles, ids)
		if res.Error != nil {
			helpers.DBErrorHandling(res.Error, w)
			return
		}
		if len(roles) != len(ids) {
			http.Error(w, "One or more invalid roles", http.StatusBadRequest)
			return
		}
		user.Roles = roles
	}

	err, user = helpers.UpdateObject(w, user)
	if err != nil {
		return
	}
	err = db.DB.Model(&user).Association("Roles").Replace(&roles)
	if err != nil {
		http.Error(w, "Failed to remove role difference", http.StatusInternalServerError)
		return
	}
	helpers.JsonWriter(w, user)

}

func GetUserByEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email parameter is required", http.StatusBadRequest)
		return
	}

	err, user := helpers.GetFirstTable(w, models.User{}, models.User{Email: email})
	if err != nil {
		return
	}

	helpers.JsonWriter(w, &user)
}

func CreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var user models.User

	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Malformed request", http.StatusBadRequest)
	}

	ids := helpers.GetAllIdsFromList(user.Roles)
	if len(ids) != 0 {
		roles := []models.Role{}
		res := db.DB.Find(&roles, ids)
		if res.Error != nil {
			helpers.DBErrorHandling(res.Error, w)
			return
		}
		if len(roles) != len(ids) {
			http.Error(w, "One or more invalid roles", http.StatusBadRequest)
			return
		}
		user.Roles = roles
	}

	err, user = helpers.CreateNewRecord(w, user)
	if err != nil {
		return
	}
	helpers.JsonWriter(w, user)
}

func DeleteUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	err = helpers.DeleteObjandAssociationsByPk(w, models.User{Id: uId})
	if err != nil {
		return
	}
	w.WriteHeader(200)
}

func GetUserCreds(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	user := models.User{Id: uId}
	creds := []models.Credential{}
	err = db.DB.Model(&user).Association("Credentials").Find(&creds)
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, &creds)

}

func GetUserRoles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err, uId := helpers.ParseInt(w, r, "userId")
	if err != nil {
		return
	}
	user := models.User{Id: uId}
	roles := []models.Role{}
	err = db.DB.Model(&user).Association("Roles").Find(&roles)
	if err != nil {
		helpers.DBErrorHandling(err, w)
		return
	}
	helpers.JsonWriter(w, &roles)
}

func SendRegistrationEmail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "Email parameter is required", http.StatusBadRequest)
		return
	}
	err, user := helpers.GetFirstTable(w, models.User{}, models.User{Email: email})
	if err != nil {
		http.Error(w, "Invalid user email", http.StatusBadRequest)
		return
	}
	token, _ := uuid.NewUUID()
	activeToken := models.ActiveTokens{Id: token, UserId: user.Id}
	result := db.DB.Create(&activeToken)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		return
	}
	err = sendEmail(user.Email, token)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func sendEmail(email string, token uuid.UUID) error {
	sender, ok := os.LookupEnv("HOST_EMAIL_ADDRESS")
	if !ok {
		return errors.New("Could not get host email address")
	}
	password, ok := os.LookupEnv("HOST_EMAIL_PASSWORD")
	if !ok {
		return errors.New("Could not get host password")
	}
	var baseUrl []string
	if value, ok := os.LookupEnv("NODE_ENV"); ok && value == "production" {
		if domain, ok := os.LookupEnv("CLIENT_DOMAIN"); ok {
			baseUrl = []string{fmt.Sprintf("https://%s", domain)}
		} else {
			panic("Missing client domain")
		}
	} else {
		baseUrl = []string{"http://localhost:5001"}
	}
	link := []string{fmt.Sprintf("%s/register/?token=%s", baseUrl[0], token.String())}
	t, err := template.ParseFiles("./html/emailTemplate.html")
	if err != nil {
		return err
	}
	var body bytes.Buffer
	subject := "Lynx Locks Key Registration"
	mimeHeaders := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body.Write([]byte(fmt.Sprintf("Subject: %s \n%s\n\n", subject, mimeHeaders)))
	t.Execute(&body, struct {
		Link string
	}{
		Link: link[0],
	})

	// smtp server configuration.
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	auth := smtp.PlainAuth("", sender, password, smtpHost)

	err = smtp.SendMail(smtpHost+":"+smtpPort, auth, sender, []string{email}, body.Bytes())
	if err != nil {
		return err
	}
	return nil
}

func GetUserByUrlParam(w http.ResponseWriter, r *http.Request) (user models.User, valid bool) {
	valid = true
	id, err := strconv.ParseUint(chi.URLParam(r, "userId"), 10, 32)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		valid = false
		return
	}

	result := db.DB.First(&user, id)
	if result.Error != nil {
		helpers.DBErrorHandling(result.Error, w)
		valid = false
	}

	return
}

func UpdateLastTimeIn(w http.ResponseWriter, uId uint) error {
	err, user := helpers.GetFirstTable(w, models.User{}, models.User{Id: uId})
	if err != nil {
		return err
	}
	curTime := time.Now().Unix()
	user.LastTimeIn = curTime
	err, user = helpers.UpdateObject(w, user)
	if err != nil {
		return err
	}
	return nil

}
