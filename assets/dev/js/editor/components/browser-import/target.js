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

	createElement( type, settings = {} ) {
		const model = this.constructor.getElementModel( type, settings ),
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
			options: this.options,
		} );

		$e.internal( 'document/history/end-log', { id: historyId } );

		return widget;
	}

	static getElementModel( type, settings = {} ) {
		const widget = Object.assign(
			elementor.widgetsCache[ type ],
			{
				widgetType: type,
				settings,
			}
		);

		return new PanelElementsElementModel( widget )
			.attributes;
	}

	getOptions() {
		return this.options;
	}
}
