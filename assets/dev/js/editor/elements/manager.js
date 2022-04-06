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
	 * Function getElementType().
	 *
	 * Get element type by key.
	 *
	 * @param {string} key
	 *
	 * @returns {ElementBase}
	 */
	getElementType( key ) {
		const type = this.elementTypes[ key ];

		// When exact widget is not registered, return widget base instead.
		if ( ! type && elementor.widgetsCache[ key ] ) {
			return this.elementTypes.widget;
		}

		return type;
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

		const key = element.getType();

		if ( this.elementTypes[ key ] ) {
			throw new Error( 'Element type already registered' );
		}

		this.elementTypes[ key ] = element;
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
