package entity

type IngestResult struct {
	RequestID string `json:"id"`
	Ts        int64  `json:"ts"`
	Total     int64  `json:"total"`
	Done      bool   `json:"done"`
	Error     string `json:"error"`
}
