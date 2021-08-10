import PanelElementsElementModel from '../../regions/panel/pages/elements/models/element';

export default class Target {
	/**
	 * Target constructor.
	 */
	constructor( container, options = {} ) {
		this.container = container;
		this.options = options;
	}

	/**
	 * Get the target container.
	 */
	getContainer() {
		return this.container;
	}

	/**
	 * Create element of the specified type into the target container.
	 *
	 * @param type
	 * @param options
	 * @returns {}
	 */
	createElement( type, options = {} ) {
		return this.getContainer().view
			.onCreateElement(
				this.constructor.getElementModel( type, options ),
				Object.assign( this.getOptions(), options )
			);
	}

	/**
	 * Create a model for the specified type, with the provided settings.
	 *
	 * @param type
	 * @param options
	 * @returns {*}
	 */
	static getElementModel( type, options = {} ) {
		const widget = Object.assign(
			elementor.widgetsCache[ type ],
			{
				widgetType: type,
			},
			options,
		);

		return new PanelElementsElementModel( widget )
			.attributes;
	}

	/**
	 * Get the Target options.
	 *
	 * @returns {{}}
	 */
	getOptions() {
		return this.options;
	}
}
