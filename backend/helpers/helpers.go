package helpers

import (
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"net/http"
	"reflect"
	"strconv"
	"strings"
)

func CheckErr(err error) {
	if err != nil {
		panic(err)
	}
}

func CheckEmptyString(s interface{}) bool {
	vals := reflect.ValueOf(s)
	fieldNum := vals.NumField()

	for i := 0; i < fieldNum; i++ {
		curVal := vals.Field(i)

		if curVal.Type().Kind() == reflect.String {
			isSet := curVal.IsValid() && !curVal.IsZero()
			if !isSet {
				return false
			}
		}
	}

	return true
}

func JsonWriter(w http.ResponseWriter, response interface{}) {
	switch response.(type) {
	case string:
		response = struct {
			Message string `json:"message"`
		}{
			Message: response.(string),
		}
	}
	errJson := json.NewEncoder(w).Encode(&response)
	if errJson != nil {
		http.Error(w, "Unable to encode response", http.StatusInternalServerError)
	}
}

func ParseInt(w http.ResponseWriter, r *http.Request, key string) (error, uint) {
	intKey, err := strconv.ParseUint(chi.URLParam(r, key), 10, 32)
	if err != nil {
		http.Error(w, "Failed integer parsing", http.StatusBadRequest)
		return errors.New("400"), 0
	}
	return nil, uint(intKey)
}

func FormatEmail(email string) string {
	x := strings.Split(email, "@")
	return strings.ToLower(strings.Replace(x[0], ".", "", -1) + "@" + x[1])
}
