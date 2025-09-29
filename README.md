# NYC Parking Violations Visualization

A full-stack application for visualizing parking violations in New York City using **FastAPI**, **PostgreSQL**, **SQLAlchemy**, **React**, and **Leaflet.js**.  
The app provides a heatmap of violations and interactive precinct markers with detailed summaries.

---

## Features

- **Heatmap visualization** of parking violations across NYC.
- **Interactive markers** per precinct showing:
  - Total violations
  - Top 3 violation types
  - Most common violation hour
- **RESTful API** for retrieving violation data.
- **Frontend** built with React and Leaflet.js.

<div align="center">
  <img src="https://github.com/user-attachments/assets/0756e57d-43e1-4742-9be3-13d1296a0eab" alt="Screenshot" width="800"/>
</div>

---

## Project Structure

## Database

**PostgreSQL tables:**

- `parking`  
  - Columns: `id`, `issue_date`, `violation_time`, `violation_description`, `precinct`, `county`  
- `location`  
  - Columns: `precinct`, `county`, `latitude`, `longitude`  

> Tables are reflected using SQLAlchemy, so existing database structures are mapped to Python objects without recreating tables.

---

## Backend (FastAPI)

**Dependencies:**

- `fastapi`
- `sqlalchemy`
- `psycopg2-binary`
- `uvicorn`

**Endpoints:**

- `/heatmap_data`  
  Returns latitude, longitude, and violation count for the heatmap.

- `/violations?issue_date=MM/DD/YYYY`  
  Returns up to 5 violations for the given date.

- `/location?precinct=<id>`  
  Returns latitude, longitude, and county for a precinct.

- `/precinct_summary/{precinct_id}`  
  Returns detailed statistics for a precinct:
  - Total violations
  - Top 3 violation types
  - Most common violation hour

## Usage

To start the project, just run the following command from the project root directory:

```bash
docker-compose up --build

