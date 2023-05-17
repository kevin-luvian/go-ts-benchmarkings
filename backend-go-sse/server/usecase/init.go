package usecase

type UseCase struct {
}

type Dependencies struct {
}

func New(dep Dependencies) *UseCase {
	return &UseCase{}
}
