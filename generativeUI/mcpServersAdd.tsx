import React, { useState } from "react";
type MCPServer = {
  id: string;
  name: string;
  url: string;
  authType: "jwt" | "oauth";
  status: "running" | "connected" | "disconnected";
  isTest?: boolean; // true for test servers
};

const mockServers: MCPServer[] = [
  {
    id: "test1",
    name: "Notion Test MCP",
    url: "https://notion-mcp.test/mcp",
    authType: "oauth",
    status: "connected",
    isTest: true,
  },
  {
    id: "user1",
    name: "User MCP 1",
    url: "https://user1-mcp.workers.dev/mcp",
    authType: "jwt",
    status: "running",
  },
];

export default function MCPSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [servers, setServers] = useState<MCPServer[]>(mockServers);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const connectServer = (id: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "connected" } : s))
    );
  };

  const removeServer = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id));
  };

  const deployServer = () => {
    // Mock deployment flow
    const newServer: MCPServer = {
      id: `user${servers.length + 1}`,
      name: `User MCP ${servers.length + 1}`,
      url: `https://user${servers.length + 1}-mcp.workers.dev/mcp`,
      authType: "jwt",
      status: "running",
    };
    setServers((prev) => [...prev, newServer]);
  };

  const testServers = servers.filter((s) => s.isTest);
  const userServers = servers.filter((s) => !s.isTest);

  return (
    <>
      <button
        className="fixed top-4 left-4 bg-black text-white px-3 py-1 rounded z-50 border border-white/10 hover:border-white transition-colors"
        onClick={toggleSidebar}
      >
        {isOpen ? "Hide MCP Sidebar" : "Show MCP Sidebar"}
      </button>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-black/95 shadow-lg p-4 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">MCP Servers</h2>

        {testServers.length > 0 && (
          <>
            <h3 className="text-lg font-semibold mb-2">Test MCP Servers</h3>
            <ul className="mb-4">
              {testServers.map((s) => (
                <li
                  key={s.id}
                  className="bg-white p-2 mb-2 rounded shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-500">{s.url}</p>
                    <p className="text-xs">
                      Status: <span className="font-semibold">{s.status}</span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      className="bg-black text-white px-2 py-1 rounded text-sm border border-white/10 hover:border-white transition-colors"
                      onClick={() => connectServer(s.id)}
                    >
                      Connect
                    </button>
                    <button
                      className="bg-black text-white px-2 py-1 rounded text-sm border border-white/10 hover:border-white transition-colors"
                      onClick={() => removeServer(s.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <h3 className="text-lg font-semibold mb-2">User MCP Servers</h3>
        <ul>
          {userServers.map((s) => (
            <li
              key={s.id}
              className="bg-white p-2 mb-2 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">{s.url}</p>
                <p className="text-xs">
                  Status: <span className="font-semibold">{s.status}</span>
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  className="bg-black text-white px-2 py-1 rounded text-sm border border-white/10 hover:border-white transition-colors"
                  onClick={() => connectServer(s.id)}
                >
                  Connect
                </button>
                <button
                  className="bg-black text-white px-2 py-1 rounded text-sm border border-white/10 hover:border-white transition-colors"
                  onClick={() => removeServer(s.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <button
          className="mt-4 w-full bg-black text-white px-3 py-2 rounded border border-white/10 hover:border-white transition-colors"
          onClick={deployServer}
        >
          Deploy New MCP Server
        </button>
      </aside>
    </>
  );
}
