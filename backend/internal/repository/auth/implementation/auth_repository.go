package authrepositoryimplementation

import (
	"context"

	"github.com/thdoikn/sihp-be/internal/entity"
	authrepository "github.com/thdoikn/sihp-be/internal/repository/auth"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type repo struct{ db *gorm.DB }

func NewAuthRepository(db *gorm.DB) authrepository.AuthRepository { return &repo{db: db} }

func (r *repo) GetAdminByEmail(ctx context.Context, email string) (*entity.Admin, error) {
	var out entity.Admin
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&out).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *repo) UpsertAdmin(ctx context.Context, admin *entity.Admin) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "email"}}, DoUpdates: clause.AssignmentColumns([]string{"name", "password_hash", "updated_at"})}).Create(admin).Error
}
