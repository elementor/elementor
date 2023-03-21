/**
 * Add element to the page using model and parent container.
 *
 * @param {Object}      options                     - Model definition.
 * @param {*}           options.model
 * @param {string|null} options.container           - Parent container ID. Optional.
 * @param {boolean}     options.isContainerASection - If `container` is a section. Optional.
 * @return {Promise<*>} element id
 */
 const addElement = async ( { model, container = null, isContainerASection = false } ) => {
	let parent;

	if ( container ) {
		parent = elementor.getContainer( container );
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

		isContainerASection = true;
	}

	if ( isContainerASection ) {
		parent = parent.children[ 0 ];
	}

	const element = $e.run(
		'document/elements/create',
		{
			model,
			container: parent,
		},
	);

	return element.id;
};

/**
 * Make an Elementor element CSS selector using Container ID.
 *
 * @param {string} id - Container ID.
 *
 * @return {string} css selector
 */
 const getElementSelector = ( id ) => {
	return `[data-id = "${ id }"]`;
};

const viewportSize = {
	desktop: { width: 1920, height: 1080 },
	tablet_extra_next: { width: 1201, height: 960 },
	tablet_extra: { width: 1200, height: 960 },
	tablet_next: { width: 1025, height: 960 },
	tablet: { width: 1024, height: 960 },
	mobile: { width: 400, height: 480 },
};

module.exports = {
	addElement,
	getElementSelector,
	viewportSize,
};
