import { $eType, ElementorType, WindowType } from '../types/types';
import EditorPage from '../pages/editor-page';

/**
 * Add element to the page using model and parent container.
 * @param {Object}        props
 * @param {Object}        props.model
 * @param {string | null} props.container
 * @param {boolean}       props.isContainerASection
 * @return {string | undefined}
 */

export const addElement = ( props: { model: unknown, container: null | string, isContainerASection: boolean } ): string | undefined => {
	const extendedWindow = window as unknown as Window & { elementor?: ElementorType; $e?: $eType };
	const elementor = extendedWindow.elementor;
	const $e = extendedWindow.$e;

	let parent: unknown;

	if ( props.container ) {
		parent = elementor.getContainer( props.container );
	} else {
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

	if ( props.isContainerASection && 'object' === typeof parent && parent !== null && 'children' in parent ) {
		parent = ( parent as { children: unknown[] } ).children[ 0 ];
	}

	const element = $e.run(
		'document/elements/create',
		{
			model: props.model,
			container: parent,
		},
	);

	if ( element !== null && 'object' === typeof element && 'id' in element && 'string' === typeof ( element as { id: string } ).id ) {
		return ( element as { id: string } ).id;
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
 * Capture the ID of the next element created via document/elements/create command.
 *
 * @param {EditorPage}       editor     - Editor page instance.
 * @param {string|undefined} widgetType - Optional widget type to filter (e.g., 'e-component').
 *
 * @return {Promise<string>} The ID of the created element
 */
export const captureNextElementCreation = async ( editor: EditorPage, widgetType?: string ): Promise<string> => {
	return editor.page.evaluate( ( widgetTypeFilter?: string ) => {
		return new Promise< string >( ( resolve ) => {
			const extendedWindow = window as unknown as WindowType;

			const callback = ( component: unknown, command: string, args: unknown, result: { model?: { get?: ( key: string ) => string }, id: string } ) => {
				if ( 'document/elements/create' === command ) {
					const createdWidgetType = result?.model?.get?.( 'widgetType' );

					if ( ! widgetTypeFilter || createdWidgetType === widgetTypeFilter ) {
						extendedWindow.$e.commands.off( 'run:after', callback );
						resolve( result.id );
					}
				}
			};
			extendedWindow.$e.commands.on( 'run:after', callback );
		} );
	}, widgetType );
};
