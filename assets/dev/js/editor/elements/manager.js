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
	 * Get element type by elType, and widgetType, if exact widgetType is not found
	 * the method will return the element type ( WidgetBase ).
	 *
	 * @param {string} elType
	 * @param {string|false} widgetType
	 */
	getElementType( elType, widgetType = false ) {
		let key = 'element-' + elType,
			result = this.elementTypes[ key ];

		if ( 'widget' === elType ) {
			key = 'widget-' + widgetType;

			if ( this.elementTypes[ key ] ) {
				result = this.elementTypes[ key ];
			}
		}

		return result;
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

		const index = element.getTypeKey();

		if ( this.elementTypes[ index ] ) {
			throw new Error( 'Element type already registered' );
		}

		this.elementTypes[ index ] = element;
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
