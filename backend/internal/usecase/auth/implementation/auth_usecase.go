package authusecaseimplementation

import (
	"context"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/thdoikn/sihp-be/config"
	authrepository "github.com/thdoikn/sihp-be/internal/repository/auth"
	authusecase "github.com/thdoikn/sihp-be/internal/usecase/auth"
	"github.com/thdoikn/sihp-be/pkg/dto"
	dtobase "github.com/thdoikn/sihp-be/pkg/dto/base"
	httphelper "github.com/thdoikn/sihp-be/pkg/helper/http"
	jwthelper "github.com/thdoikn/sihp-be/pkg/helper/jwt"
	"golang.org/x/crypto/bcrypt"
)

type usecase struct {
	repo      authrepository.AuthRepository
	cfg       *config.Config
	validator *validator.Validate
}

func NewAuthUsecase(repo authrepository.AuthRepository, cfg *config.Config) authusecase.AuthUsecase {
	return &usecase{repo: repo, cfg: cfg, validator: validator.New(validator.WithRequiredStructEnabled())}
}

func (u *usecase) Login(ctx context.Context, req *dto.ReqAuthLogin) dto.ResAuthLoginEnvelope {
	if req == nil {
		return dto.ResAuthLoginEnvelope{BaseRes: dtobase.BaseRes{Success: false, Code: http.StatusBadRequest, Message: "request is nil"}}
	}
	if err := u.validator.Struct(req); err != nil {
		return dto.ResAuthLoginEnvelope{BaseRes: dtobase.BaseRes{Success: false, Code: http.StatusBadRequest, Message: err.Error(), Stacktrace: httphelper.Stacktrace(u.cfg, err)}}
	}
	admin, err := u.repo.GetAdminByEmail(ctx, req.Email)
	if err != nil {
		return dto.ResAuthLoginEnvelope{BaseRes: dtobase.BaseRes{Success: false, Code: http.StatusUnauthorized, Message: "invalid credentials", Stacktrace: httphelper.Stacktrace(u.cfg, err)}}
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return dto.ResAuthLoginEnvelope{BaseRes: dtobase.BaseRes{Success: false, Code: http.StatusUnauthorized, Message: "invalid credentials", Stacktrace: httphelper.Stacktrace(u.cfg, err)}}
	}

	accessToken, expiresIn, err := jwthelper.SignAccessToken(u.cfg, admin.ID.String(), admin.Email)
	if err != nil {
		return dto.ResAuthLoginEnvelope{BaseRes: dtobase.BaseRes{Success: false, Code: http.StatusInternalServerError, Message: "failed to issue token", Stacktrace: httphelper.Stacktrace(u.cfg, err)}}
	}

	return dto.ResAuthLoginEnvelope{
		BaseRes: dtobase.BaseRes{Success: true, Code: http.StatusOK, Message: "login success"},
		Data:    &dto.ResAuthLogin{User: dto.ResAdmin{ID: admin.ID, Email: admin.Email, Name: admin.Name}, Token: dto.ResAuthToken{AccessToken: accessToken, ExpiresIn: expiresIn, TokenType: "Bearer"}},
	}
}
