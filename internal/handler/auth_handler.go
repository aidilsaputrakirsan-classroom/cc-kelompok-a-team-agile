package handler

import (
	"github.com/gofiber/fiber/v2"
	authusecase "github.com/thdoikn/sihp-be/internal/usecase/auth"
	"github.com/thdoikn/sihp-be/pkg/dto"
)

type authHandler struct{ usecase authusecase.AuthUsecase }

func NewAuthHandler(usecase authusecase.AuthUsecase) *authHandler {
	return &authHandler{usecase: usecase}
}

// Login godoc
// @Summary Admin login
// @Description Login using admin credentials and return JWT bearer token
// @Tags Auth
// @Accept json
// @Produce json
// @Param payload body dto.ReqAuthLogin true "Login payload"
// @Success 200 {object} dto.ResAuthLoginEnvelope
// @Router /auth/login [post]
func (h *authHandler) Login(c *fiber.Ctx) error {
	var req dto.ReqAuthLogin
	if err := c.BodyParser(&req); err != nil {
		res := dto.ResAuthLoginEnvelope{}
		res.Success = false
		res.Code = fiber.StatusBadRequest
		res.Message = err.Error()
		return c.Status(res.Code).JSON(res)
	}
	res := h.usecase.Login(c.Context(), &req)
	return c.Status(res.Code).JSON(res)
}
