# ImageHub – Store and Download Images!

## Quick Start

The frontend works with either of two interchangeable backends. Both serve the same REST API on port 5000, so run **one at a time**.

| Backend | Folder | Stack | Live updates |
| --- | --- | --- | --- |
| Spring Boot (default) | `backend-spring/` | Spring Boot, Kafka, WebSocket (STOMP), PostgreSQL | Yes |
| .NET | `backend/` | ASP.NET Core, SignalR, SQLite | No (see note below) |

1. Clone the repo

```bash
git clone https://github.com/asinthelol/imagehub.git
cd imagehub/frontend
```

2. Install the dependencies

```bash
npm install
```

3. Start a backend (pick one)

### Option A: Spring Boot + Kafka (default)

Requires JDK 21+ and Docker. Maven is not needed, the project includes the Maven wrapper.

```bash
npm run go
```

This starts PostgreSQL and Kafka with Docker Compose, then the Spring Boot API, then the frontend. Navigate to http://localhost:3000/

To run the pieces separately:

```bash
cd ../backend-spring
docker compose up -d      # PostgreSQL (host port 5432) and Kafka (host port 9092)
./mvnw spring-boot:run    # API on http://localhost:5000
```

If you already have PostgreSQL running locally on port 5432, stop it, or change the host port in `docker-compose.yml` and the datasource URL in `application.properties`.

### Option B: .NET

Requires the .NET 8 SDK.

```bash
npm run create:backend:dotnet
npm run start:backend:dotnet
npm run dev
```

Navigate to http://localhost:3000/

> **Note:** The frontend listens for live updates over STOMP WebSocket, which only the Spring backend provides. With the .NET backend everything else works, but the search page won't refresh on its own when images are uploaded or deleted, so reload it.

## How It Works (Spring backend)

1. Uploading or deleting an image saves to PostgreSQL, then publishes an `ImageEvent` to the Kafka topic `image-events`. The image id is the message key, so events for the same image stay in order.
2. A Kafka consumer in the API reads each event and pushes it to browsers over WebSocket (`/ws`, topic `/topic/images`).
3. The search page receives the push and refetches the image list.

## How To Use

1. Click on "Upload" in the navbar.
2. Select an image to upload and fill in the required parameter.
3. Click the "Upload" button.
4. Download an image by clicking the green download icon on the photo.
5. Delete an image by clicking the red delete icon on the photo.

## Features

- Search
- Upload
- Download
- Delete
- Live updates across open tabs
- Light and dark themes (follows your OS, with a manual toggle)

## Built With

- React
- Next.js
- Spring Boot, Apache Kafka, WebSocket (STOMP), PostgreSQL
- .NET, SignalR, SQLite (alternate backend)

## License

I don't care what you do with it, just don't say you made this.
