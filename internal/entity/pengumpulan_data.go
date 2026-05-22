package entity

import (
	"time"

	"github.com/google/uuid"
	entitybase "github.com/thdoikn/sihp-be/internal/entity/base"
	"github.com/thdoikn/sihp-be/pkg/constant"
)

type PengumpulanData struct {
	entitybase.Base
	IDPasar uuid.UUID                      `gorm:"column:id_pasar;type:uuid;not null"`
	Tanggal time.Time                      `gorm:"column:tanggal;type:date;not null"`
	Status  constant.PengumpulanDataStatus `gorm:"column:status;type:smallint;not null;default:0"`
	Catatan *string                        `gorm:"column:catatan;type:text"`
}

func (p *PengumpulanData) TableName() string { return "sihp.pengumpulan_data" }
func (p *PengumpulanData) OrderMap() map[string]bool {
	out := entitybase.GenerateBaseOrderMap()
	out["tanggal"] = true
	out["status"] = true
	return out
}

type PengumpulanDataFilter struct {
	IDPasar          *uuid.UUID
	Status           *constant.PengumpulanDataStatus
	From             *time.Time
	To               *time.Time
	PaginationFilter entitybase.BasePaginationFilter
}
