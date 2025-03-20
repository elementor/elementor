import BaseElementModel from './base-element-model';

export default class Document extends BaseElementModel {
	isValidChild( childModel ) {
		const childElType = childModel.get( 'elType' );

		// Valid children.
		return [ 'section', 'container', 'div-block' ].includes( childElType );
	}
}
