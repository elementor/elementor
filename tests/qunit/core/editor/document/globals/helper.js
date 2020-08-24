// TODO: Merge with dynamic/helper.

export default class GlobalsHelper {
	static enable( eContainer, settings = {} ) {
		return $e.run( 'document/globals/enable', {
			container: eContainer,
			settings,
		} );
	}

	static disable( eContainer, settings ) {
		return $e.run( 'document/globals/disable', {
			container: eContainer,
			settings,
		} );
	}

	static multiEnable( eContainers, settings = {} ) {
		return $e.run( 'document/globals/enable', {
			containers: eContainers,
			settings,
		} );
	}

	static multiDisable( eContainers, settings ) {
		return $e.run( 'document/globals/disable', {
			containers: eContainers,
			settings,
		} );
	}

	static settings( eContainer, settings ) {
		return $e.run( 'document/globals/settings', {
			container: eContainer,
			settings,
		} );
	}

	static multiSettings( eContainers, settings ) {
		return $e.run( 'document/globals/settings', {
			containers: eContainers,
			settings,
		} );
	}
}
