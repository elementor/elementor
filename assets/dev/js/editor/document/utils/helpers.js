export default class Helpers {
	static findViewRecursive( parent, key, value, multiple = true ) {
		let found = [];
		for ( const x in parent._views ) {
			const view = parent._views[ x ];

			if ( value === view.model.get( key ) ) {
				found.push( view );
				if ( ! multiple ) {
					return found;
				}
			}

			if ( view.children ) {
				const views = Helpers.findViewRecursive( view.children, key, value, multiple );
				if ( views.length ) {
					found = found.concat( views );
					if ( ! multiple ) {
						return found;
					}
				}
			}
		}

		return found;
	}

	static findViewById( id ) {
		const elements = Helpers.findViewRecursive(
			elementor.getPreviewView().children,
			'id',
			id,
			false
		);

		return elements ? elements[ 0 ] : false;
	}

	static isValidChild( childModel, parentModel ) {
		const childTypes = elementor.helpers.getElementChildType( parentModel.get( 'elType' ) ),
			draggedElType = childModel.get( 'elType' );

		if ( 'section' === draggedElType && ! childModel.get( 'isInner' ) && 'column' === parentModel.get( 'elType' ) ) {
			return false;
		}

		return childTypes && -1 !== childTypes.indexOf( childModel.get( 'elType' ) );
	}
}
