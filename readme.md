# Things MCP Server
[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/jimfilippou/things-mcp)](https://archestra.ai/mcp-catalog/jimfilippou__things-mcp)

A Model Context Protocol (MCP) server that provides seamless integration with the [Things](https://culturedcode.com/things/) productivity app. This server enables AI assistants to create, update, and manage your todos and projects in Things using its comprehensive URL scheme.

## Features

- ✅ **Full Things URL Scheme Support** - Complete implementation of all Things URL commands
- ✅ **Create Todos** - Add single or multiple todos with rich metadata
- ✅ **Create Projects** - Build projects with nested todos and organization
- ✅ **Update Items** - Modify existing todos and projects
- ✅ **Smart Scheduling** - Support for natural language dates and times
- ✅ **Advanced Organization** - Tags, areas, headings, and checklist items
- ✅ **JSON Operations** - Complex batch operations via JSON
- ✅ **Search & Navigation** - Find and show specific items or lists
- ✅ **Proper URL Encoding** - Handles special characters and spaces correctly

## Hosted deployment

A hosted deployment is available on [Fronteir AI](https://fronteir.ai/mcp/jimfilippou-things-mcp).

## Prerequisites

- **macOS** - Required for Things app integration
- **Things 3** - The Things app must be installed and running
- **Node.js** - Version 16 or higher
- **MCP Client** - Such as Claude Desktop app or any MCP-compatible client

## Installation

### Using npx (Recommended)

No installation required! Use directly with:

```bash
npx things-mcp
```

### Global Installation

```bash
npm install -g things-mcp
```

## Configuration

### Claude Desktop

Add the server to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Using npx (recommended):**

```json
{
  "mcpServers": {
    "things": {
      "command": "npx",
      "args": ["-y", "things-mcp"]
    }
  }
}
```

**Using global installation:**

```json
{
  "mcpServers": {
    "things": {
      "command": "things-mcp"
    }
  }
}
```

## Usage

Once configured, you can interact with Things through your MCP client using natural language. Here are some examples:

### Creating Todos

```
"Create a todo to buy groceries for tonight"
"Add a todo 'Call dentist' with a deadline of next Friday"
"Create multiple todos: milk, bread, eggs in my Shopping project"
```

### Creating Projects

```
"Create a project called 'Website Redesign' in my Work area"
"Make a project 'Vacation Planning' with todos: book flights, reserve hotel, research activities"
```

### Updating Items

```
"Update my 'Call dentist' todo to be due tomorrow"
"Add notes to my website project about the new color scheme"
"Mark the groceries todo as completed"
```

### Organization

```
"Show my Today list"
"Search for all todos tagged with 'urgent'"
"Open the Someday list filtered by work tags"
```

## Available Commands

### add-todo

Create a new todo with extensive customization options:

- **title/titles** - Single title or multiple titles separated by newlines
- **notes** - Rich text notes (max 10,000 characters)
- **when** - Natural language scheduling (today, tomorrow, evening, specific dates)
- **deadline** - Due dates with natural language support
- **tags** - Array of tag names for organization
- **checklist-items** - Subtasks within the todo
- **list/list-id** - Project or area assignment
- **heading/heading-id** - Specific heading within projects
- **completed/canceled** - Set completion status
- **show-quick-entry** - Show quick entry dialog
- **reveal** - Navigate to created todo

### add-project

Create a new project with full configuration:

- **title** - Project name
- **notes** - Project description
- **when** - Scheduling options
- **deadline** - Project due date
- **tags** - Organization tags
- **area/area-id** - Area assignment
- **to-dos** - Array of todo titles to create within project
- **completed/canceled** - Project status
- **reveal** - Navigate to created project

### update

Modify existing todos:

- **id** - Todo ID (required)
- **auth-token** - Authorization token (required)
- **title** - New title
- **notes/prepend-notes/append-notes** - Note modifications
- **when** - Reschedule
- **deadline** - Change due date
- **tags/add-tags** - Tag management
- **checklist-items** - Modify checklist
- **list/heading** - Move to different location
- **completed/canceled** - Status changes
- **duplicate** - Create copy before updating

### update-project

Modify existing projects with similar options to update command.

### show

Navigate to specific items or lists:

- **id** - Specific item ID or built-in list (inbox, today, anytime, etc.)
- **query** - Search by name
- **filter** - Filter by tags

### search

Search across all Things data:

- **query** - Search terms

### json

Advanced batch operations using JSON format for complex project structures.

### version

Get Things app and URL scheme version information.

## Authorization

Some operations (updates) require an authorization token from Things:

1. **macOS**: Things → Settings → General → Enable Things URLs → Manage
2. **iOS**: Settings → General → Things URLs

Copy your unique token and use it with update operations.

## Getting Item IDs

To update specific items, you need their IDs:

### macOS

- Control-click on todo/project → Share → Copy Link
- Control-click on list in sidebar → Share → Copy Link

### iOS

- Tap todo/project → toolbar → Share → Copy Link
- Navigate to list → top right → Share → Copy Link

## Error Handling

The server includes comprehensive error handling:

- Invalid parameters are caught by Zod validation
- Things URL failures are reported with clear messages
- Missing authorization tokens are detected
- Network and system errors are handled gracefully

## Examples

### Basic Todo Creation

```javascript
// Creates a simple todo
{
  "title": "Buy milk",
  "when": "today",
  "tags": ["groceries"]
}
```

### Complex Project Creation

```javascript
// Creates a project with multiple todos and organization
{
  "title": "Plan Birthday Party",
  "area": "Personal",
  "when": "next week",
  "to-dos": [
    "Send invitations",
    "Order cake",
    "Buy decorations",
    "Plan menu"
  ],
  "tags": ["family", "celebration"],
  "reveal": true
}
```

### JSON Batch Operation

```javascript
// Complex structure with headings and nested todos
{
  "data": JSON.stringify([
    {
      "type": "project",
      "attributes": {
        "title": "Website Redesign",
        "area": "Work",
        "items": [
          {
            "type": "heading",
            "attributes": { "title": "Design Phase" }
          },
          {
            "type": "to-do",
            "attributes": {
              "title": "Create wireframes",
              "when": "today"
            }
          }
        ]
      }
    }
  ])
}
```

## Troubleshooting

### Things Not Opening

- Ensure Things 3 is installed and updated
- Check that Things URLs are enabled in settings
- Verify the MCP server is running correctly

### Authorization Errors

- Get your auth token from Things settings
- Include auth-token parameter for update operations
- Ensure token is copied correctly without extra spaces

### Connection Issues

- Restart Claude Desktop or your MCP client
- Check the configuration file syntax
- Look for errors in client logs

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Related

- [Things URL Scheme Documentation](https://culturedcode.com/things/support/articles/2803573/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)

## Support

- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Open an issue with enhancement label
- 📚 **Documentation**: Check the Things URL scheme docs
- 💬 **Questions**: Open a discussion on GitHub
