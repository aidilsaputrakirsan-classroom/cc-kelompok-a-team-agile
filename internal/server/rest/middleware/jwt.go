package restmiddleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/thdoikn/sihp-be/config"
	jwthelper "github.com/thdoikn/sihp-be/pkg/helper/jwt"
)

func JWTRequired(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "code": fiber.StatusUnauthorized, "message": "missing authorization header"})
		}
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "code": fiber.StatusUnauthorized, "message": "invalid authorization format"})
		}
		claims, err := jwthelper.ParseAccessToken(cfg, parts[1])
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "code": fiber.StatusUnauthorized, "message": "invalid token"})
		}
		c.Locals("admin_id", claims.AdminID)
		c.Locals("admin_email", claims.Email)
		return c.Next()
	}
}
