package entity

type IngestResult struct {
	RequestID string `json:"request_id"`
	Total     int64  `json:"total"`
	Done      bool   `json:"done"`
	Error     string `json:"error"`
}
