package helpers

import (
	"api/db"
	"api/models"
	"encoding/json"
	"errors"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
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
		http.Error(w, "Record not found", http.StatusNotFound)
	} else if errors.Is(error, gorm.ErrDuplicatedKey) {
		http.Error(w, "Input fails unique constraint", http.StatusNotFound)
	} else {
		http.Error(w, "Unable to handle request", http.StatusInternalServerError)
	}
}

func JsonWriter(w http.ResponseWriter, table interface{}) {
	errJson := json.NewEncoder(w).Encode(&table)
	if errJson != nil {
		http.Error(w, "Unable to encode response", http.StatusInternalServerError)
	}
}

func GetAllTable[T models.AllTables](w http.ResponseWriter, table []T) (error, []T) {
	result := db.DB.Find(&table)
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

func UpdateObject[T models.AllTables](w http.ResponseWriter, table T) (error, T) {
	if table.GetId() == 0 {
		http.Error(w, "Cannot update without Id", http.StatusBadRequest)
		return errors.New("400"), table
	}
	if !CheckEmptyString(table) {
		http.Error(w, "Request contains empty string params", http.StatusBadRequest)
		return errors.New("400"), table
	}
	result := db.DB.Save(&table)

	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	if result.RowsAffected == 0 {
		http.Error(w, "Record not found", http.StatusNotFound)
		return errors.New("404"), table
	}
	return nil, table
}

func CreateNewRecord[T models.AllTables](w http.ResponseWriter, table T) (error, T) {
	if table.GetId() != 0 {
		http.Error(w, "Cannot create with Id", http.StatusBadRequest)
		return errors.New("400"), table
	}
	if !CheckEmptyString(table) {
		http.Error(w, "Request contains empty string params", http.StatusBadRequest)
		return errors.New("400"), table
	}

	result := db.DB.Create(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error, table
	}
	return nil, table
}

func DeleteObjandAssociationsByPk[T models.AllTables](w http.ResponseWriter, table T) error {
	if table.GetId() == 0 {
		http.Error(w, "User Id not set correctly", http.StatusInternalServerError)
		return errors.New("400")
	}
	result := db.DB.Unscoped().Select(clause.Associations).Delete(&table)
	if result.Error != nil {
		DBErrorHandling(result.Error, w)
		return result.Error
	}
	if result.RowsAffected < 1 {
		http.Error(w, "Record not found", http.StatusNotFound)
		return errors.New("404")
	}
	return nil
}

func ParseInt(w http.ResponseWriter, r *http.Request, key string) (error, uint) {
	intKey, err := strconv.ParseUint(chi.URLParam(r, key), 10, 32)
	if err != nil {
		http.Error(w, "Failed integer parsing", http.StatusBadRequest)
		return errors.New("400"), 0
	}
	return nil, uint(intKey)
}

func GetAllIdsFromList[T models.AllTables](structList []T) []uint {
	var list []uint
	for _, element := range structList {
		list = append(list, element.GetId())
	}
	return list
}
