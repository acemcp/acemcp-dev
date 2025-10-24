-- Migration to add missing columns to MCPConfig table
-- Run this in Supabase SQL Editor

-- First, check if the columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add serverUrl column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' AND column_name = 'serverUrl'
    ) THEN
        ALTER TABLE "MCPConfig" ADD COLUMN "serverUrl" TEXT NOT NULL DEFAULT '';
    END IF;

    -- Add serverKey column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' AND column_name = 'serverKey'
    ) THEN
        ALTER TABLE "MCPConfig" ADD COLUMN "serverKey" TEXT;
    END IF;

    -- Add authHeader column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' AND column_name = 'authHeader'
    ) THEN
        ALTER TABLE "MCPConfig" ADD COLUMN "authHeader" TEXT;
    END IF;

    -- Modify authToken to be nullable if it exists and is NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' 
        AND column_name = 'authToken'
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE "MCPConfig" ALTER COLUMN "authToken" DROP NOT NULL;
    END IF;

    -- Add createdAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' AND column_name = 'createdAt'
    ) THEN
        ALTER TABLE "MCPConfig" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add updatedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "MCPConfig" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Drop mcpString column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MCPConfig' AND column_name = 'mcpString'
    ) THEN
        -- First, copy data from mcpString to serverUrl if serverUrl is empty
        UPDATE "MCPConfig" 
        SET "serverUrl" = "mcpString" 
        WHERE "serverUrl" = '' OR "serverUrl" IS NULL;
        
        -- Then drop the column
        ALTER TABLE "MCPConfig" DROP COLUMN "mcpString";
    END IF;
END $$;

-- After adding serverUrl, remove the default empty string
ALTER TABLE "MCPConfig" ALTER COLUMN "serverUrl" DROP DEFAULT;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'MCPConfig'
ORDER BY ordinal_position;
