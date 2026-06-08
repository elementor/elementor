import { type Document } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { type StyleDefinition } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';

let styles: StyleDefinition[] = [];
let postStyles = new Map< number, StyleDefinition[] >();
const styleListeners = new Set< () => void >();

export const relatedPostsStylesProvider = createStylesProvider( {
	key: 'related-posts-styles',
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

export function addPostStyles( postId: number, document: Document ) {
	const extracted = extractStylesFromDocument( document );

	if ( ! extracted.length ) {
		return;
	}

	postStyles.set( postId, extracted );
	styles = [ ...postStyles.values() ].flat();
	notifyStyleListeners();
}

export function clearStyles() {
	postStyles = new Map();
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
