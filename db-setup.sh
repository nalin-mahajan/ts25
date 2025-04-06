#!/bin/bash

# Push the schema to the database using drizzle
echo "Pushing schema to database..."
npm run db:push

echo "Schema push complete! The database is now ready to use."
