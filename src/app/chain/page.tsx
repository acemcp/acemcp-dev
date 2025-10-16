"use client";
import { useState, useRef } from "react";

export default function CodeGeneratorWorkflowPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [installCommandCopied, setInstallCommandCopied] = useState(false);
  const [generateCommandCopied, setGenerateCommandCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.name.endsWith(".json") ||
        file.name.endsWith(".yaml") ||
        file.name.endsWith(".yml")
      ) {
        setSelectedFile(file);
      } else {
        alert("Please upload a valid OpenAPI file (.json, .yaml, or .yml)");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const copyToClipboard = (
    text: string,
    commandType: "install" | "generate",
  ) => {
    navigator.clipboard.writeText(text).then(() => {
      if (commandType === "install") {
        setInstallCommandCopied(true);
        setTimeout(() => setInstallCommandCopied(false), 2000);
      } else {
        setGenerateCommandCopied(true);
        setTimeout(() => setGenerateCommandCopied(false), 2000);
      }
    });
  };

  const installCommand = "npm install -g openapi-mcp-generator";
  const generateCommand = selectedFile
    ? `openapi-mcp-generator -i "${selectedFile.name}" -o ./generated-client`
    : "";

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white min-h-screen">
      <h1 className="text-3xl font-extrabold mb-8 text-gray-800 border-b pb-4">
        OpenAPI MCP Generator Workflow
      </h1>

      <div className="space-y-8">
        {/* Step 1: File Upload */}
        <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Step 1: Upload Your OpenAPI Specification
          </h2>
          <p className="text-gray-600 mb-4">
            Select your <code>openapi.json</code> or <code>openapi.yaml</code>{" "}
            file. The commands to generate the client will be displayed below.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".json,.yaml,.yml"
            className="block w-full text-sm text-gray-500
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-full file:border-0
                                   file:text-sm file:font-semibold
                                   file:bg-indigo-50 file:text-indigo-700
                                   hover:file:bg-indigo-100"
          />
          {selectedFile && (
            <p className="mt-4 text-green-600 font-medium">
              Selected file: <strong>{selectedFile.name}</strong>
            </p>
          )}
        </div>

        {/* Step 2: Display Commands */}
        {selectedFile && (
          <div className="p-6 border-2 border-dashed border-indigo-300 rounded-xl bg-indigo-50">
            <h2 className="text-2xl font-bold mb-4 text-indigo-800">
              Step 2: Run These Commands Locally
            </h2>

            {/* Installation Command */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First, install the generator (if you haven't already):
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-grow p-3 bg-gray-900 text-white rounded-lg font-mono text-sm">
                  {installCommand}
                </code>
                <button
                  onClick={() => copyToClipboard(installCommand, "install")}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400"
                >
                  {installCommandCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Generation Command */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Now, run the generator with your file:
              </label>
              <div className="flex items-center space-x-2">
                <code className="flex-grow p-3 bg-gray-900 text-white rounded-lg font-mono text-sm">
                  {generateCommand}
                </code>
                <button
                  onClick={() => copyToClipboard(generateCommand, "generate")}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:bg-gray-400"
                >
                  {generateCommandCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
