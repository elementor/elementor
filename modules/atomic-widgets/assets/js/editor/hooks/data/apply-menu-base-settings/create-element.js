const MENU_ELEMENT_TYPE = 'e-menu';

const findMenus = ( container ) => {
	const menus = 'e-menu' === container?.model?.get( 'elType' ) ? [ container ] : [];

	return ( container?.children ?? [] ).reduce(
		( found, child ) => [ ...found, ...findMenus( child ) ],
		menus,
	);
};

const applyBaseSettings = ( menu ) => {
	const baseSettings = elementor.config.elements[ MENU_ELEMENT_TYPE ]?.base_settings ?? {};
	const missing = Object.fromEntries(
		Object.entries( baseSettings ).filter( ( [ key ] ) => undefined === menu.settings.get( key ) ),
	);

	if ( 0 === Object.keys( missing ).length ) {
		return;
	}

	$e.internal( 'document/elements/set-settings', {
		container: menu,
		settings: missing,
		options: { render: false },
	} );
};

export class CreateElement extends $e.modules.hookData.After {
	getCommand() {
		return 'document/elements/create';
	}

	getId() {
		return 'apply-menu-base-settings--document/elements/create';
	}

	apply( args, result ) {
		const containers = Array.isArray( result ) ? result : [ result ];

		containers.filter( Boolean ).flatMap( findMenus ).forEach( applyBaseSettings );
	}
}
