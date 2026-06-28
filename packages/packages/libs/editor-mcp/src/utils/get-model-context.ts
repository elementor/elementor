import { type ModelContext } from '../adapters/web-mcp-adapter';

type ModelContextHost = {
	modelContext?: ModelContext;
};

export function getModelContext(): ModelContext | undefined {
	const documentModelContext =
		typeof document !== 'undefined' ? ( document as unknown as ModelContextHost ).modelContext : undefined;
	const navigatorModelContext =
		typeof navigator !== 'undefined' ? ( navigator as unknown as ModelContextHost ).modelContext : undefined;

	return documentModelContext || navigatorModelContext;
}
