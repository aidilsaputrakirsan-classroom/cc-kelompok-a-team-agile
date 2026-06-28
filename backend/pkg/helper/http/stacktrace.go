package httphelper

import (
	"github.com/thdoikn/sihp-be/config"
	errorhelper "github.com/thdoikn/sihp-be/pkg/helper/error"
)

func Stacktrace(cfg *config.Config, err error) *string {
	if cfg == nil || !cfg.Debug {
		return nil
	}

	return errorhelper.ComposeStacktrace(err)
}
