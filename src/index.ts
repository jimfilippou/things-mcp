#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { exec } from "child_process";
import { promisify } from "util";
import { z } from "zod";

const execAsync = promisify(exec);

const server = new McpServer({
  name: "things-mcp",
  version: "0.1.0",
});

async function openThingsURL(url: string): Promise<void> {
  try {
    await execAsync(`open "${url}"`);
  } catch (error) {
    throw new Error(`Failed to open Things URL: ${error}`);
  }
}

// URLSearchParams encodes spaces as '+', but Things URL scheme expects '%20'
function buildThingsQueryString(params: URLSearchParams): string {
  return params.toString().replace(/\+/g, "%20");
}

server.tool(
  "add-todo",
  {
    title: z
      .string()
      .optional()
      .describe("The title of the todo (ignored if titles is specified)"),
    titles: z
      .string()
      .optional()
      .describe("Multiple todo titles separated by new lines"),
    notes: z
      .string()
      .optional()
      .describe("Notes for the todo (max 10,000 chars)"),
    when: z
      .string()
      .optional()
      .describe(
        "When to schedule: today, tomorrow, evening, anytime, someday, date string, or date time string"
      ),
    deadline: z
      .string()
      .optional()
      .describe("Deadline date (YYYY-MM-DD format or natural language)"),
    tags: z.array(z.string()).optional().describe("Array of tag names"),
    "checklist-items": z
      .array(z.string())
      .optional()
      .describe("Checklist items to add (max 100)"),
    "use-clipboard": z
      .enum(["replace-title", "replace-notes", "replace-checklist-items"])
      .optional()
      .describe("Use clipboard content"),
    "list-id": z
      .string()
      .optional()
      .describe("ID of project or area to add to (takes precedence over list)"),
    list: z.string().optional().describe("Title of project or area to add to"),
    "heading-id": z
      .string()
      .optional()
      .describe("ID of heading within project (takes precedence over heading)"),
    heading: z.string().optional().describe("Title of heading within project"),
    completed: z.boolean().optional().describe("Mark as completed"),
    canceled: z
      .boolean()
      .optional()
      .describe("Mark as canceled (takes priority over completed)"),
    "show-quick-entry": z
      .boolean()
      .optional()
      .describe("Show quick entry dialog instead of adding"),
    reveal: z
      .boolean()
      .optional()
      .describe("Navigate to and show the created todo"),
    "creation-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for creation date"),
    "completion-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for completion date"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();

    // Handle title vs titles
    if (params.titles) {
      urlParams.set("titles", params.titles);
    } else if (params.title) {
      urlParams.set("title", params.title);
    }

    if (params.notes) urlParams.set("notes", params.notes);
    if (params.when) urlParams.set("when", params.when);
    if (params.deadline) urlParams.set("deadline", params.deadline);
    if (params.tags && params.tags.length > 0)
      urlParams.set("tags", params.tags.join(","));
    if (params["checklist-items"] && params["checklist-items"].length > 0) {
      urlParams.set("checklist-items", params["checklist-items"].join("\n"));
    }
    if (params["use-clipboard"])
      urlParams.set("use-clipboard", params["use-clipboard"]);
    if (params["list-id"]) urlParams.set("list-id", params["list-id"]);
    if (params.list) urlParams.set("list", params.list);
    if (params["heading-id"]) urlParams.set("heading-id", params["heading-id"]);
    if (params.heading) urlParams.set("heading", params.heading);
    if (params.completed !== undefined)
      urlParams.set("completed", params.completed.toString());
    if (params.canceled !== undefined)
      urlParams.set("canceled", params.canceled.toString());
    if (params["show-quick-entry"] !== undefined)
      urlParams.set("show-quick-entry", params["show-quick-entry"].toString());
    if (params.reveal !== undefined)
      urlParams.set("reveal", params.reveal.toString());
    if (params["creation-date"])
      urlParams.set("creation-date", params["creation-date"]);
    if (params["completion-date"])
      urlParams.set("completion-date", params["completion-date"]);

    const url = `things:///add?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    const todoName = params.titles
      ? "todos"
      : `todo "${params.title || "untitled"}"`;
    return {
      content: [
        {
          type: "text",
          text: `${todoName} created successfully in Things`,
        },
      ],
    };
  }
);

server.tool(
  "add-project",
  {
    title: z.string().describe("The title of the project"),
    notes: z
      .string()
      .optional()
      .describe("Notes for the project (max 10,000 chars)"),
    when: z
      .string()
      .optional()
      .describe(
        "When to schedule: today, tomorrow, evening, anytime, someday, date string, or date time string"
      ),
    deadline: z
      .string()
      .optional()
      .describe("Deadline date (YYYY-MM-DD format or natural language)"),
    tags: z.array(z.string()).optional().describe("Array of tag names"),
    "area-id": z
      .string()
      .optional()
      .describe("ID of area to add to (takes precedence over area)"),
    area: z.string().optional().describe("Title of area to add to"),
    "to-dos": z
      .array(z.string())
      .optional()
      .describe("Array of todo titles to create in the project"),
    completed: z.boolean().optional().describe("Mark as completed"),
    canceled: z
      .boolean()
      .optional()
      .describe("Mark as canceled (takes priority over completed)"),
    reveal: z
      .boolean()
      .optional()
      .describe("Navigate into the created project"),
    "creation-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for creation date"),
    "completion-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for completion date"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();
    urlParams.set("title", params.title);

    if (params.notes) urlParams.set("notes", params.notes);
    if (params.when) urlParams.set("when", params.when);
    if (params.deadline) urlParams.set("deadline", params.deadline);
    if (params.tags && params.tags.length > 0)
      urlParams.set("tags", params.tags.join(","));
    if (params["area-id"]) urlParams.set("area-id", params["area-id"]);
    if (params.area) urlParams.set("area", params.area);
    if (params["to-dos"] && params["to-dos"].length > 0) {
      urlParams.set("to-dos", params["to-dos"].join("\n"));
    }
    if (params.completed !== undefined)
      urlParams.set("completed", params.completed.toString());
    if (params.canceled !== undefined)
      urlParams.set("canceled", params.canceled.toString());
    if (params.reveal !== undefined)
      urlParams.set("reveal", params.reveal.toString());
    if (params["creation-date"])
      urlParams.set("creation-date", params["creation-date"]);
    if (params["completion-date"])
      urlParams.set("completion-date", params["completion-date"]);

    const url = `things:///add-project?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Project "${params.title}" created successfully in Things`,
        },
      ],
    };
  }
);

