package usecase

import (
	"benchgo/internal/db"
	"benchgo/internal/ingester"
)

type UseCase struct {
	db     *db.DB
	config ingester.ReportConfig
}

type Dependencies struct {
	DB     *db.DB
	Config ingester.ReportConfig
}

func New(dep Dependencies) *UseCase {
	return &UseCase{
		db:     dep.DB,
		config: dep.Config,
	}
}
