package helpers

import (
	"api/db"
	"api/models"
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"log"
	"net/http"
	"reflect"
	"strconv"
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
		http.Error(w, "404 record not found", http.StatusNotFound)
	} else {
		http.Error(w, "500 unable to handle request", http.StatusInternalServerError)
	}
}

func JsonWriter(w http.ResponseWriter, table interface{}) {
	errJson := json.NewEncoder(w).Encode(&table)
	if errJson != nil {
		http.Error(w, "500 unable to encode response", http.StatusInternalServerError)
	}
}

func GetAllTable[T models.AllTables](w http.ResponseWriter, table []T) (error, []T) {
	result := db.DB.Omit("Doors").Find(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	return nil, table

}

func GetFirstTable[T models.AllTables, P models.AllTables](w http.ResponseWriter, table T, param P) (error, T) {
	result := db.DB.Where(&param).First(&table)

	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	return nil, table

}

func CreateNewRecord[T models.AllTables](w http.ResponseWriter, table T, err error) (error, T) {
	if err != nil || !CheckEmptyString(table) {
		if err != nil {
			log.Print(err)
		} else {
			log.Print("Request contains empty string params")
		}
		http.Error(w, "400 malformed request", http.StatusBadRequest)
		return errors.New("400"), table
	}

	result := db.DB.Create(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	return nil, table
}

func DeleteById[T models.AllTables](w http.ResponseWriter, table T, Id string) error {
	result := db.DB.Unscoped().Delete(&table, Id)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error
	}
	if result.RowsAffected < 1 {
		http.Error(w, "404 record not found", http.StatusNotFound)
		return errors.New("404")
	}
	return nil
}

func ParseInt(w http.ResponseWriter, r *http.Request, key string) (error, uint) {
	uId, err := strconv.ParseUint(chi.URLParam(r, key), 10, 32)
	if err != nil {
		http.Error(w, "400 failed integer parsing", http.StatusBadRequest)
		return errors.New("400"), 0
	}
	return nil, uint(uId)
}
