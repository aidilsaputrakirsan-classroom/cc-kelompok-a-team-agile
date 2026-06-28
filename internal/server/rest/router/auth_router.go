package router

import (
	"github.com/thdoikn/sihp-be/internal/handler"
	authrepository "github.com/thdoikn/sihp-be/internal/repository/auth/implementation"
	authusecase "github.com/thdoikn/sihp-be/internal/usecase/auth/implementation"
)

func AuthRouter(deps *Dependencies) {
	repo := authrepository.NewAuthRepository(deps.DB)
	usecase := authusecase.NewAuthUsecase(repo, deps.Cfg)
	h := handler.NewAuthHandler(usecase)
	group := deps.App.Group("/v1/auth")
	group.Post("/login", h.Login)
}
