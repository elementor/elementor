import { default as Element } from './element';

/**
 * @typedef {import('../../../editor/elements/models/base-element-model')} BaseModel
 */

export default class Column extends Element {
	/**
	 * Allow only widget, container and inner-section.
	 *
	 * @param {BaseModel} childModel
	 */
	isValidChild( childModel ) {
		const childElType = childModel.get( 'elType' );

		if ( 'section' === childElType && childModel.get( 'isInner' ) ) {
			return true;
		}

		return [ 'widget', 'container' ].includes( childElType );
	}
}
