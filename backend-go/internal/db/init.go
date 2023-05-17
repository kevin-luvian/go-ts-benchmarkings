package db

import (
	"fmt"
	"time"

	nurl "net/url"

	"github.com/jmoiron/sqlx"

	_ "github.com/go-sql-driver/mysql"
)

type Config struct {
	SourceURL             string
	Retries               int
	MaxOpenConnections    int
	MaxIdleConnections    int
	ConnectionMaxLifetime time.Duration
}

type DB struct {
	Instance *sqlx.DB
}

func New(cfg Config) (*DB, error) {
	if cfg.Retries < 1 || cfg.Retries > 10 {
		cfg.Retries = 3
	}

	db, err := Open(cfg.SourceURL, cfg.Retries)
	if err != nil {
		return nil, err
	}

	if cfg.MaxIdleConnections > 0 {
		db.SetMaxIdleConns(cfg.MaxIdleConnections)
	}

	if cfg.MaxOpenConnections > 0 {
		db.SetMaxOpenConns(cfg.MaxOpenConnections)
	}

	if cfg.ConnectionMaxLifetime > 0 {
		db.SetConnMaxLifetime(cfg.ConnectionMaxLifetime)
	}

	return &DB{Instance: db}, nil
}

func Open(sourceURL string, retries int) (*sqlx.DB, error) {
	var (
		db  *sqlx.DB
		err error
	)

	u, err := nurl.Parse(sourceURL)
	if err != nil {
		return nil, err
	}

	connURL := sourceURL
	driver := u.Scheme
	switch driver {
	case "mysql":
		connURL = fmt.Sprintf("%s@(%s:%s)/%s", u.User.String(), u.Hostname(), u.Port(), u.Path[1:])
	}

	fmt.Println("connecting to", connURL)

	for retries > 0 {
		retries--

		db, err = sqlx.Connect(driver, connURL)
		if err == nil {
			err = db.Ping()
		}

		if err == nil {
			fmt.Println("database connected")
			return db, nil
		}

		fmt.Printf("failed to connect to %s with error %s\n", sourceURL, err.Error())

		if retries > 0 {
			fmt.Println("retrying to connect...")
			time.Sleep(time.Second * 3)
		}
	}

	return nil, err
}
