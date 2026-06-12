import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

process.stdin.on("data", (data) => {
  console.log(`Received: ${data}`);
});

const PROJECT_ROOT = "/Users/mihailzuravlev/Desktop/projects/ai-learn-test";

const server = new McpServer({
  name: "learning-mcp",
  version: "1.0.0",
});

server.registerTool(
  "get_learning_status",
  {
    description: "Returns current learning status for Mikle",
    inputSchema: z.object({
      topic: z.string().optional(),
    }),
  },
  async ({ topic }) => {
    const currentTopic = topic ?? "LLM / MCP";

    return {
      content: [
        {
          type: "text",
          text: [
            `Current topic: ${currentTopic}`,
            "Learning mode: practical-first",
            "Goal: understand MCP through a working local tool",
            "Next step: build a project-aware agent",
          ].join("\n"),
        },
      ],
    };
  },
);

server.registerTool(
  "list_directory",
  {
    description:
      "List files and directories inside the project. Use this before reading files when the location is unknown.",
    inputSchema: z.object({
      path: z.string().optional(),
    }),
  },
  async ({ path: requestedPath }) => {
    const targetPath = requestedPath
      ? path.resolve(PROJECT_ROOT, requestedPath)
      : PROJECT_ROOT;

    if (!targetPath.startsWith(PROJECT_ROOT)) {
      throw new Error("Access denied");
    }

    console.error("list_directory:", targetPath);

    const entries = await fs.readdir(targetPath, {
      withFileTypes: true,
    });

    const result = entries
      .map((entry) =>
        entry.isDirectory() ? `[DIR] ${entry.name}` : `[FILE] ${entry.name}`,
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  },
);

server.registerTool(
  "read_file",
  {
    description:
      "Read a text file from the project. Always use list_directory first if the exact path is unknown.",
    inputSchema: z.object({
      path: z.string(),
    }),
  },
  async ({ path: requestedPath }) => {
    const targetPath = path.resolve(PROJECT_ROOT, requestedPath);

    if (!targetPath.startsWith(PROJECT_ROOT)) {
      throw new Error("Access denied");
    }

    console.error("read_file:", targetPath);

    const content = await fs.readFile(targetPath, "utf8");

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();

await server.connect(transport);
