# GeoTrack - Asset Location Tracker

A full-stack geospatial application demonstrating modern technologies for real-time asset tracking.

## Tech Stack

### Backend
- **ASP.NET Core 8** - Minimal API
- **Hot Chocolate** - GraphQL server with queries, mutations, and subscriptions
- **PostgreSQL + PostGIS** - Spatial database with geographic queries
- **Entity Framework Core** - ORM with NetTopologySuite for spatial types

### Frontend
- **React 18** with TypeScript
- **Apollo Client** - GraphQL client with real-time subscriptions
- **Mapbox GL** - Interactive map with custom markers
- **Vite** - Fast build tool

### Infrastructure
- **Docker Compose** - Container orchestration with PostGIS

## Features

- **Real-time asset tracking** with GraphQL subscriptions
- **Spatial queries**:
  - `IsWithinDistance()` - Find assets within radius
  - `Within()` - Find assets within polygon boundaries
- **Interactive map** with Mapbox GL
- **Geofencing** support
- **Asset filtering** by type and status

## Getting Started

### Prerequisites

- Docker & Docker Compose
- .NET 8 SDK (for local development)
- Node.js 18+ (for local frontend development)
- Mapbox access token (get one at https://account.mapbox.com/)

### Quick Start with Docker

1. Clone the repository

2. Start all services:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - GraphQL Playground: http://localhost:5000/graphql

### Local Development

1. Start PostgreSQL with PostGIS:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. Run the backend:
   ```bash
   cd backend/GeoTrack.Api
   dotnet run
   ```

3. Run the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Set your Mapbox token in `frontend/.env`:
   ```
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   ```

5. Access the application:
   - Frontend: http://localhost:5173
   - GraphQL Playground: http://localhost:5000/graphql

## GraphQL API Examples

### Queries

```graphql
# Get all assets
query {
  assets {
    id
    name
    assetType
    latitude
    longitude
    status
  }
}

# Find assets within 1km of a point
query {
  assetsNearby(input: {
    latitude: 37.7749
    longitude: -122.4194
    distanceMeters: 1000
  }) {
    id
    name
    latitude
    longitude
  }
}

# Find assets within a geofence
query {
  assetsWithinGeoFence(geoFenceId: "uuid-here") {
    id
    name
  }
}
```

### Mutations

```graphql
# Create an asset
mutation {
  createAsset(input: {
    name: "Delivery Truck #10"
    description: "Ford Transit"
    assetType: "Vehicle"
    latitude: 37.7749
    longitude: -122.4194
    status: ACTIVE
  }) {
    id
    name
  }
}

# Update asset location
mutation {
  updateAssetLocation(input: {
    id: "uuid-here"
    latitude: 37.7850
    longitude: -122.4094
  }) {
    id
    latitude
    longitude
    updatedAt
  }
}
```

### Subscriptions

```graphql
# Subscribe to location updates
subscription {
  assetLocationUpdated {
    id
    name
    latitude
    longitude
    updatedAt
  }
}

# Subscribe to specific asset
subscription {
  assetLocationUpdatedById(assetId: "uuid-here") {
    id
    latitude
    longitude
  }
}
```

## Project Structure

```
GeoTrack-Dashboard/
├── backend/
│   ├── GeoTrack.Api/
│   │   ├── Data/              # DbContext
│   │   ├── GraphQL/
│   │   │   ├── Mutations/     # GraphQL mutations
│   │   │   ├── Queries/       # GraphQL queries with spatial operations
│   │   │   ├── Subscriptions/ # Real-time subscriptions
│   │   │   └── Types/         # GraphQL type definitions
│   │   ├── Infrastructure/    # Design-time DbContext factory
│   │   ├── Models/            # Domain entities
│   │   ├── Services/          # Business logic
│   │   └── Program.cs         # API configuration
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── apollo/            # Apollo Client setup & operations
│   │   ├── components/
│   │   │   ├── Map/           # MapView, AssetMarker
│   │   │   └── UI/            # AssetPopup
│   │   ├── hooks/             # useAssets subscription hook
│   │   ├── styles/            # CSS
│   │   ├── types/             # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # Production setup
├── docker-compose.dev.yml     # Development (DB only)
└── init-db.sql               # PostGIS initialization
```

## License

MIT
