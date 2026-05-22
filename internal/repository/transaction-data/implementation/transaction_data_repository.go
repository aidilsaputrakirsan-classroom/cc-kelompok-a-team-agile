package transactiondatarepositoryimplementation

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/thdoikn/sihp-be/internal/entity"
	entitybase "github.com/thdoikn/sihp-be/internal/entity/base"
	transactiondatarepository "github.com/thdoikn/sihp-be/internal/repository/transaction-data"
	"github.com/thdoikn/sihp-be/pkg/constant"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type transactionDatarepository struct {
	db              *gorm.DB
	pengumpulanData entity.PengumpulanData
	hargaRutin      entity.HargaRutin
	hargaPelaporan  entity.HargaPelaporan
}

func NewTransactionDataRepository(db *gorm.DB) transactiondatarepository.TransactionDataRepository {
	return &transactionDatarepository{
		db:              db,
		pengumpulanData: entity.PengumpulanData{},
		hargaRutin:      entity.HargaRutin{},
		hargaPelaporan:  entity.HargaPelaporan{},
	}
}

func (r *transactionDatarepository) CreatePengumpulanData(ctx context.Context, input *entity.PengumpulanData) (*entity.PengumpulanData, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	if err := r.db.WithContext(ctx).Create(input).Error; err != nil {
		return nil, err
	}
	return r.GetPengumpulanDataByID(ctx, input.ID)
}
func (r *transactionDatarepository) GetPengumpulanDataByID(ctx context.Context, id uuid.UUID) (*entity.PengumpulanData, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	var out entity.PengumpulanData
	if err := r.db.WithContext(ctx).Table(r.pengumpulanData.TableName()).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *transactionDatarepository) GetPengumpulanDataByFilter(ctx context.Context, filter *entity.PengumpulanDataFilter) ([]entity.PengumpulanData, entitybase.BasePaginationResult, error) {
	if r.db == nil {
		return nil, entitybase.BasePaginationResult{}, errors.New("database connection is not initialized")
	}
	var out []entity.PengumpulanData
	var pagination entitybase.BasePaginationResult
	query := r.db.WithContext(ctx).Table(r.pengumpulanData.TableName())
	if filter.IDPasar != nil {
		query = query.Where("id_pasar = ?", *filter.IDPasar)
	}
	if filter.Status != nil {
		query = query.Where("status = ?", *filter.Status)
	}
	if filter.From != nil {
		query = query.Where("tanggal >= ?", filter.From.Format("2006-01-02"))
	}
	if filter.To != nil {
		query = query.Where("tanggal <= ?", filter.To.Format("2006-01-02"))
	}
	query = entitybase.PaginateEntityQuery(query, r.pengumpulanData.TableName(), r.pengumpulanData.OrderMap(), &filter.PaginationFilter, &pagination)
	if err := query.Find(&out).Error; err != nil {
		return nil, pagination, err
	}
	return out, pagination, nil
}
func (r *transactionDatarepository) UpdatePengumpulanData(ctx context.Context, id uuid.UUID, updateMap map[string]any) (*entity.PengumpulanData, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	if err := r.db.WithContext(ctx).Table(r.pengumpulanData.TableName()).Where("id = ?", id).Updates(updateMap).Error; err != nil {
		return nil, err
	}
	return r.GetPengumpulanDataByID(ctx, id)
}
func (r *transactionDatarepository) DeletePengumpulanData(ctx context.Context, id uuid.UUID) error {
	if r.db == nil {
		return errors.New("database connection is not initialized")
	}
	return r.db.WithContext(ctx).Table(r.pengumpulanData.TableName()).Delete(&entity.PengumpulanData{}, "id = ?", id).Error
}

func (r *transactionDatarepository) FinalizePengumpulanData(ctx context.Context, id uuid.UUID) (int64, error) {
	var finalizedCount int64
	if r.db == nil {
		return 0, errors.New("database connection is not initialized")
	}
	err := r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		var pd entity.PengumpulanData
		if err := tx.Clauses(clause.Locking{Strength: "UPDATE"}).Table(r.pengumpulanData.TableName()).First(&pd, "id = ?", id).Error; err != nil {
			return err
		}
		if pd.Status != constant.PengumpulanDataDraft {
			return errors.New("pengumpulan_data is not draft")
		}

		type aggRow struct {
			IDKomoditas uuid.UUID
			HargaAvg    float64
		}
		rows := []aggRow{}
		if err := tx.Table(r.hargaRutin.TableName()).
			Select("id_komoditas, AVG(harga)::float8 AS harga_avg").
			Where("id_pengumpulan_data = ?", id).
			Group("id_komoditas").
			Scan(&rows).Error; err != nil {
			return err
		}
		finalizedCount = int64(len(rows))
		for _, row := range rows {
			hp := entity.HargaPelaporan{IDPengumpulanData: id, IDKomoditas: row.IDKomoditas, Tanggal: pd.Tanggal, Harga: int64(row.HargaAvg)}
			if err := tx.Clauses(clause.OnConflict{
				Columns:   []clause.Column{{Name: "id_pengumpulan_data"}, {Name: "id_komoditas"}},
				DoUpdates: clause.AssignmentColumns([]string{"tanggal", "harga", "updated_at"}),
			}).Create(&hp).Error; err != nil {
				return err
			}
		}

		return tx.Model(&entity.PengumpulanData{}).Where("id = ?", id).Update("status", constant.PengumpulanDataFinal).Error
	})
	return finalizedCount, err
}

