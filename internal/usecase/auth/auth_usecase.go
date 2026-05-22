package authusecase

import (
	"context"

	"github.com/thdoikn/sihp-be/pkg/dto"
)

type AuthUsecase interface {
	Login(ctx context.Context, req *dto.ReqAuthLogin) dto.ResAuthLoginEnvelope
}
