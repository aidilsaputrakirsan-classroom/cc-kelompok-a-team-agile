package jwthelper

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/thdoikn/sihp-be/config"
)

type Claims struct {
	AdminID string `json:"admin_id"`
	Email   string `json:"email"`
	jwt.RegisteredClaims
}

func SignAccessToken(cfg *config.Config, adminID, email string) (string, int, error) {
	hours := cfg.AccessTokenExpiryInHours
	exp := time.Now().Add(time.Duration(hours) * time.Hour)
	claims := Claims{AdminID: adminID, Email: email, RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(exp), IssuedAt: jwt.NewNumericDate(time.Now()), Issuer: cfg.TokenIssuer, Audience: []string{cfg.TokenAudience}}}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(cfg.SecretKey))
	if err != nil {
		return "", 0, err
	}
	return signed, int(time.Until(exp).Seconds()), nil
}

func ParseAccessToken(cfg *config.Config, tokenStr string) (*Claims, error) {
	t, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (any, error) { return []byte(cfg.SecretKey), nil })
	if err != nil {
		return nil, err
	}
	claims, ok := t.Claims.(*Claims)
	if !ok || !t.Valid {
		return nil, jwt.ErrTokenInvalidClaims
	}
	return claims, nil
}
