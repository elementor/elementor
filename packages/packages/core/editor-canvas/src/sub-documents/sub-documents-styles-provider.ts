import { type StyleDefinition } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';

let styles: StyleDefinition[] = [];
const listeners = new Set< () => void >();

export function setSubDocumentStyles( newStyles: StyleDefinition[] ) {
	styles = newStyles;
	listeners.forEach( ( cb ) => cb() );
}

export function clearSubDocumentStyles() {
	styles = [];
	listeners.forEach( ( cb ) => cb() );
}

export const subDocumentsStylesProvider = createStylesProvider( {
	key: 'sub-documents-styles',
	priority: 100,
	subscribe: ( cb ) => {
		listeners.add( cb );

		return () => {
			listeners.delete( cb );
		};
	},
	actions: {
		all: () => styles,
		get: ( id ) => styles.find( ( style ) => style.id === id ) ?? null,
	},
} );
