import PanelElementsElementModel from '../../regions/panel/pages/elements/models/element';
import Preview from 'elementor-views/preview';

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

	createWidget( widgetType, options = {} ) {
		const model = this.constructor.getWidgetModel( widgetType ),
			historyId = $e.internal( 'document/history/start-log', {
				type: 'add',
				title: elementor.helpers.getModelLabel( model ),
			} );
		let container = this.getContainer();

		if ( container.view instanceof Preview ) {
			container = $e.run( 'document/elements/create', {
				model: {
					elType: 'section',
				},
				container: elementor.getPreviewContainer(),
				columns: 1,
				options: {
					at: this.options.at,
					// BC: Deprecated since 2.8.0 - use `$e.hooks`.
					trigger: {
						beforeAdd: 'section:before:drop',
						afterAdd: 'section:after:drop',
					},
				},
			} ).view.children.findByIndex( 0 ).getContainer();
		}

		const widget = $e.run( 'document/elements/create', {
			container,
			model,
			options: Object.assign( {}, this.options, options ),
		} );

		$e.internal( 'document/history/end-log', { id: historyId } );

		return widget;
	}

	static getWidgetModel( widgetType ) {
		const model = new PanelElementsElementModel(
			elementor.widgetsCache[ widgetType ]
		);

		model.set( 'widgetType', model.get( 'widget_type' ) );

		return model.attributes;
	}

	getOptions() {
		return this.options;
	}
}
