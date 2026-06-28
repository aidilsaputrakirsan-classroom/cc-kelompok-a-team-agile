package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/thdoikn/sihp-be/config"
	_ "github.com/thdoikn/sihp-be/docs"
	restserver "github.com/thdoikn/sihp-be/internal/server/rest"
)

// Package main provides the API server
//
// @title           SIHP API
// @version         1.0
// @description     SIHP API Collection
// @termsOfService  http://swagger.io/terms/
//
// @contact.name   API Support
// @contact.url    http://www.swagger.io/support
// @contact.email  support@swagger.io
//
// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html
//
// @BasePath  /v1
//
// @externalDocs.description  OpenAPI
// @externalDocs.url          https://swagger.io/resources/open-api/
// @securityDefinitions.apikey Authorization
// @in                         header
// @name                       Authorization
// @description                Authentication token (Bearer token)
func main() {
	if err := run(); err != nil {
		slog.Error(fmt.Sprintf("application error: %v", err))
		os.Exit(1)
	}
}

func run() error {
	// Handle interrupt (ctrl-c) and termination
	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %v", err)
	}

	// Initialize and start server
	srv := restserver.NewRestServer(ctx, cfg)
	if err := srv.Start(); err != nil {
		return fmt.Errorf("server start: %v", err)
	}

	return nil
}
