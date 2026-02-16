import { type StyleDefinition } from '@elementor/editor-styles';
import { createStylesProvider } from '@elementor/editor-styles-repository';

let styles: StyleDefinition[] = [];
const listeners = new Set< () => void >();

export function addTemplateStyles( newStyles: StyleDefinition[] ) {
	styles = [ ...styles, ...newStyles ];
	listeners.forEach( ( cb ) => cb() );
}

export function clearTemplatesStyles() {
	styles = [];
	listeners.forEach( ( cb ) => cb() );
}

export const templatesStylesProvider = createStylesProvider( {
	key: 'templates-styles',
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
