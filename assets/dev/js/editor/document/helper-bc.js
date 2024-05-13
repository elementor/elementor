export default class BackwardsCompatibility {
	/**
	 * @param {*}        parent
	 * @param {string}   key
	 * @param {string}   value
	 * @param {boolean=} multiple
	 * @deprecated since 2.9.0, use `$e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple )` instead.
	 */
	static findViewRecursive( parent, key, value, multiple = true ) {
		elementorDevTools.deprecation.deprecated( 'findViewRecursive()', '2.9.0', "$e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple )" );

		return $e.components.get( 'document' ).utils.findViewRecursive( parent, key, value, multiple );
	}

	/**
	 * @param {string} id - View ID.
	 * @deprecated since 2.9.0, use `$e.components.get( 'document' ).utils.findViewById( id )` instead.
	 */
	static findViewById( id ) {
		elementorDevTools.deprecation.deprecated( 'findViewById( id )', '2.9.0', "$e.components.get( 'document' ).utils.findViewById( id )" );

		return $e.components.get( 'document' ).utils.findViewById( id );
	}

	/**
	 * @param {string} id - Container ID.
	 * @deprecated since 2.9.0, use `$e.components.get( 'document' ).utils.findContainerById( id )` instead.
	 */
	static findContainerById( id ) {
		elementorDevTools.deprecation.deprecated( 'findContainerById( id )', '2.9.0', "$e.components.get( 'document' ).utils.findContainerById( id )" );

		return $e.components.get( 'document' ).utils.findContainerById( id );
	}

	/**
	 * @param {*} childModel
	 * @param {*} parentModel
	 * @deprecated since 3.4.0, use `parentModel.isValidChild( childModel )` instead.
	 */
	static isValidChild( childModel, parentModel ) {
		elementorDevTools.deprecation.deprecated( 'isValidChild( childModel, parentModel )', '3.4.0', 'parentModel.isValidChild( childModel )' );

		return parentModel.isValidChild( childModel );
	}

	/**
	 * @param {*} childModel
	 * @param {*} targetContainer
	 * @deprecated since 3.4.0, use `$e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer )` instead.
	 */
	static isValidGrandChild( childModel, targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'isValidGrandChild( childModel, targetContainer )', '3.4.0', "$e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isValidGrandChild( childModel, targetContainer );
	}

	/**
	 * @param {*} sourceModel
	 * @param {*} targetContainer
	 * @deprecated since 3.4.0, use `$e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer )` instead.
	 */
	static isSameElement( sourceModel, targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'isSameElement( sourceModel, targetContainer )', '3.4.0', "$e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isSameElement( sourceModel, targetContainer );
	}

	/**
	 * @param {*} sourceModel
	 * @param {*} targetContainer
	 * @deprecated since 3.4.0, use `$e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer )` instead.
	 */
	static getPasteOptions( sourceModel, targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'getPasteOptions( sourceModel, targetContainer )', '3.4.0', "$e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.getPasteOptions( sourceModel, targetContainer );
	}

	/**
	 * @param {*} targetContainer
	 * @deprecated since 3.4.0, use `$e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer )` instead.
	 */
	static isPasteEnabled( targetContainer ) {
		elementorDevTools.deprecation.deprecated( 'isPasteEnabled( targetContainer )', '3.4.0', "$e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer )" );

		return $e.components.get( 'document/elements' ).utils.isPasteEnabled( targetContainer );
	}
}
