export default class EditorHelper {

	/**
	 * get element id
	 * @param container {Container}
	 * @return {string| null}
	 */
	getElementId( container ) {
		return container?.settings?.attributes?._element_id;
	}

	/**
	 * find child (or nested child) in container by id
	 * @param container {Container} - the container to search in
	 * @param id {string} - the id to search for
	 * @return {Container|null}
	 */
	findElementById( container, id ) {
		let elements = [ container ];

		while ( 0 < elements.length ) {
			const current = elements.shift();

			if ( this.getElementId( current ) === id ) {
				return current;
			}

			elements = [ ...elements, ...current.children ];
		}

		return null;
	}

	/**
	 * get element classes
	 * @param container
	 * @return {Array}
	 */
	getElementClasses( container ) {
		const propertyName = this.getClassPropertyName( container );
		const classesString = container.settings?.attributes[ propertyName ];
		if ( ! classesString ) {
			return [];
		}

		return classesString.split( ' ' );
	}

	/**
	 * find children (and nested children) in container by class
	 * @param container
	 * @param className
	 * @return {*[]}
	 */
	findElementsByClass( container, className ) {
		const result = [];
		let elements = [ container ];

		while ( 0 < elements.length ) {
			const current = elements.shift();
			const cssClasses = this.getElementClasses( current );

			if ( cssClasses.includes( className ) ) {
				result.push( current );
			}

			elements = [ ...elements, ...current.children ];
		}

		return result;
	}
	//
	// findElementsByClass( container, className ) {
	// 	const result = [];
	// 	const cssClasses = this.getElementClasses( container );
	// 	if ( cssClasses.includes( className ) ) {
	// 		result.push( container );
	// 	}
	//
	// 	if ( 0 === container.children.length ) {
	// 		return result;
	// 	}
	//
	// 	for ( const child of container.children ) {
	// 		result.push( ...this.findElementsByClass( child, className ) );
	// 	}
	//
	// 	return result;
	// }

	/**
	 * Inject container after another container
	 * @param injectionContainer {Container} - Container to inject after
	 * @param model {Object} - Model to inject
	 * @return {Container}
	 */
	injectAfter( injectionContainer, model ) {
		let index = injectionContainer.view._index;
		const at = index + 1;

		return $e.run( 'document/elements/create', {
			model,
			container: injectionContainer.parent,
			options: {
				at,
				clone: true,
			},
		} );
	}

	/**
	 * Delete elements
	 * @param containers {Container[]}
	 * @return {*}
	 */
	deleteElements( containers ) {
		return $e.run( 'document/elements/delete', {
			containers,
		} );
	}

	/**
	 * Append element inside a container
	 * @param container {Container} - Container to append in
	 * @param model {Object} - Model to append
	 * @return {Container}
	 */
	appendInContainer( container, model ) {
		const at = container.children.length;

		return $e.run( 'document/elements/create', {
			model,
			container,
			options: {
				at,
				clone: true,
			},
		} );
	}

	/**
	 * Set element settings
	 * @param container {Container}
	 * @param settings {Object}
	 * @return {*}
	 */
	setElementSettings( container, settings ) {
		return $e.run( 'document/elements/settings', {
			container,
			options: {},
			settings,
		} );
	}

	/**
	 * Add class to element
	 * @param container {Container} - Container to add class to
	 * @param className {string} - Class to add
	 */
	addClass( container, className ) {
		const newCssClasses = [ this.getElementClasses( container ), className ].join( ' ' );

		const propertyName = this.getClassPropertyName( container );

		this.setElementSettings( container, {
			[ propertyName ]: newCssClasses,
		} );
	}

	/**
	 * Remove class from element
	 * @param container {Container} - Container to remove class from
	 * @param className {string} - Class to remove
	 */
	removeClass( container, className ) {
		const classesArray = this.getElementClasses( container );

		const propertyName = this.getClassPropertyName( container );

		const newCssClasses = classesArray.filter( ( item ) => item !== className ).join( ' ' );

		this.setElementSettings( container, {
			[ propertyName ]: newCssClasses,
		} );
	}

	/**
	 * Get class property name
	 * @param container {Container}
	 * @return {string}
	 */
	getClassPropertyName( container ) {
		return 'widget' === container.type ? '_css_classes' : 'css_classes';
	}

	/**
	 * Clone container without children (Inject after)
	 * @param container {Container}
	 * @return {Container}
	 */
	cloneWithoutChildren( container ) {
		const model = container.model.toJSON( { copyHtmlCache: true } );
		delete model.elements;

		return this.injectAfter( container, model );
	}

	/**
	 * Set global values for container
	 * @param container {Container}
	 * @param settings {Object}
	 * @return {*}
	 */
	setGlobalValues( container, settings ) {
		return $e.run( 'document/globals/settings', {
			container,
			settings,
		} );
	}
}