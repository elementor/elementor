import DocumentHelpers from 'elementor-document/helpers';

export default class Helper {
	static toggleVisibilityClass( elementId ) {
		const view = DocumentHelpers.findViewById( elementId );

		if ( view ) {
			view.toggleVisibilityClass();
		}
	}
}
