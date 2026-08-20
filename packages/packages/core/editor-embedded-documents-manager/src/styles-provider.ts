import { type Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';

let styles: StyleDefinition[] = [];
let documentStyles = new Map< number, StyleDefinition[] >();
const styleListeners = new Set< () => void >();

export const embeddedDocumentsStylesProvider = createStylesProvider( {
	key: 'embedded-documents-styles',
	priority: 75,
	subscribe: ( cb ) => {
		styleListeners.add( cb );

		return () => {
			styleListeners.delete( cb );
		};
	},
	actions: {
		all: () => styles,
		get: ( id ) => styles.find( ( style ) => style.id === id ) ?? null,
	},
} );

function notifyStyleListeners() {
	styleListeners.forEach( ( cb ) => cb() );
}

export function addEmbeddedDocumentStyles( documentId: number, document: Document ) {
	const extracted = extractStylesFromDocument( document );

	if ( ! extracted.length ) {
		if ( ! documentStyles.has( documentId ) ) {
			return;
		}
		documentStyles.delete( documentId );
	} else {
		documentStyles.set( documentId, extracted );
	}

	styles = [ ...documentStyles.values() ].flat();
	notifyStyleListeners();
}

export function clearEmbeddedDocumentsStyles() {
	documentStyles = new Map();
	styles = [];
	notifyStyleListeners();
}

function extractStylesFromDocument( document: Document ): StyleDefinition[] {
	if ( ! document.elements?.length ) {
		return [];
	}

	return document.elements.flatMap( extractStylesFromElement );
}

function extractStylesFromElement( element: V1ElementData ): StyleDefinition[] {
	return [
		...Object.values( element.styles ?? {} ),
		...( element.elements ?? [] ).flatMap( extractStylesFromElement ),
	];
}
