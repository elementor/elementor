// Duck-typed UriTemplate — matches the shape exposed by ResourceTemplate.uriTemplate
export type UriTemplate = {
	toString: () => string;
	match: ( uri: string ) => Record< string, string | string[] > | null;
};

export type McpToolDescriptor = {
	name: string;
	description: string;
	inputSchema: object;
	execute: ( params: Record< string, unknown > ) => Promise< unknown >;
};

export type McpResourceUriOrTemplate = string | { uriTemplate: UriTemplate };

export type McpResourceHandler = (
	uri: URL,
	variables: Record< string, string | string[] >
) => Promise< { contents: Array< { text?: string } > } >;

export interface IMcpRegistrationAdapter {
	/**
	 * Called once at startup to activate the adapter's server registrations.
	 */
	activate: () => void | Promise< void >;

	/**
	 * Called once per tool when addTool() is invoked.
	 */
	onToolRegistered: (
		tool: McpToolDescriptor,
		extraData?: { resources: string[]; requiredResources: string[] }
	) => void;

	/**
	 * Called once per resource when resource() is invoked.
	 */
	onResourceRegistered: (
		name: string,
		uriOrTemplate: McpResourceUriOrTemplate,
		handler: McpResourceHandler
	) => void;

	/**
	 * Called when a resource update notification should be sent.
	 */
	sendResourceUpdated: ( params: { uri: string } ) => void | Promise< void >;
}
