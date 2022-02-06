import Element from './element';

export default class Column extends Element {
	/**
	 * Allow only widget, container and inner-section.
	 */
	isValidChild( childModel ) {
		const childElType = childModel.get( 'elType' );

		if ( 'section' === childElType && childModel.get( 'isInner' ) ) {
			return true;
		}

		return [ 'widget', 'container' ].includes( childElType );
	}
}
