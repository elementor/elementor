import ElementModel from '../../elements/models/element';

export default class ContainerFactory {
	/**
	 * Create an element container.
	 *
	 * @param element
	 * @returns {Container}
	 */
	static createElementContainer( element ) {
		const model = new ElementModel( Object.assign( {
			id: elementorCommon.helpers.getUniqueId().toString(),
			elType: element?.elType || 'widget',
		}, element ) );

		return new elementorModules.editor.Container( {
			id: model.get( 'id' ),
			type: model.get( 'elType' ),
			settings: model.get( 'settings' ),
			model,
		} );
	}
}
