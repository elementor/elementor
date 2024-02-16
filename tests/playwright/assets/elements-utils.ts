/**
 * Add element to the page using model and parent container.
 * @param {Object}        props
 * @param {Object}        props.model
 * @param {string | null} props.container
 * @param {boolean}       props.isContainerASection
 * @return {string | undefined}
 */
export const addElement = ( props: { model: unknown, container: string | null, isContainerASection: boolean } ): string | undefined => {
	let parent: unknown;
	let elementor: object;
	let $e: object;

	const getContainer = ( item: string ) => {
		if ( 'object' === typeof elementor && 'getContainer' in elementor && 'function' === typeof elementor.getContainer ) {
			return elementor.getContainer( item );
		}
	};

	if ( props.container ) {
		parent = getContainer( props.container );
	} else {
		// If a `container` isn't supplied - create a new Section.
		if ( 'object' === typeof $e && 'run' in $e && 'function' === typeof $e.run ) {
			parent = $e.run(
				'document/elements/create',
				{
					model: { elType: 'section' },
					columns: 1,
					container: getContainer( 'document' ),
				},
			);
		}

		props.isContainerASection = true;
	}

	if ( props.isContainerASection && 'object' === typeof parent && 'children' in parent ) {
		parent = parent.children[ 0 ];
	}

	let element: object;
	if ( 'object' === typeof $e && 'run' in $e && 'function' === typeof $e.run ) {
		element = $e.run(
			'document/elements/create',
			{
				model: props.model,
				container: parent,
			},
		);
	}

	if ( 'object' === typeof element && 'id' in element && 'string' === typeof element.id ) {
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
	return `[data-id = "${ id }"]`;
};
