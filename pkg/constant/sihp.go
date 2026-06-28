package constant

type ActiveInactiveStatus int16

type PengumpulanDataStatus int16

const (
	StatusInactive ActiveInactiveStatus = 0
	StatusActive   ActiveInactiveStatus = 1
)

const (
	PengumpulanDataDraft PengumpulanDataStatus = 0
	PengumpulanDataFinal PengumpulanDataStatus = 1
)
