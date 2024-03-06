package models

type AllTables interface {
	User | Role | Door
	GetId() uint
}
