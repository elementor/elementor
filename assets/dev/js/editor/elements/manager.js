import ElementBase from './types/base/element-base';

import * as elementsTypes from './types/';

export default class ElementsManager {
	/**
	 * Registered elements types.
	 *
	 * @type {Object.<ElementBase>}
	 */
	elementTypes = {};

	constructor() {
		this.registerElements();
	}

	/**
	 * Function getElementTypeClass().
	 *
	 * @param {string} type
	 *
	 * @return {ElementBase} Element type class.
	 */
	getElementTypeClass( type ) {
		let typeClass = this.elementTypes[ type ];

		// When exact widget is not registered, return widget base instead.
		if ( ! typeClass && elementor.widgetsCache[ type ] ) {
			typeClass = this.elementTypes.widget;
		}

		return typeClass;
	}

	/**
	 * Function registerElementType().
	 *
	 * @param {ElementBase} element
	 */
	registerElementType( element ) {
		// Validate instanceOf `element`.
		if ( ! ( element instanceof ElementBase ) ) {
			throw new TypeError( 'The element argument must be an instance of ElementBase.' );
		}

		const type = element.getType();

		if ( this.elementTypes[ type ] ) {
			throw new Error( 'Element type already registered' );
		}

		this.elementTypes[ type ] = element;
	}

	/**
	 * Function registerElements().
	 *
	 * Register all base elements types.
	 */
	registerElements() {
		Object.values( elementsTypes ).forEach( ( ElementClass ) => {
			const element = new ElementClass();

			this.registerElementType( element );
		} );

		// TODO: Find better place, since container is not module.
		if ( elementorCommon.config.experimentalFeatures.container ) {
			const ContainerClass = require( './types/container' ).default;

			this.registerElementType( new ContainerClass() );
		}
	}
}
