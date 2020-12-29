export default class RepeaterHelper {
	static insert( eContainer, name, item ) {
		return $e.run( 'document/repeater/insert', {
			container: eContainer,
			name,
			model: item,
		} );
	}

	static multiInsert( eContainers, name, item ) {
		return $e.run( 'document/repeater/insert', {
			containers: eContainers,
			name,
			model: item,
		} );
	}

	static remove( eContainer, name, index ) {
		return $e.run( 'document/repeater/remove', {
			container: eContainer,
			name,
			index,
		} );
	}

	static multiRemove( eContainers, name, index ) {
		return $e.run( 'document/repeater/remove', {
			containers: eContainers,
			name,
			index,
		} );
	}

	static settings( eContainer, name, index, settings, options ) {
		const container = eContainer.repeaters[ name ].children[ index ];

		$e.run( 'document/elements/settings', {
			container,
			settings,
			options,
		} );
	}

	static multiSettings( eContainers, name, index, settings, options ) {
		eContainers = eContainers.map( ( eContainer ) => {
			return eContainer.repeaters[ name ].children[ index ];
		} );

		$e.run( 'document/elements/settings', {
			containers: eContainers,
			settings,
			options,
		} );
	}

	static duplicate( eContainer, name, index ) {
		return $e.run( 'document/repeater/duplicate', {
			container: eContainer,
			name,
			index,
		} );
	}

	static multiDuplicate( eContainers, name, index ) {
		return $e.run( 'document/repeater/duplicate', {
			containers: eContainers,
			name,
			index,
		} );
	}

	static move( eContainer, name, sourceIndex, targetIndex ) {
		$e.run( 'document/repeater/move', {
			container: eContainer,
			name,
			sourceIndex,
			targetIndex,
		} );
	}

	static multiMove( eContainers, name, sourceIndex, targetIndex ) {
		$e.run( 'document/repeater/move', {
			containers: eContainers,
			name,
			sourceIndex,
			targetIndex,
		} );
	}
}
