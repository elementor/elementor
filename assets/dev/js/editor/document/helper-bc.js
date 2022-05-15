export default class BackwardsCompatibility {
	static findViewRecursive( parent, key, value, multiple = true ) {
		elementor.devTools.deprecation.deprecated( 'findViewRecursive', '2.9.0', "$e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple )" );

		return $e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple );
	}

	static findViewById( id ) {
		elementor.devTools.deprecation.deprecated( 'findViewById', '2.9.0', "$e.components.get( 'document' ).utils.findViewById( id )" );

		return $e.components.get( 'document' ).utils.findViewById( id );
	}

	static findContainerById( id ) {
		elementor.devTools.deprecation.deprecated( 'findContainerById', '2.9.0', "$e.components.get( 'document' ).utils.findContainerById( id )" );

		return $e.components.get( 'document' ).utils.findContainerById( id );
	}

	static isValidChild( childModel, parentModel ) {
		elementor.devTools.deprecation.deprecated( 'isValidChild', '3.4.0', 'parentModel.isValidChild( childModel )' );

		return parentModel.isValidChild( childModel );
	}

	static isValidGrandChild( childModel, targetContainer ) {
		elementor.devTools.deprecation.deprecated( 'isValidGrandChild', '3.4.0', "$e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer );
	}

	static isSameElement( sourceModel, targetContainer ) {
		elementor.devTools.deprecation.deprecated( 'isSameElement', '3.4.0', "$e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer );
	}

	static getPasteOptions( sourceModel, targetContainer ) {
		elementor.devTools.deprecation.deprecated( 'getPasteOptions', '3.4.0', "$e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer );
	}

	static isPasteEnabled( targetContainer ) {
		elementor.devTools.deprecation.deprecated( 'isPasteEnabled', '3.4.0', "$e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer );
	}
}
