import { type ModelContext } from '../adapters/web-mcp-adapter';

type ModelContextHost = {
	modelContext?: ModelContext;
};

function bindModelContextMethods( host: ModelContext ): ModelContext {
	return {
		registerTool: host.registerTool.bind( host ),
		unregisterTool: host.unregisterTool ? host.unregisterTool.bind( host ) : undefined,
	};
}

export function getModelContext(): ModelContext | undefined {
	const documentModelContext =
		typeof document !== 'undefined' ? ( document as unknown as ModelContextHost ).modelContext : undefined;
	if ( documentModelContext?.registerTool ) {
		return bindModelContextMethods( documentModelContext );
	}
	const navigatorModelContext =
		typeof navigator !== 'undefined' ? ( navigator as unknown as ModelContextHost ).modelContext : undefined;
	if ( navigatorModelContext?.registerTool ) {
		return bindModelContextMethods( navigatorModelContext );
	}

	return undefined;
}
