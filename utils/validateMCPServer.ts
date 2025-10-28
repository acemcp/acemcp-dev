// Add this helper function to validate MCP servers
async function validateMCPServer(
    url: string,
    authHeader?: string,
    authValue?: string
): Promise<{
    isValid: boolean;
    error?: string;
    tools?: any[];
    serverInfo?: any;
}> {
    try {
        // Create headers object
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Add auth header if provided
        if (authHeader && authValue) {
            headers[authHeader] = authValue.startsWith("Bearer ")
                ? authValue
                : `Bearer ${authValue}`;
        }

        // First, try to connect to the MCP server
        const response = await fetch("/api/validate-mcp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                serverUrl: url,
                authHeader: authHeader || null,
                authToken: authValue || null,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                isValid: false,
                error: data.error || "Failed to connect to MCP server",
            };
        }

        return {
            isValid: true,
            tools: data.tools,
            serverInfo: data.serverInfo,
        };
    } catch (error) {
        console.error("MCP validation error:", error);
        return {
            isValid: false,
            error: error instanceof Error ? error.message : "Connection failed",
        };
    }
}

// Update the MCP server state to include validation status
type MCPServerConfig = {
    id: string;
    url: string;
    authHeader: string;
    authValue: string;
    showAuth: boolean;
    isValidating: boolean;
    isValid: boolean | null;
    validationError?: string;
    tools?: any[];
    serverInfo?: any;
};

// In your component, update the state type:
const [mcpServers, setMcpServers] = useState<MCPServerConfig[]>([]);

// Update the addMcpServer function:
const addMcpServer = () => {
    const newId = `mcp-${Date.now()}`;
    setMcpServers((prev) => [
        ...prev,
        {
            id: newId,
            url: "",
            authHeader: "Authorization",
            authValue: "",
            showAuth: false,
            isValidating: false,
            isValid: null,
            validationError: undefined,
            tools: undefined,
            serverInfo: undefined,
        },
    ]);
};

// Add validation handler:
const validateServer = async (serverId: string) => {
    const server = mcpServers.find((s) => s.id === serverId);
    if (!server || !server.url.trim()) {
        alert("Please enter a server URL first");
        return;
    }

    // Set validating state
    updateMcpServer(serverId, { isValidating: true, isValid: null });

    // Perform validation
    const result = await validateMCPServer(
        server.url,
        server.showAuth ? server.authHeader : undefined,
        server.showAuth ? server.authValue : undefined
    );

    // Update server with validation results
    updateMcpServer(serverId, {
        isValidating: false,
        isValid: result.isValid,
        validationError: result.error,
        tools: result.tools,
        serverInfo: result.serverInfo,
    });
};

// Update the updateMcpServer function to handle new fields:
const updateMcpServer = (
    serverId: string,
    updates: Partial<MCPServerConfig>
) => {
    setMcpServers((prev) =>
        prev.map((server) =>
            server.id === serverId ? { ...server, ...updates } : server
        )
    );
};

// Update the handleDeploy validation:
const handleDeploy = async () => {
    // Validate that at least one MCP server is configured
    if (mcpServers.length === 0) {
        alert("Please add at least one MCP server");
        return;
    }

    // Validate all servers have URLs
    const invalidServers = mcpServers.filter((server) => !server.url.trim());
    if (invalidServers.length > 0) {
        alert("Please enter a URL for all MCP servers");
        return;
    }

    // Check if all servers are validated
    const unvalidatedServers = mcpServers.filter(
        (server) => server.isValid !== true
    );
    if (unvalidatedServers.length > 0) {
        const proceed = confirm(
            `${unvalidatedServers.length} server(s) haven't been validated. Do you want to continue anyway?`
        );
        if (!proceed) return;
    }

    // Check for failed validations
    const failedServers = mcpServers.filter((server) => server.isValid === false);
    if (failedServers.length > 0) {
        const proceed = confirm(
            `${failedServers.length} server(s) failed validation. Do you want to continue anyway?`
        );
        if (!proceed) return;
    }

    setIsLoading(true);
    try {
        // Save each MCP server configuration
        for (const server of mcpServers) {
            const configJson = {
                url: server.url,
                authentication: server.showAuth
                    ? {
                        headerName: server.authHeader,
                        headerValue: server.authValue,
                    }
                    : null,
                validationResult: {
                    isValid: server.isValid,
                    tools: server.tools,
                    serverInfo: server.serverInfo,
                },
            };

            await fetch("/api/mcp-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: promptMetadata?.id,
                    serverUrl: server.url,
                    authHeader: server.showAuth ? server.authHeader : null,
                    authToken: server.showAuth ? server.authValue : null,
                    configJson,
                }),
            });
        }

        // Redirect to main dashboard
        router.push(`/?projectId=${promptMetadata?.id}`);
    } catch (error) {
        console.error("Error deploying:", error);
        alert("Failed to deploy");
    } finally {
        setIsLoading(false);
    }
};