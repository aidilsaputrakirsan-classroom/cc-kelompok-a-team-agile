package entity

import entitybase "github.com/thdoikn/sihp-be/internal/entity/base"

type Admin struct {
	entitybase.Base
	Email        string `gorm:"column:email;type:varchar(255);not null;unique"`
	Name         string `gorm:"column:name;type:varchar(255);not null"`
	PasswordHash string `gorm:"column:password_hash;type:varchar(255);not null"`
}

func (a *Admin) TableName() string {
	return "sihp.admin"
}
