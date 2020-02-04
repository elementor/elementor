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
}
