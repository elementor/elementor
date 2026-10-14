import { type ElementID } from '../types';
import { getContainer } from './get-container';
import { type ElementSnippetReference } from './types';

const SNIPPETS_KEY = 'snippets';

export function getElementSnippetReferences( elementId: ElementID ): ElementSnippetReference[] {
	return getContainer( elementId )?.model?.get( SNIPPETS_KEY ) ?? [];
}
