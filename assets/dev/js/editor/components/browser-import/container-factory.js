import { default as ElementModel } from 'elementor-elements/models/element';

/**
 * @typedef {import('../../container/container')} Container
 */
export default class ContainerFactory {
	/**
	 * Create an element container.
	 *
	 * @param {*} element
	 * @return {Container} element container
	 */
	static createElementContainer( element ) {
		const model = new ElementModel(
			this.regenerateIds( [ Object.assign( {
				elType: element?.elType || 'widget',
			}, element ) ] )[ 0 ],
		);

		return new elementorModules.editor.Container( {
			id: model.get( 'id' ),
			type: model.get( 'elType' ),
			settings: model.get( 'settings' ),
			model,
			parent: false,
		} );
	}

	static regenerateIds( elements ) {
		for ( const element of elements ) {
			element.id = elementorCommon.helpers.getUniqueId().toString();

			if ( element.elements ) {
				this.regenerateIds( element.elements );
			}
		}

		return elements;
	}
}
