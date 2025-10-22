# AcEMCP Authentication & Onboarding Workflow Documentation

## Overview
This document describes the complete authentication and onboarding workflow for the AcEMCP platform, including user authentication, project creation, and MCP server configuration.

---

## 🔐 Authentication Flow

### 1. Initial User Visit
**Entry Points:**
- `/` (Main Dashboard) - Requires authentication
- `/landing` (Landing Page) - Public, but prompts redirect to auth
- `/authentication` - Sign-in/Sign-up page

### 2. Authentication Check
When a user visits the main dashboard (`/page.tsx`):
```typescript
useEffect(() => {
  if (!authLoading && !user) {
    router.push("/authentication?redirectTo=/");
  }
}, [user, authLoading, router]);
```

### 3. Authentication Methods
Users can authenticate via:
- **Email/Password** - Traditional sign-up/sign-in
- **GitHub OAuth** - Social authentication
- **Other OAuth providers** (configured in Supabase)

### 4. Post-Authentication Flow
After successful authentication (`/auth/callback/page.tsx`):

```typescript
// 1. Sync user to Prisma database
await fetch('/api/user/sync', { method: 'POST' });

// 2. Check if user has projects
const response = await fetch('/api/user/projects');
const data = await response.json();

// 3. Route based on user status
if (data.projects.length === 0) {
  // New user → Onboarding
  router.push('/onboarding');
} else {
  // Existing user → Requested page or landing
  router.push(redirectTo || '/landing');
}
```

---

## 📊 Database Schema & User Management

### User Table
```prisma
model User {
  id              String    @id @default(uuid()) @db.Uuid
  name            String?
  email           String?   @unique
  emailVerified   DateTime?
  image           String?
  passwordHash    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  accounts        Account[]
  projects        Project[]
  mcpConfigs      MCPConfig[]
  conversations   Conversation[]
}
```

### Account Table (OAuth Linking)
```prisma
model Account {
  id                String   @id @default(uuid()) @db.Uuid
  userId            String   @db.Uuid
  type              String
  provider          String   // "github", "google", etc.
  providerAccountId String   // Provider's unique user ID
  refresh_token     String?  @db.Text
  access_token      String?  @db.Text
  expires_at        Int?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([provider, providerAccountId])
}
```

### User Sync Process
**Endpoint:** `POST /api/user/sync`

1. Retrieves authenticated user from Supabase
2. Creates or updates User record in Prisma
3. Links OAuth account if applicable
4. Ensures unique `provider` + `providerAccountId` constraint

```typescript
// OAuth Account Creation
await prisma.account.create({
  data: {
    userId: user.id,
    type: 'oauth',
    provider: provider, // e.g., "github"
    providerAccountId: providerAccountId,
    access_token: null, // Managed by Supabase
  }
});
```

---

## 🎯 Onboarding Workflow

### Step 1: Project Metadata Collection
**Page:** `/onboarding` (Step 1)

**Fields Collected:**
- **Project Name*** (required)
- **Description** - What the agent does
- **Agent Identity** - Persona/role of the agent
- **Tone** - Communication style
- **Instructions** - Specific behavioral guidelines

**API Call:** `POST /api/project/create`
```json
{
  "name": "Customer Support Agent",
  "description": "Handles customer inquiries and support tickets",
  "prompt": "Build a customer support agent...",
  "identity": "Helpful customer service assistant",
  "instructions": "Always be polite and professional",
  "tone": "Professional and friendly"
}
```

**Database Records Created:**
- `Project` record with metadata
- `ProjectMetadata` record (one-to-one relationship)

### Step 2: Metadata Review & Editing
**Page:** `/onboarding` (Step 2)

Users can review and edit all project metadata fields in an editable format. Changes are saved via:

**API Call:** `PATCH /api/project/{id}`
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "identity": "Updated identity",
  "instructions": "Updated instructions",
  "tone": "Updated tone"
}
```

### Step 3: MCP Server Configuration
**Page:** `/onboarding` (Step 3)

#### Popular MCP Servers Marketplace
Pre-configured MCP servers available for selection:

| Server | Description | Category |
|--------|-------------|----------|
| **GitHub** | Access repositories, issues, PRs | Development |
| **Slack** | Send messages, manage channels | Communication |
| **PostgreSQL** | Query and manage databases | Database |
| **Gmail** | Read, send, manage emails | Communication |
| **Google Calendar** | Manage events and schedules | Productivity |
| **Notion** | Access Notion pages/databases | Productivity |
| **Google Drive** | Manage files in Drive | Storage |
| **Custom** | Add your own MCP server | Custom |

#### MCP Configuration Input
Users can paste their MCP server configuration JSON:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "slack": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-slack"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-...",
        "SLACK_TEAM_ID": "T..."
      }
    }
  }
}
```

