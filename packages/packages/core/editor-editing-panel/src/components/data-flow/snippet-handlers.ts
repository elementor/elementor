import { type ElementSnippetReference } from '@elementor/editor-elements';

export type SnippetHandlerRow = {
	snippet: string;
	event: string;
	description: string;
	code?: string;
};

type SnippetHandlerConfig = {
	event: string;
	description: string;
	code?: string;
};

const getSnippetsConfig = (): Record< string, SnippetHandlerConfig[] > =>
	window.elementor?.config?.dataFlow?.snippets ?? {};

export const resolveSnippetHandlerRows = ( references: ElementSnippetReference[] ): SnippetHandlerRow[] => {
	const snippets = getSnippetsConfig();

	return references.flatMap( ( { snippet, event } ) => {
		const handler = snippets[ snippet ]?.find( ( candidate ) => candidate.event === event );

		return handler ? [ { snippet, event, description: handler.description, code: handler.code } ] : [];
	} );
};
