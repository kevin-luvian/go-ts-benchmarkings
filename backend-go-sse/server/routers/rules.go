package routers

import (
	"fmt"
	"regexp"
)

func CreateCORSRule(urls []string) []*regexp.Regexp {
	matcher := []*regexp.Regexp{}
	for _, c := range urls {
		if c == "" {
			continue
		}

		reg, err := regexp.Compile(c)
		if err != nil {
			fmt.Println(fmt.Sprintf("Error compiling cors url=%s, err=%v", c, err))
			continue
		}
		matcher = append(matcher, reg)
	}
	return matcher
}

func CheckOrigin(match []*regexp.Regexp) func(origin string) bool {
	return func(origin string) bool {
		for _, m := range match {
			ok := m.MatchString(origin)
			if ok || origin == "*" {
				return ok
			}
		}
		return false
	}
}
