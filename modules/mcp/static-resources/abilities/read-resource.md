Fetches the content of an Elementor MCP resource by URI. Use list-resources first to discover available URIs.

Input:
- uri (required): The resource URI to read, as returned by list-resources.

Returns the resource content along with its MIME type. Text resources (markdown, plain text) return content as a string. JSON resources are serialized to a JSON string.

Common resources:
- elementor://style/best-practices — Design quality guidelines for distinctive aesthetics
- elementor://variables/tools/manage-global-variable-guide — Guide for the manage-global-variable tool
