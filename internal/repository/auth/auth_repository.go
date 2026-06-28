package authrepository

import (
	"context"

	"github.com/thdoikn/sihp-be/internal/entity"
)

type AuthRepository interface {
	GetAdminByEmail(ctx context.Context, email string) (*entity.Admin, error)
	UpsertAdmin(ctx context.Context, admin *entity.Admin) error
}
