-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE geotrack TO postgres;
