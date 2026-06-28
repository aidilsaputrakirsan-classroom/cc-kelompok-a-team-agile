package main

import (
	"context"
	"fmt"
	"os"

	"github.com/thdoikn/sihp-be/config"
	"github.com/thdoikn/sihp-be/internal/entity"
	authrepository "github.com/thdoikn/sihp-be/internal/repository/auth/implementation"
	databasehelper "github.com/thdoikn/sihp-be/pkg/helper/database"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	ctx := context.Background()
	cfg, err := config.Load()
	if err != nil {
		panic(fmt.Errorf("load config: %w", err))
	}
	email := os.Getenv("ADMIN_EMAIL")
	password := os.Getenv("ADMIN_PASSWORD")
	name := os.Getenv("ADMIN_NAME")
	if name == "" {
		name = "Administrator"
	}
	if email == "" || password == "" {
		panic("ADMIN_EMAIL and ADMIN_PASSWORD are required")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		panic(fmt.Errorf("hash password: %w", err))
	}
	db, err := databasehelper.NewGormDB(ctx, &cfg.DatabaseConfig)
	if err != nil {
		panic(fmt.Errorf("connect db: %w", err))
	}
	repo := authrepository.NewAuthRepository(db)
	if err := repo.UpsertAdmin(ctx, &entity.Admin{Email: email, Name: name, PasswordHash: string(hash)}); err != nil {
		panic(fmt.Errorf("upsert admin: %w", err))
	}
	fmt.Printf("admin upserted for %s\n", email)
}
