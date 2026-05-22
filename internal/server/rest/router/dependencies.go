package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/thdoikn/sihp-be/config"
	"gorm.io/gorm"
)

type Dependencies struct {
	App *fiber.App
	DB  *gorm.DB
	Cfg *config.Config
}

func NewDependencies(app *fiber.App, db *gorm.DB, cfg *config.Config) *Dependencies {
	return &Dependencies{
		App: app,
		DB:  db,
		Cfg: cfg,
	}
}
