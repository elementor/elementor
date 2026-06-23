export const MCP_STYLES_APPLIED_EVENT = 'elementor/mcp/styles-applied';

export type McpStylesAppliedPayload = {
	styleValue: Record< string, unknown >;
};

export function dispatchMcpStylesAppliedEvent( payload: McpStylesAppliedPayload ): void {
	window.dispatchEvent( new CustomEvent( MCP_STYLES_APPLIED_EVENT, { detail: payload } ) );
}
