import BaseElementModel from './base-element-model';
import { getAllElementTypes } from 'elementor-editor/utils/element-types';

export default class Document extends BaseElementModel {
	isValidChild( childModel ) {
		const childElType = childModel.get( 'elType' );

		// Valid children.
		return getAllElementTypes().includes( childElType );
	}
}
