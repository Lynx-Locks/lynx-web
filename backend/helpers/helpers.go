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

func JsonWriter(w http.ResponseWriter, table interface{}) {
	errJson := json.NewEncoder(w).Encode(&table)
	if errJson != nil {
		http.Error(w, "500", http.StatusInternalServerError)
	}
}

func GetAllTable[T models.AllTables](w http.ResponseWriter, table []T) (error, []T) {
	result := config.DB.Omit("Doors").Find(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	return nil, table

}

func GetFirstTable[T models.AllTables, P models.AllTables](w http.ResponseWriter, table T, param P) (error, T) {
	result := config.DB.Where(&param).First(&table)

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
		http.Error(w, "400", http.StatusBadRequest)
		return errors.New("400"), table
	}

	result := config.DB.Create(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	return nil, table
}

func DeleteById[T models.AllTables](w http.ResponseWriter, table T, Id string) error {
	result := config.DB.Unscoped().Delete(&table, Id)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error
	}
	if result.RowsAffected < 1 {
		http.Error(w, "404", http.StatusBadRequest)
		return errors.New("404")
	}
	return nil
}
