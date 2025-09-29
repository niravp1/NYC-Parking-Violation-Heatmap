# NYC Parking Violations Visualization

A full-stack application designed to provide insights into parking violations across New York City. By visualizing patterns in violations, the app helps city planners, traffic authorities, and researchers identify high-risk areas, understand trends, and make data-driven decisions for urban planning and enforcement.
The application is built using **FastAPI** for the backend, **PostgreSQL** for data storage, **SQLAlchemy** for ORM and database reflection, **React** for the frontend, and **Leaflet.js** for interactive mapping.  
It features a heatmap of violations and interactive precinct markers that display detailed summaries, including total violations, top violation types, and the most common violation hours.

---

## Features

- **Heatmap visualization** of parking violations across NYC.
-  **Frontend** built with React and Leaflet.js.
- **RESTful API** for retrieving violation data.
- **Interactive markers** per precinct showing:
  - Total violations
  - Top 3 violation types
  - Most common violation hour


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


### Frontend (React + Leaflet.js)

**Dependencies:**

- `react`  
- `react-dom`  
- `axios` (or your custom `api.js`)  
- `leaflet`  
- `react-leaflet` (optional if using React integration)  

**Components:**

- `Heatmap.jsx`  
  - Renders the heatmap based on `/heatmap_data`.  
  - Configures colors, radius, and opacity.  

- `InteractiveMarkers.jsx`  
  - Adds hoverable markers with detailed precinct statistics using `/precinct_summary/{precinct_id}`.  
  - Popups display top violations and the most common hour.  

- `App.jsx`  
  - Main component that includes the `Heatmap` component and other UI elements.  

**Notes:**

- Frontend communicates with FastAPI backend via REST API calls.  
- Leaflet renders map tiles and overlays heatmap and markers.  
- API requests are proxied to `http://localhost:8000` (or your backend URL).  

## Usage

To start the project, just run the following command from the project root directory:

```bash
docker-compose up --build

