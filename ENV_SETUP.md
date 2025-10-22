# Environment Variables Setup

## Required Environment Variables

Create a `.env` or `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database Configuration (Supabase Postgres)
DATABASE_URL=your_postgres_connection_string
DIRECT_URL=your_postgres_direct_connection_string
```

## How to Get These Values

### Supabase Configuration
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Database URLs
1. In Supabase dashboard, go to **Settings** → **Database**
2. Under **Connection string**, select **URI** tab
3. Copy the connection string and replace `[YOUR-PASSWORD]` with your actual database password
4. Use this for both `DATABASE_URL` and `DIRECT_URL`

## Example

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sfaqwyumdxebchjxyyyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database - Direct Connection (for migrations and schema changes)
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.sfaqwyumdxebchjxyyyv.supabase.co:5432/postgres

# Database - Pooled Connection (for application queries - recommended for production)
DIRECT_URL=postgresql://postgres.sfaqwyumdxebchjxyyyv:[YOUR_PASSWORD]@aws-1-us-east-2.pooler.supabase.com:5432/postgres
```

## Which Connection String to Use?

- **DATABASE_URL**: Direct connection - Use for Prisma migrations and schema operations
- **DIRECT_URL**: Pooled connection - Use for application queries (better performance)

**Note:** Replace `[YOUR_PASSWORD]` with your actual Supabase database password in both URLs.

## After Setting Up

1. Run `npx prisma generate` to generate the Prisma client
2. Run `npx prisma db push` to sync your schema with the database
3. Restart your development server with `npm run dev`

## Security Notes

- **Never commit `.env` files to version control**
- The `.env` file is already in `.gitignore`
- Use `.env.local` for local development
- Use environment variables in your deployment platform for production
