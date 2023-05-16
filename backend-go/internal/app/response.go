package app

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Ok   bool        `json:"ok"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
	Ts   int64       `json:"ts"`
}

func Success(c *gin.Context, ts int64, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Ok:   true,
		Msg:  "success",
		Data: data,
		Ts:   ts,
	})
}

func Error(c *gin.Context, ts int64, code int, err error) {
	c.JSON(code, Response{
		Ok:   false,
		Msg:  err.Error(),
		Data: err.Error(),
		Ts:   ts,
	})
}
