import { useEffect } from 'react';
import { MCP_STYLES_APPLIED_EVENT, type McpStylesAppliedPayload } from '@elementor/editor-mcp';

import { extractVariablesFromStyleValue } from '../utils/extract-variables-from-style-value';
import { trackVariableEvent } from '../utils/tracking';

export function McpVariableConnectListener() {
	useEffect( () => {
		const handleMcpStylesApplied = ( event: CustomEvent< McpStylesAppliedPayload > ) => {
			const { styleValue, appliedClass } = event.detail;
			const variables = extractVariablesFromStyleValue( styleValue );

			variables.forEach( ( { type, controlPath } ) => {
				trackVariableEvent( {
					varType: type,
					controlPath,
					action: 'connect',
					executedBy: 'mcp_tool',
					appliedClass,
				} );
			} );
		};

		window.addEventListener( MCP_STYLES_APPLIED_EVENT, handleMcpStylesApplied as EventListener );

		return () => {
			window.removeEventListener( MCP_STYLES_APPLIED_EVENT, handleMcpStylesApplied as EventListener );
		};
	}, [] );

	return null;
}
