package helpers

import (
	"api/config"
	"api/models"
	"encoding/json"
	"errors"
	"gorm.io/gorm"
	"log"
	"net/http"
	"reflect"
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
func DBErrorHandling(error error, w http.ResponseWriter) {
	if errors.Is(error, gorm.ErrRecordNotFound) {
		http.Error(w, "404", http.StatusBadRequest)
	} else {
		http.Error(w, "500", http.StatusInternalServerError)
	}
}

func GetAllTable[T models.AllTables](w http.ResponseWriter, table []T) {
	result := config.DB.Find(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return
	}
	//go yells at you if you don't error check this, better to be safe
	errJson := json.NewEncoder(w).Encode(&table)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func GetById[T models.AllTables](w http.ResponseWriter, table T, Id string) {
	result := config.DB.First(&table, Id)

	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return
	}
	errJson := json.NewEncoder(w).Encode(&table)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func CreateNewRecord[T models.AllTables](w http.ResponseWriter, table T, err error) {
	if err != nil || !CheckEmptyString(table) {
		if err != nil {
			log.Print(err)
		} else {
			log.Print("Request contains empty string params")
		}
		http.Error(w, "400", http.StatusBadRequest)
		return
	}

	result := config.DB.Create(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return
	}
	errJson := json.NewEncoder(w).Encode(table)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
		return
	}
}

func DeleteById[T models.AllTables](w http.ResponseWriter, table T, Id string) {
	result := config.DB.Unscoped().Delete(&table, Id)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return
	}
	if result.RowsAffected < 1 {
		http.Error(w, "404", http.StatusBadRequest)
		return
	}
	w.WriteHeader(200)
}
