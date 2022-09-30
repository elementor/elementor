// TODO: Merge with globals/helper.

export default class DynamicHelper {
	static enable( eContainer, settings = {} ) {
		return $e.run( 'document/dynamic/enable', {
			container: eContainer,
			settings,
		} );
	}

	static disable( eContainer, settings ) {
		return $e.run( 'document/dynamic/disable', {
			container: eContainer,
			settings,
		} );
	}

	static multiEnable( eContainers, settings = {} ) {
		return $e.run( 'document/dynamic/enable', {
			containers: eContainers,
			settings,
		} );
	}

	static multiDisable( eContainers, settings ) {
		return $e.run( 'document/dynamic/disable', {
			containers: eContainers,
			settings,
		} );
	}

	static settings( eContainer, settings ) {
		return $e.run( 'document/dynamic/settings', {
			container: eContainer,
			settings,
		} );
	}

	static multiSettings( eContainers, settings ) {
		return $e.run( 'document/dynamic/settings', {
			containers: eContainers,
			settings,
		} );
	}
}
