import CommandBase from 'elementor-api/modules/command-base';

export class Create extends CommandBase {
	validateArgs( args = {} ) {
		this.requireContainer( args );
		this.requireArgumentType( 'setting', 'string', args );
		this.requireArgumentType( 'name', 'string', args );
	}

	apply( args = {} ) {
		const { container, setting, name } = args,
			controls = container.controls,
			availableControls = {};

		let	result = false,
			groupPrefix = '';

		if ( controls[ setting ] && controls[ setting ].groupPrefix ) {
			groupPrefix = controls[ setting ].groupPrefix;
		} else {
			throw new Error( `Invalid setting: control '${ setting }', not found.` );
		}

		if ( groupPrefix ) {
			Object.entries( controls ).forEach( ( [ key, control ] ) => {
				if ( key.includes( groupPrefix ) ) {
					availableControls[ key.replace( groupPrefix, '' ) ] = container.settings.get( key );
				}
			} );
		}

		if ( Object.values( availableControls ).length ) {
			result = $e.data.create( 'globals/typography', {}, {}, {
				name,
				controls: availableControls,
			} );
		}

		return result;
	}
}