server.tool(
  "update",
  {
    id: z.string().describe("The ID of the todo to update (required)"),
    "auth-token": z
      .string()
      .describe("Things URL scheme authorization token (required)"),
    title: z.string().optional().describe("New title (replaces existing)"),
    notes: z
      .string()
      .optional()
      .describe("New notes (replaces existing, max 10,000 chars)"),
    "prepend-notes": z
      .string()
      .optional()
      .describe("Text to add before existing notes"),
    "append-notes": z
      .string()
      .optional()
      .describe("Text to add after existing notes"),
    when: z
      .string()
      .optional()
      .describe("When to schedule (cannot update repeating todos)"),
    deadline: z
      .string()
      .optional()
      .describe("Deadline date (cannot update repeating todos)"),
    tags: z.array(z.string()).optional().describe("Replace all current tags"),
    "add-tags": z
      .array(z.string())
      .optional()
      .describe("Add these tags to existing ones"),
    "checklist-items": z
      .array(z.string())
      .optional()
      .describe("Replace all checklist items (max 100)"),
    "prepend-checklist-items": z
      .array(z.string())
      .optional()
      .describe("Add checklist items to front"),
    "append-checklist-items": z
      .array(z.string())
      .optional()
      .describe("Add checklist items to end"),
    "list-id": z.string().optional().describe("ID of project/area to move to"),
    list: z.string().optional().describe("Title of project/area to move to"),
    "heading-id": z.string().optional().describe("ID of heading to move to"),
    heading: z.string().optional().describe("Title of heading to move to"),
    completed: z.boolean().optional().describe("Mark as completed/incomplete"),
    canceled: z.boolean().optional().describe("Mark as canceled/incomplete"),
    reveal: z
      .boolean()
      .optional()
      .describe("Navigate to and show the updated todo"),
    duplicate: z.boolean().optional().describe("Duplicate before updating"),
    "creation-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for creation date"),
    "completion-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for completion date"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();
    urlParams.set("id", params.id);
    urlParams.set("auth-token", params["auth-token"]);

    if (params.title) urlParams.set("title", params.title);
    if (params.notes !== undefined) urlParams.set("notes", params.notes);
    if (params["prepend-notes"])
      urlParams.set("prepend-notes", params["prepend-notes"]);
    if (params["append-notes"])
      urlParams.set("append-notes", params["append-notes"]);
    if (params.when !== undefined) urlParams.set("when", params.when);
    if (params.deadline !== undefined)
      urlParams.set("deadline", params.deadline);
    if (params.tags) urlParams.set("tags", params.tags.join(","));
    if (params["add-tags"])
      urlParams.set("add-tags", params["add-tags"].join(","));
    if (params["checklist-items"])
      urlParams.set("checklist-items", params["checklist-items"].join("\n"));
    if (params["prepend-checklist-items"])
      urlParams.set(
        "prepend-checklist-items",
        params["prepend-checklist-items"].join("\n")
      );
    if (params["append-checklist-items"])
      urlParams.set(
        "append-checklist-items",
        params["append-checklist-items"].join("\n")
      );
    if (params["list-id"]) urlParams.set("list-id", params["list-id"]);
    if (params.list) urlParams.set("list", params.list);
    if (params["heading-id"]) urlParams.set("heading-id", params["heading-id"]);
    if (params.heading) urlParams.set("heading", params.heading);
    if (params.completed !== undefined)
      urlParams.set("completed", params.completed.toString());
    if (params.canceled !== undefined)
      urlParams.set("canceled", params.canceled.toString());
    if (params.reveal !== undefined)
      urlParams.set("reveal", params.reveal.toString());
    if (params.duplicate !== undefined)
      urlParams.set("duplicate", params.duplicate.toString());
    if (params["creation-date"])
      urlParams.set("creation-date", params["creation-date"]);
    if (params["completion-date"])
      urlParams.set("completion-date", params["completion-date"]);

    const url = `things:///update?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Todo updated successfully in Things`,
        },
      ],
    };
  }
);

