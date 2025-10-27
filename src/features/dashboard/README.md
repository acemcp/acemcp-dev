# Dashboard Feature Components

This folder contains reusable dashboard UI components that are shared across the application. These components provide a consistent UI/UX across different pages while maintaining a single source of truth for the dashboard interface.

## Architecture

The dashboard feature follows a modular component architecture where each UI section is extracted into its own component. This allows for:

- **Single Source of Truth**: Update the UI in one place, and it reflects everywhere
- **Maintainability**: Easy to update and maintain dashboard features
- **Reusability**: Components can be used in multiple pages
- **Consistency**: Ensures UI consistency across the application

## Components

### Layout Components

#### `ChatPlaygroundLayout`
Main layout component that orchestrates the chat interface, workflow view, and agent configuration sidebar.

**Props:**
- `messages: UIMessage[]` - Chat messages to display
- `isWorkflowViewOpen: boolean` - Controls workflow view visibility
- `onToggleWorkflowView: () => void` - Callback to toggle workflow view

**Usage:**
```tsx
<ChatPlaygroundLayout
  messages={messages}
  isWorkflowViewOpen={isWorkflowViewOpen}
  onToggleWorkflowView={() => setIsWorkflowViewOpen(!isWorkflowViewOpen)}
/>
```

#### `DashboardHeader`
Header component with navigation tabs, breadcrumbs, and user profile.

**Props:**
- `user: User | null` - Current user object
- `activeTab: TabKey` - Currently active tab
- `onTabChange: (tab: TabKey) => void` - Tab change callback
- `breadcrumb: string` - Breadcrumb text to display

**Usage:**
```tsx
<DashboardHeader
  user={user}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  breadcrumb={breadcrumb}
/>
```

### Individual Components

#### `ChatInterface`
Chat interface with collapsible workflow view toggle.

**Props:**
- `isWorkflowViewOpen: boolean` - Workflow view state
- `onToggleWorkflowView: () => void` - Toggle callback

#### `WorkflowView`
Displays the agent workflow visualization.

**Props:**
- `messages: UIMessage[]` - Messages for workflow visualization

#### `AgentConfigSidebar`
Sidebar for agent configuration settings.

**Props:** None

### Tab Components

#### `WorkflowTab`
Full workflow view tab with metrics and visualization.

**Props:**
- `messages: UIMessage[]` - Messages for workflow display

#### `WorkflowBuilderTab`
Placeholder for the upcoming workflow builder feature.

**Props:** None

## Usage in Pages

### Example: Project Page

```tsx
import {
  ChatPlaygroundLayout,
  DashboardHeader,
  WorkflowTab,
  WorkflowBuilderTab,
} from "@/features/dashboard";

export default function ProjectPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("chat");
  const [isWorkflowViewOpen, setIsWorkflowViewOpen] = useState(true);
  const { messages } = useChat({ /* ... */ });
  
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          breadcrumb={breadcrumb}
        />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
          {activeTab === "chat" && (
            <ChatPlaygroundLayout
              messages={messages}
              isWorkflowViewOpen={isWorkflowViewOpen}
              onToggleWorkflowView={() => setIsWorkflowViewOpen(!isWorkflowViewOpen)}
            />
          )}
          {activeTab === "workflow" && <WorkflowTab messages={messages} />}
          {activeTab === "workflow_builder" && <WorkflowBuilderTab />}
        </main>
      </div>
    </div>
  );
}
```

## Benefits

1. **DRY Principle**: No code duplication between pages
2. **Easy Updates**: Change UI in one place, updates everywhere
3. **Type Safety**: Full TypeScript support with proper interfaces
4. **Consistent UX**: Same behavior and appearance across all pages
5. **Maintainable**: Clear component boundaries and responsibilities

## File Structure

```
src/features/dashboard/
├── README.md                    # This file
├── index.ts                     # Barrel export for easy imports
├── ChatPlaygroundLayout.tsx     # Main chat layout
├── DashboardHeader.tsx          # Header with tabs
├── ChatInterface.tsx            # Chat UI component
├── WorkflowView.tsx             # Workflow visualization
├── AgentConfigSidebar.tsx       # Config sidebar
├── WorkflowTab.tsx              # Workflow tab view
└── WorkflowBuilderTab.tsx       # Workflow builder placeholder
```

## Dependencies

These components depend on:
- `@/components/ui/*` - Shadcn UI components
- `@/lib/utils` - Utility functions
- `ai` package - For UIMessage types
- `lucide-react` - Icons
- `generativeUI/*` - Base UI components (InputDemo, AgentPreview, AgentConfig)

## Future Enhancements

- Add loading states
- Add error boundaries
- Add analytics tracking
- Implement workflow builder functionality
- Add keyboard shortcuts
- Add accessibility improvements
