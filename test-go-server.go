package main

import (
	"fmt"
	"net/http"
	"log"
)

func main() {
	// Serve static files (like our test-crawl.html)
	http.Handle("/", http.FileServer(http.Dir(".")))
	
	// API endpoint for testing
	http.HandleFunc("/api/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"message": "Hello from Go server!", "status": "success"}`)
	})
	
	// Another endpoint that might cause errors
	http.HandleFunc("/api/error", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, `{"error": "Simulated server error", "status": "error"}`)
	})
	
	fmt.Println("🚀 Go server starting on http://localhost:8080")
	fmt.Println("📋 Serving files from current directory")
	fmt.Println("🔗 Available endpoints:")
	fmt.Println("   GET /              - Static files")
	fmt.Println("   GET /api/test      - Test API endpoint") 
	fmt.Println("   GET /api/error     - Error simulation endpoint")
	
	log.Fatal(http.ListenAndServe(":8080", nil))
}