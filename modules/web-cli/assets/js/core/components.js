import Module from 'elementor-assets-js/modules/imports/module.js';

/**
 * @typedef {{}} Component
 */

export default class extends Module {
	constructor( ...args ) {
		super( ...args );

		this.components = {};
		this.activeComponents = {};
	}

	getAll() {
		return Object.keys( this.components ).sort();
	}

	register( component ) {
		if ( this.components[ component.getNamespace() ] ) {
			return;
		}

		component.registerAPI();

		this.components[ component.getNamespace() ] = component;

		return component;
	}

	/**
	 * @param {string} id
	 * @return {Component} component
	 */
	get( id ) {
		return this.components[ id ];
	}

	getActive() {
		return this.activeComponents;
	}

	activate( namespace ) {
		// Add as last.
		this.inactivate( namespace );
		this.activeComponents[ namespace ] = true;
	}

	inactivate( namespace ) {
		delete this.activeComponents[ namespace ];
	}

	isActive( namespace ) {
		return !! this.activeComponents[ namespace ];
	}
}
