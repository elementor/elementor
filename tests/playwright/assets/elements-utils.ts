import { $eType, ElementorType } from '../types/types';
import EditorPage from '../pages/editor-page';

/**
 * Add element to the page using model and parent container.
 * @param {Object}        props
 * @param {Object}        props.model
 * @param {string | null} props.container
 * @param {boolean}       props.isContainerASection
 * @return {string | undefined}
 */

let parent: unknown;
let elementor: ElementorType;
let $e: $eType;
export const addElement = ( props: { model: unknown, container: null | string, isContainerASection: boolean } ): string | undefined => {
	if ( props.container ) {
		parent = elementor.getContainer( props.container );
	} else {
		// If a `container` isn't supplied - create a new Section.
		parent = $e.run(
			'document/elements/create',
			{
				model: { elType: 'section' },
				columns: 1,
				container: elementor.getContainer( 'document' ),
			},
		);

		props.isContainerASection = true;
	}

	if ( props.isContainerASection && 'object' === typeof parent && 'children' in parent ) {
		parent = parent.children[ 0 ];
	}

	const element = $e.run(
		'document/elements/create',
		{
			model: props.model,
			container: parent,
		},
	);

	if ( element !== null && 'object' === typeof element && 'id' in element && 'string' === typeof element.id ) {
		return element.id;
	}
	return undefined;
};

/**
 * Make an Elementor element CSS selector using Container ID.
 *
 * @param {string} id - Container ID.
 *
 * @return {string} css selector
 */
export const getElementSelector = ( id: string ) => {
	return `[data-id="${ id }"]`;
};

/**
 * Capture the ID of the next element created via document/elements/create hook.
 *
 * @param {EditorPage} editor - Editor page instance.
 *
 * @return {Promise<string>} The ID of the created element
 */
export const captureNextElementCreation = async ( editor: EditorPage ): Promise<string> => {
	return editor.page.evaluate( () => {
		return new Promise( ( resolve ) => {
			window.$e.hooks.addAction( 'document/elements/create', ( element: { id: string } ) => {
				resolve( element.id );
			}, { once: true } );
		} );
	} );
};
