const MENU_ELEMENT_TYPE = 'e-menu';

const findMenuModels = ( model ) => {
	const menus = MENU_ELEMENT_TYPE === model?.get( 'elType' ) ? [ model ] : [];

	return ( model?.get( 'elements' )?.models ?? [] ).reduce(
		( found, child ) => [ ...found, ...findMenuModels( child ) ],
		menus,
	);
};

const applyBaseSettings = ( menuModel ) => {
	const baseSettings = elementor.config.elements[ MENU_ELEMENT_TYPE ]?.base_settings ?? {};
	const settings = menuModel.get( 'settings' );
	const missing = Object.fromEntries(
		Object.entries( baseSettings ).filter( ( [ key ] ) => undefined === settings.get( key ) ),
	);

	if ( 0 === Object.keys( missing ).length ) {
		return;
	}

	settings.set( missing );
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

		containers
			.filter( Boolean )
			.flatMap( ( container ) => findMenuModels( container.model ) )
			.forEach( applyBaseSettings );
	}
}
