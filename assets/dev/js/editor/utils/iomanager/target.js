import PanelElementsElementModel from '../../regions/panel/pages/elements/models/element';

export default class Target {
	/**
	 * Target constructor.
	 */
	constructor( container ) {
		this.container = container;
	}

	/**
	 * Get the target container.
	 */
	getContainer() {
		return this.container;
	}

	createWidget( widgetType, options = {} ) {
		return $e.run( 'document/elements/create', {
			container: this.getContainer(),
			model: this.constructor.getWidgetModel( widgetType ),
			options,
		} );
	}

	static getWidgetModel( widgetType ) {
		return new PanelElementsElementModel(
			elementor.widgetsCache[ widgetType ]
		);
	}
}
