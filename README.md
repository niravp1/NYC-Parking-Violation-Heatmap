This project provides an interactive map interface for analyzing NYC parking violations. It allows users to:

View a heatmap of violation density across precincts.

Hover over precincts to see precinct-specific statistics:

#Total violations

Most common violations

Most frequent violation time

Filter and query data dynamically via the backend API.

The application emphasizes backend data processing, using FastAPI and SQLAlchemy to efficiently query PostgreSQL while keeping the frontend lightweight.

#Features

Interactive heatmap: Visualizes violation density with custom gradients.

Hoverable precinct markers: Show detailed statistics dynamically fetched from the backend.

Date-based queries: Filter violations by date.

Clean data handling: Preprocessed violation data for consistent time and format handling.

Zoom-independent visual cues: Fixed-weight representation of violations (optional via circles).

Tech Stack

Backend: Python, FastAPI, SQLAlchemy

Database: PostgreSQL

Frontend: React.js, Leaflet.js

APIs: RESTful endpoints with JSON responses

Styling: CSS and Leaflet custom gradients
