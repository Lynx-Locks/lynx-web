package dbHelpers

import (
	"api/db"
	"api/helpers"
	"api/models"
	"errors"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"net/http"
)

func DBErrorHandling(error error, w http.ResponseWriter) {
	if errors.Is(error, gorm.ErrRecordNotFound) {
		http.Error(w, "Record not found", http.StatusNotFound)
	} else if errors.Is(error, gorm.ErrDuplicatedKey) {
		http.Error(w, "Input fails unique constraint", http.StatusNotFound)
	} else {
		http.Error(w, "Unable to handle request", http.StatusInternalServerError)
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
	if !helpers.CheckEmptyString(table) {
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
	if !helpers.CheckEmptyString(table) {
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
		http.Error(w, "Id not set correctly", http.StatusInternalServerError)
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

func GetAllIdsFromList[T models.AllTables](structList []T) []uint {
	var list []uint
	for _, element := range structList {
		list = append(list, element.GetId())
	}
	return list
}
