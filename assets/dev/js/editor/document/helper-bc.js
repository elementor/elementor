export default class BackwardsCompatibility {
	static findViewRecursive( parent, key, value, multiple = true ) {
		elementorCommon.helpers.softDeprecated( 'findViewRecursive', '2.9.0', "$e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple )" );

		return $e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple );
	}

	static findViewById( id ) {
		elementorCommon.helpers.softDeprecated( 'findViewById', '2.9.0', "$e.components.get( 'document' ).utils.findViewById( id )" );

		return $e.components.get( 'document' ).utils.findViewById( id );
	}

	static findContainerById( id ) {
		elementorCommon.helpers.softDeprecated( 'findContainerById', '2.9.0', "$e.components.get( 'document' ).utils.findContainerById( id )" );

		return $e.components.get( 'document' ).utils.findContainerById( id );
	}

	static isValidChild( childModel, parentModel ) {
		elementorCommon.helpers.softDeprecated( 'isValidChild', '3.4.0', "$e.components.get( 'document/elements' ).utils.isValidChild( childModel, parentModel )" );

		return $e.components.get( 'document/elements' ).utils.isValidChild( childModel, parentModel );
	}

	static isValidGrandChild( childModel, targetContainer ) {
		elementorCommon.helpers.softDeprecated( 'isValidGrandChild', '3.4.0', "$e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer );
	}

	static isSameElement( sourceModel, targetContainer ) {
		elementorCommon.helpers.softDeprecated( 'isSameElement', '3.4.0', "$e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer );
	}

	static getPasteOptions( sourceModel, targetContainer ) {
		elementorCommon.helpers.softDeprecated( 'getPasteOptions', '3.4.0', "$e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer );
	}

	static isPasteEnabled( targetContainer ) {
		elementorCommon.helpers.softDeprecated( 'isPasteEnabled', '3.4.0', "$e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer );
	}
}
