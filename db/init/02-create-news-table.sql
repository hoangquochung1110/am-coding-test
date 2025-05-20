-- Create news table with full-text search support
CREATE TABLE IF NOT EXISTS news (
    "id" BIGSERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" VARCHAR(2048) NOT NULL UNIQUE,
    "imageUrl" VARCHAR(2048),
    "publishedAt" TIMESTAMP NOT NULL,
    "sourceName" VARCHAR(255),
    "author" VARCHAR(255),
    "provider" VARCHAR(50) NOT NULL DEFAULT 'newsapi',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
