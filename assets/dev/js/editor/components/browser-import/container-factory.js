import ElementModel from '../../elements/models/element';

export default class ContainerFactory {
	/**
	 * Create an element container.
	 *
	 * @param element
	 * @returns {Container}
	 */
	static createElementContainer( element ) {
		const widget = elementor.widgetsCache[ element.widgetType ] || {},
			model = new ElementModel( Object.assign( {}, widget, element ) );

		return new elementorModules.editor.Container( {
			id: model.get( 'id' ) || elementorCommon.helpers.getUniqueId().toString(),
			type: model.get( 'elType' ) || 'widget',
			settings: model.get( 'settings' ),
			model,
		} );
	}
}