**API Call:** `POST /api/mcp-config`
```json
{
  "projectId": "uuid",
  "mcpString": "{...}",
  "authToken": "",
  "configJson": {...}
}
```

#### Deploy Button
Final step redirects to main dashboard with project context:
```typescript
router.push(`/?projectId=${projectId}`);
```

---

## 🔄 Complete User Journey

### New User Flow
```
1. User visits /landing
2. User enters prompt → "Build a customer support agent"
3. Not authenticated → Redirect to /authentication?prompt=...
4. User signs up with GitHub
5. OAuth callback → /auth/callback
6. System syncs user to database
7. No projects found → Redirect to /onboarding?prompt=...
8. Step 1: Fill project metadata (pre-filled with prompt)
9. Step 2: Review and edit metadata
10. Step 3: Select MCP servers & paste config
11. Click "Deploy" → Redirect to /?projectId=...
12. User starts using the platform
```

### Returning User Flow
```
1. User visits /landing
2. User enters prompt
3. Already authenticated → Redirect to /onboarding?prompt=...
4. Create new project with prompt
5. Configure and deploy
```

### Direct Dashboard Access
```
1. User visits /
2. Not authenticated → Redirect to /authentication?redirectTo=/
3. After auth → Check projects
4. Has projects → Return to /
5. No projects → Redirect to /onboarding
```

---

## 📡 API Endpoints

### User Management
- `POST /api/user/sync` - Sync Supabase user to Prisma
- `GET /api/user/projects` - Get all user projects

### Project Management
- `POST /api/project/create` - Create new project with metadata
- `GET /api/project/{id}` - Get project details
- `PATCH /api/project/{id}` - Update project metadata

### MCP Configuration
- `POST /api/mcp-config` - Save MCP server configuration

---

## 🔒 Security Considerations

### Authentication
- All API routes check Supabase authentication
- User ID from Supabase session is used for database operations
- No trust in client-provided user IDs

### Authorization
- Project ownership verified before updates
- User can only access their own projects
- MCP configs linked to both user and project

### Data Validation
- Required fields validated on both client and server
- JSON parsing with error handling for MCP configs
- Unique constraints enforced at database level

---

## 🎨 UI/UX Features

### Modern Design
- Gradient backgrounds with blur effects
- Smooth transitions and animations
- Responsive layout (mobile-friendly)
- Dark theme with slate color palette

### Progress Indicators
- 3-step progress bar with checkmarks
- Loading states for all async operations
- Clear error messages

### MCP Server Cards
- Visual selection with icons
- Category badges
- Selected state highlighting
- Hover effects

---

## 🚀 Deployment Considerations

### Environment Variables Required
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Database
DATABASE_URL=
DIRECT_URL=
```

### Database Migrations
Run Prisma migrations before deployment:
```bash
npx prisma migrate deploy
npx prisma generate
```

### OAuth Configuration
Configure OAuth providers in Supabase:
1. GitHub OAuth app
2. Callback URL: `{YOUR_DOMAIN}/auth/callback`
3. Add provider credentials to Supabase

---

## 📝 Future Enhancements

### Potential Improvements
1. **MCP Server Validation** - Test MCP configs before saving
2. **Project Templates** - Pre-configured project types
3. **Team Collaboration** - Share projects with team members
4. **Version Control** - Track project metadata changes
5. **MCP Marketplace** - Browse and install MCP servers
6. **Analytics Dashboard** - Track agent performance
7. **A/B Testing** - Test different configurations

---

## 🐛 Troubleshooting

### Common Issues

**User not syncing to database:**
- Check Supabase connection
- Verify DATABASE_URL is correct
- Check Prisma client generation

**OAuth not working:**
- Verify OAuth app credentials in Supabase
- Check callback URL configuration
- Ensure provider is enabled in Supabase

**MCP config not saving:**
- Validate JSON format
- Check project ownership
- Verify authentication token

---

## 📚 References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Last Updated:** October 22, 2025
**Version:** 1.0.0
