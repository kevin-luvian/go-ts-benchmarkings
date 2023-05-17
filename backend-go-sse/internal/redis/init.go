package redis

import (
	"encoding/json"
	"errors"
	gtime "time"

	gredis "github.com/gomodule/redigo/redis"
)

const (
	DefaultTTL = 10 * gtime.Minute
)

var (
	ErrNoKey   = errors.New("redis missing key")
	QueueName  = "basic-queue"
	gredisPool *gredis.Pool
)

type RedisOpts struct {
	Host        string
	MaxIdle     int
	MaxActive   int
	IdleTimeout gtime.Duration
	Password    string
	QueueName   string
}

// Setup Initialize the gredis instance
func Setup(opts RedisOpts) error {
	QueueName = opts.QueueName
	gredisPool = &gredis.Pool{
		MaxIdle:     opts.MaxIdle,
		MaxActive:   opts.MaxActive,
		IdleTimeout: opts.IdleTimeout,
		Dial: func() (gredis.Conn, error) {
			c, err := gredis.Dial("tcp", opts.Host)
			if err != nil {
				return nil, err
			}
			if opts.Password != "" {
				if _, err := c.Do("AUTH", opts.Password); err != nil {
					c.Close()
					return nil, err
				}
			}
			return c, err
		},
		TestOnBorrow: func(c gredis.Conn, t gtime.Time) error {
			_, err := c.Do("PING")
			return err
		},
	}

	if err := Ping(); err != nil {
		return err
	}
	return nil
}

func Ping() error {
	conn := gredisPool.Get()
	defer conn.Close()

	_, err := gredis.String(conn.Do("PING"))
	return err
}

// Set a key/value
func Set(key string, value string, time ...gtime.Duration) error {
	if len(time) == 0 {
		time = append(time, DefaultTTL)
	}

	conn := gredisPool.Get()
	defer conn.Close()

	_, err := conn.Do("SET", key, value)
	if err != nil {
		return err
	}

	_, err = conn.Do("EXPIRE", key, time[0].Seconds())
	if err != nil {
		return err
	}

	return nil
}

func SetStruct(key string, value interface{}, time ...gtime.Duration) error {
	if len(time) == 0 {
		time = append(time, DefaultTTL)
	}

	conn := gredisPool.Get()
	defer conn.Close()

	enc, err := json.Marshal(value)
	if err != nil {
		return err
	}

	_, err = conn.Do("SET", key, enc)
	if err != nil {
		return err
	}

	_, err = conn.Do("EXPIRE", key, time[0].Seconds())
	if err != nil {
		return err
	}

	return nil
}

// Get get a key
func Get(key string) (string, error) {
	conn := gredisPool.Get()
	defer conn.Close()

	reply, err := gredis.String(conn.Do("GET", key))
	if err == gredis.ErrNil {
		return "", ErrNoKey
	} else if err != nil {
		return "", err
	}

	return reply, nil
}

// GetStruct get a key
func GetStruct(key string, target interface{}) error {
	conn := gredisPool.Get()
	defer conn.Close()

	buf, err := gredis.Bytes(conn.Do("GET", key))
	if err == gredis.ErrNil {
		return ErrNoKey
	} else if err != nil {
		return err
	}

	err = json.Unmarshal(buf, target)
	return err
}

// Exists check a key
func Exists(key string) bool {
	conn := gredisPool.Get()
	defer conn.Close()

	exists, err := gredis.Bool(conn.Do("EXISTS", key))
	if err != nil {
		return false
	}

	return exists
}

// Delete delete a kye
func Delete(key string) (bool, error) {
	conn := gredisPool.Get()
	defer conn.Close()

	return gredis.Bool(conn.Do("DEL", key))
}

// LikeDeletes batch delete
func LikeDeletes(key string) error {
	conn := gredisPool.Get()
	defer conn.Close()

	keys, err := gredis.Strings(conn.Do("KEYS", "*"+key+"*"))
	if err != nil {
		return err
	}

	for _, key := range keys {
		_, err = Delete(key)
		if err != nil {
			return err
		}
	}

	return nil
}

func RPush(v any) error {
	conn := gredisPool.Get()
	defer conn.Close()

	_, err := conn.Do("RPUSH", QueueName, v)
	return err
}

func RPushStruct(v any) error {
	conn := gredisPool.Get()
	defer conn.Close()

	enc, err := json.Marshal(v)
	if err != nil {
		return err
	}

	_, err = conn.Do("RPUSH", QueueName, enc)
	return err
}

func LPop() (string, error) {
	conn := gredisPool.Get()
	defer conn.Close()

	reply, err := gredis.String(conn.Do("LPOP", QueueName))
	if err == gredis.ErrNil {
		return "", ErrNoKey
	} else if err != nil {
		return "", err
	}

	return reply, nil
}

func LPopStruct(target any) error {
	conn := gredisPool.Get()
	defer conn.Close()

	buf, err := gredis.Bytes(conn.Do("LPOP", QueueName))
	if err == gredis.ErrNil {
		return ErrNoKey
	} else if err != nil {
		return err
	}

	err = json.Unmarshal(buf, target)
	return err
}