server.tool(
  "update-project",
  {
    id: z.string().describe("The ID of the project to update (required)"),
    "auth-token": z
      .string()
      .describe("Things URL scheme authorization token (required)"),
    title: z.string().optional().describe("New title (replaces existing)"),
    notes: z
      .string()
      .optional()
      .describe("New notes (replaces existing, max 10,000 chars)"),
    "prepend-notes": z
      .string()
      .optional()
      .describe("Text to add before existing notes"),
    "append-notes": z
      .string()
      .optional()
      .describe("Text to add after existing notes"),
    when: z
      .string()
      .optional()
      .describe("When to schedule (cannot update repeating projects)"),
    deadline: z
      .string()
      .optional()
      .describe("Deadline date (cannot update repeating projects)"),
    tags: z.array(z.string()).optional().describe("Replace all current tags"),
    "add-tags": z
      .array(z.string())
      .optional()
      .describe("Add these tags to existing ones"),
    "area-id": z.string().optional().describe("ID of area to move to"),
    area: z.string().optional().describe("Title of area to move to"),
    completed: z.boolean().optional().describe("Mark as completed/incomplete"),
    canceled: z.boolean().optional().describe("Mark as canceled/incomplete"),
    reveal: z
      .boolean()
      .optional()
      .describe("Navigate to and show the updated project"),
    duplicate: z.boolean().optional().describe("Duplicate before updating"),
    "creation-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for creation date"),
    "completion-date": z
      .string()
      .optional()
      .describe("ISO8601 date time string for completion date"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();
    urlParams.set("id", params.id);
    urlParams.set("auth-token", params["auth-token"]);

    if (params.title) urlParams.set("title", params.title);
    if (params.notes !== undefined) urlParams.set("notes", params.notes);
    if (params["prepend-notes"])
      urlParams.set("prepend-notes", params["prepend-notes"]);
    if (params["append-notes"])
      urlParams.set("append-notes", params["append-notes"]);
    if (params.when !== undefined) urlParams.set("when", params.when);
    if (params.deadline !== undefined)
      urlParams.set("deadline", params.deadline);
    if (params.tags) urlParams.set("tags", params.tags.join(","));
    if (params["add-tags"])
      urlParams.set("add-tags", params["add-tags"].join(","));
    if (params["area-id"]) urlParams.set("area-id", params["area-id"]);
    if (params.area) urlParams.set("area", params.area);
    if (params.completed !== undefined)
      urlParams.set("completed", params.completed.toString());
    if (params.canceled !== undefined)
      urlParams.set("canceled", params.canceled.toString());
    if (params.reveal !== undefined)
      urlParams.set("reveal", params.reveal.toString());
    if (params.duplicate !== undefined)
      urlParams.set("duplicate", params.duplicate.toString());
    if (params["creation-date"])
      urlParams.set("creation-date", params["creation-date"]);
    if (params["completion-date"])
      urlParams.set("completion-date", params["completion-date"]);

    const url = `things:///update-project?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    return {
      content: [
        {
          type: "text",
          text: `Project updated successfully in Things`,
        },
      ],
    };
  }
);

server.tool(
  "show",
  {
    id: z
      .string()
      .optional()
      .describe(
        "ID of area, project, tag, todo, or built-in list (inbox, today, anytime, upcoming, someday, logbook, tomorrow, deadlines, repeating, all-projects, logged-projects)"
      ),
    query: z
      .string()
      .optional()
      .describe("Name of area, project, tag, or built-in list to show"),
    filter: z.array(z.string()).optional().describe("Filter by tag names"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();

    if (params.id) {
      urlParams.set("id", params.id);
    } else if (params.query) {
      urlParams.set("query", params.query);
    }

    if (params.filter && params.filter.length > 0) {
      urlParams.set("filter", params.filter.join(","));
    }

    const url = `things:///show?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    const target = params.id || params.query || "Things";
    return {
      content: [
        {
          type: "text",
          text: `Opened ${target} in Things`,
        },
      ],
    };
  }
);

