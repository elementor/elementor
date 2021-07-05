export class Create extends $e.modules.CommandBase {
	validateArgs( args ) {
		this.requireArgument( 'elementId', args );
	}

	async apply( { elementId } ) {
		const container = elementor.getContainer( elementId );
		const { elType, widgetType } = container.settings.attributes;

		// Get all the "styled" settings that differently from the hardcoded defaults.
		const settings = this.getSettingsForSave( container );

		const type = widgetType || elType;

		// Save those settings into preset
		const { data } = await $e.data.create( 'default-values/index', { settings }, { type } );

		this.replaceAllRelatedElements( type, data );
	}

	/**
	 * Get all the settings that should be save.
	 *
	 * @param container
	 * @returns {{[p: string]: any}}
	 */
	getSettingsForSave( container ) {
		const controls = container.settings.controls;

		const settings = Object.entries( container.settings.toJSON( { remove: [ 'hard-coded-default' ] } ) )
			.filter( ( [ controlName ] ) => {
				// TODO: Make sure to copy globals
				return controls[ controlName ] && container.view.isStyleTransferControl( controls[ controlName ] );
			} );

		return Object.fromEntries( settings );
	}

	replaceAllRelatedElements( type, values ) {
		// const emptyValues = Object.keys( values ).reduce( ( carry, key ) => {
		// 	return {
		// 		...carry,
		// 		// TODO: Make sure that globals included and object controls.
		// 		[ key ]: '',
		// 	};
		// }, {} );
		//
		// elementor.getPreviewContainer().forEachChildrenRecursive( ( element ) => {
		// 	const currentElementType = element.model.attributes.widgetType || element.model.attributes.elType;
		//
		// 	if ( type !== currentElementType ) {
		// 		return;
		// 	}
		//
		// 	console.log( element );
		// 	// element.settings.set();
		// } );
	}

	// clearDefaultElementValues( container, values ) {
	// 	Object.keys( values ).forEach(
	// 		( key ) => container.settings.set( key, undefined )
	// 	);
	// }
}

export default Create;
