export default class BackwardsCompatibility {
	static findViewRecursive( parent, key, value, multiple = true ) {
		elementorDevTools.deprecation.deprecated( 'findViewRecursive', '2.9.0', "$e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple )" );

		return $e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple );
	}

	static findViewById( id ) {
		elementorDevTools.deprecation.deprecated( 'findViewById', '2.9.0', "$e.components.get( 'document' ).utils.findViewById( id )" );

		return $e.components.get( 'document' ).utils.findViewById( id );
	}

	static findContainerById( id ) {
		elementorDevTools.deprecation.deprecated( 'findContainerById', '2.9.0', "$e.components.get( 'document' ).utils.findContainerById( id )" );

		return $e.components.get( 'document' ).utils.findContainerById( id );
	}

	static isValidChild( childModel, parentModel ) {
		elementorDevTools.deprecation.deprecated( 'isValidChild', '3.4.0', 'parentModel.isValidChild( childModel )' );

		return parentModel.isValidChild( childModel );
	}

	static isValidGrandChild( childModel, targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'isValidGrandChild', '3.4.0', "$e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer );
	}

	static isSameElement( sourceModel, targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'isSameElement', '3.4.0', "$e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer );
	}

	static getPasteOptions( sourceModel, targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'getPasteOptions', '3.4.0', "$e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer );
	}

	static isPasteEnabled( targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'isPasteEnabled', '3.4.0', "$e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer );
	}
}