server.tool(
  "search",
  {
    query: z.string().optional().describe("Search query"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();
    if (params.query) urlParams.set("query", params.query);

    const url = `things:///search?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    return {
      content: [
        {
          type: "text",
          text: params.query
            ? `Searching for "${params.query}" in Things`
            : "Opened search in Things",
        },
      ],
    };
  }
);

server.tool(
  "version",
  {
    // No parameters needed
  },
  async () => {
    const url = `things:///version`;
    await openThingsURL(url);

    return {
      content: [
        {
          type: "text",
          text: "Retrieved Things version information",
        },
      ],
    };
  }
);

server.tool(
  "json",
  {
    "auth-token": z
      .string()
      .optional()
      .describe("Authorization token (required for update operations)"),
    data: z
      .string()
      .describe("JSON string containing array of todo and project objects"),
    reveal: z
      .boolean()
      .optional()
      .describe("Navigate to and show the first created item"),
  },
  async (params) => {
    const urlParams = new URLSearchParams();

    if (params["auth-token"]) {
      urlParams.set("auth-token", params["auth-token"]);
    }

    urlParams.set("data", params.data);

    if (params.reveal !== undefined) {
      urlParams.set("reveal", params.reveal.toString());
    }

    const url = `things:///json?${buildThingsQueryString(urlParams)}`;
    await openThingsURL(url);

    return {
      content: [
        {
          type: "text",
          text: "JSON data processed successfully in Things",
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