func (r *transactionDatarepository) CreateHargaRutin(ctx context.Context, input *entity.HargaRutin) (*entity.HargaRutin, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	if err := r.db.WithContext(ctx).Create(input).Error; err != nil {
		return nil, err
	}
	return r.GetHargaRutinByID(ctx, input.ID)
}
func (r *transactionDatarepository) GetHargaRutinByID(ctx context.Context, id uuid.UUID) (*entity.HargaRutin, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	var out entity.HargaRutin
	if err := r.db.WithContext(ctx).Table(r.hargaRutin.TableName()).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *transactionDatarepository) GetHargaRutinByFilter(ctx context.Context, filter *entity.HargaRutinFilter) ([]entity.HargaRutin, entitybase.BasePaginationResult, error) {
	if r.db == nil {
		return nil, entitybase.BasePaginationResult{}, errors.New("database connection is not initialized")
	}
	var out []entity.HargaRutin
	var pagination entitybase.BasePaginationResult
	query := r.db.WithContext(ctx).Table(r.hargaRutin.TableName())
	if filter.IDPengumpulanData != nil {
		query = query.Where("id_pengumpulan_data = ?", *filter.IDPengumpulanData)
	}
	if filter.IDKomoditas != nil {
		query = query.Where("id_komoditas = ?", *filter.IDKomoditas)
	}
	if filter.IDTempatUsaha != nil {
		query = query.Where("id_tempat_usaha = ?", *filter.IDTempatUsaha)
	}
	query = entitybase.PaginateEntityQuery(query, (&entity.HargaRutin{}).TableName(), (&entity.HargaRutin{}).OrderMap(), &filter.PaginationFilter, &pagination)
	if err := query.Find(&out).Error; err != nil {
		return nil, pagination, err
	}
	return out, pagination, nil
}

func (r *transactionDatarepository) UpdateHargaRutin(ctx context.Context, id uuid.UUID, updateMap map[string]any) (*entity.HargaRutin, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	if err := r.db.WithContext(ctx).Table(r.hargaRutin.TableName()).Where("id = ?", id).Updates(updateMap).Error; err != nil {
		return nil, err
	}
	return r.GetHargaRutinByID(ctx, id)
}
func (r *transactionDatarepository) DeleteHargaRutin(ctx context.Context, id uuid.UUID) error {
	if r.db == nil {
		return errors.New("database connection is not initialized")
	}
	return r.db.WithContext(ctx).Table(r.hargaRutin.TableName()).Delete(&entity.HargaRutin{}, "id = ?", id).Error
}

func (r *transactionDatarepository) GetHargaPelaporanByID(ctx context.Context, id uuid.UUID) (*entity.HargaPelaporan, error) {
	if r.db == nil {
		return nil, errors.New("database connection is not initialized")
	}
	var out entity.HargaPelaporan
	if err := r.db.WithContext(ctx).Table(r.hargaPelaporan.TableName()).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *transactionDatarepository) GetHargaPelaporanByFilter(ctx context.Context, filter *entity.HargaPelaporanFilter) ([]entity.HargaPelaporan, entitybase.BasePaginationResult, error) {
	if r.db == nil {
		return nil, entitybase.BasePaginationResult{}, errors.New("database connection is not initialized")
	}
	var out []entity.HargaPelaporan
	var pagination entitybase.BasePaginationResult
	query := r.db.WithContext(ctx).Table(r.hargaPelaporan.TableName()).
		Joins("JOIN sihp.pengumpulan_data pd ON pd.id = sihp.harga_pelaporan.id_pengumpulan_data AND pd.deleted_at IS NULL")
	if filter.IDPasar != nil {
		query = query.Where("pd.id_pasar = ?", *filter.IDPasar)
	}
	if filter.IDKomoditas != nil {
		query = query.Where("sihp.harga_pelaporan.id_komoditas = ?", *filter.IDKomoditas)
	}
	if filter.From != nil {
		query = query.Where("sihp.harga_pelaporan.tanggal >= ?", filter.From.Format("2006-01-02"))
	}
	if filter.To != nil {
		query = query.Where("sihp.harga_pelaporan.tanggal <= ?", filter.To.Format("2006-01-02"))
	}
	if filter.Status != nil {
		query = query.Where("pd.status = ?", *filter.Status)
	}
	query = query.Select("sihp.harga_pelaporan.*")
	query = entitybase.PaginateEntityQuery(query, (&entity.HargaPelaporan{}).TableName(), (&entity.HargaPelaporan{}).OrderMap(), &filter.PaginationFilter, &pagination)
	if err := query.Find(&out).Error; err != nil {
		return nil, pagination, err
	}
	return out, pagination, nil
}
