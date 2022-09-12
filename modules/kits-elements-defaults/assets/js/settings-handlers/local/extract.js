export default function( container ) {
	const controls = container.settings.controls,
		settingsWithoutDefaults = container.settings.toJSON( { remove: [ 'default' ] } );

	const entries = Object.entries( settingsWithoutDefaults )
		.filter( ( [ settingName ] ) => controls[ settingName ] );

	return Object.fromEntries( entries );
}
