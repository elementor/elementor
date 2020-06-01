import CommandBase from 'elementor-api/modules/command-base';

export class Create extends CommandBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'title', 'string', args );
	}

	apply( args = {} ) {
		const { container, setting, title } = args,
			controls = container.controls;

		let	result = false;

		if ( ! controls[ setting ] ) {
			throw new Error( `Invalid setting: control '${ setting }', not found.` );
		}

		const id = elementor.helpers.getUniqueID();

		// Currently does not effect cache.
		result = $e.data.create( `globals/colors?id=${ id }`, {
			title,
			color: container.settings.get( setting ),
		} );

		return result;
	}
}
