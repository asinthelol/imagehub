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

This starts PostgreSQL and Kafka with Docker Compose, then the Spring Boot API, the thumbnail service and the frontend. Navigate to http://localhost:3000/

To run the pieces separately:

```bash
cd backend-spring
docker compose up -d      # PostgreSQL (host port 5433) and Kafka (host port 9092)
./mvnw spring-boot:run    # API on http://localhost:5000

cd ../thumbnail-service
./mvnw spring-boot:run    # thumbnail service (no port; it only talks to Kafka)
```

PostgreSQL is published on host port 5433 so it doesn't clash with a PostgreSQL installed locally on 5432. To change it, edit `docker-compose.yml` and the datasource URL in `application.properties`.

**Thumbnails for images you already have:** the thumbnail service only sees uploads made while it is running (and anything still in the Kafka topic). Ask it to catch up on everything else once:

```bash
curl -X POST http://localhost:5000/api/admin/thumbnails/backfill
```

### Option B: .NET

Requires the .NET 8 SDK.

```bash
npm run create:backend:dotnet
npm run start:backend:dotnet
npm run dev
```

Navigate to http://localhost:3000/

> **Note:** The frontend listens for live updates over STOMP WebSocket, which only the Spring backend provides. With the .NET backend everything else works, but the search page won't refresh on its own when images are uploaded or deleted, so reload it.

> **Upgrading an existing .NET database:** images now store their pixel size (`Width`/`Height`) so the Browse page can lay out tiles at their aspect ratio. A fresh `create:backend:dotnet` already includes it. If you created the database earlier, add the columns once (the `Migrations/` folder is gitignored):
>
> ```bash
> cd backend/ImageHubAPI
> dotnet ef migrations add AddImageDimensions
> dotnet ef database update
> ```
>
> The Spring backend adds the columns automatically on its next start. Images uploaded before this change have no stored size and appear as 4:5 tiles.

## How It Works (Spring backend)

1. Uploading or deleting an image saves to PostgreSQL, then publishes an `ImageEvent` to the Kafka topic `image-events`. The image id is the message key, so events for the same image stay in order.
2. Two independent consumer groups read that topic:
   - the API's `imagehub-websocket` group pushes each event to browsers over WebSocket (`/ws`, topic `/topic/images`), and the search page refetches the image list;
   - the thumbnail service's `imagehub-thumbnailer` group makes a thumbnail (below).
3. When a thumbnail exists, the service publishes a `ThumbnailEvent` to `thumbnail-events`. The API consumes it, stores `thumbPath` on the image row, and pushes a refresh, so the tile quietly swaps from the original to its thumbnail.

### Thumbnail service

`thumbnail-service/` is a separate Spring Boot app with a Kafka consumer. It reads originals from the API's `uploads/` folder and writes `uploads/thumbs/<original file name>.webp`: at most 640 px wide. Width and quality are in its `application.properties`. A tile uses the thumbnail when there is one and the original until then. The .NET backend has no Kafka, so it has no thumbnails and always serves originals.

- Each service has its own copy of the event records
- Transient failures are retried three times. An image that can't be decoded, or a malformed message, goes to the `image-events.DLT` dead-letter topic without blocking the messages behind it.
- Uploads are saved under random UUID names.
- It shares a folder with the API.
- WebP output uses the `webp-imageio` library, which bundles native code and hasn't been updated since 2020. It is tested here on Windows with Java 23; check it on your platform before relying on it elsewhere.
- Changed the thumbnail size? Existing thumbnails are reused when they are newer than their original, so delete `uploads/thumbs/` and run the backfill again.

## How To Use

1. Click "Upload" in the header.
2. Choose an image (or drop one on the form) and give it a title.
3. Click "Upload". You are taken to Browse, where it appears.
4. Click a picture to view it full size; use the arrow keys to move between images.
5. Use the Download and Delete links under each picture. Delete asks for confirmation.

## Features

- Search
- Upload
- Download
- Delete
- Live updates across open tabs
- Thumbnail generation
- Light and dark themes (follows your OS, with a manual toggle)

## Built With

- React
- Next.js
- Spring Boot, Apache Kafka, WebSocket (STOMP), PostgreSQL, Thumbnailator and WebP (thumbnail service)
- .NET, SignalR, SQLite (alternate backend)

## License

I don't care what you do with it, just don't say you made this.
