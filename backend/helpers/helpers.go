package helpers

import (
	"errors"
	"gorm.io/gorm"
	"net/http"
	"reflect"
)

func CheckErr(err error) {
	if err != nil {
		panic(err)
	}
}

func CheckFields(s interface{}) bool {
	vals := reflect.ValueOf(s)
	fieldNum := vals.NumField()

	for i := 0; i < fieldNum; i++ {
		curVal := vals.Field(i)

		isSet := curVal.IsValid() && !curVal.IsZero()

		if !isSet {
			return false
		}
	}

	return true
}

func DBErrorHandling(error error, w http.ResponseWriter, r *http.Request) {
	if errors.Is(error, gorm.ErrRecordNotFound) {
		http.Error(w, "404", http.StatusBadRequest)
	} else {
		http.Error(w, "500", http.StatusInternalServerError)
	}
}
