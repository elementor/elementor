/**
 * Add element to the page using model and parent container.
 *
 * @param {Object}      model           - Model definition.
 * @param {*}           model.model
 *
 * @param {string|null} model.container - Parent container ID. Optional.
 * @return {Promise<*>} element id
 */
 const addElement = async ( { model, container = null } ) => {
	let parent;

	if ( container ) {
		parent = elementor.getContainer( container );
	} else {
		// If a `container` isn't supplied - create a new Section.
		const section = $e.run(
			'document/elements/create',
			{
				model: { elType: 'section' },
				columns: 1,
				container: elementor.getContainer( 'document' ),
			},
		);

		parent = section.children[ 0 ];
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

module.exports = {
	addElement,
	getElementSelector,
};
