import Base from '../../commands/base';

// PasteStyle.
export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	validateControls( source, target ) {
		let result = true;

		if (
			undefined === source ||
			undefined === target ||
			( 'object' === typeof source ^ 'object' === typeof target )
		) {
			result = false;
		}

		return result;
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'paste_style',
		};
	}

	apply( args ) {
		const { containers = [ args.container ], storageKey = 'clipboard' } = args,
			transferData = elementorCommon.storage.get( storageKey ),
			sourceContainer = transferData.containers[ 0 ],
			sourceSettings = sourceContainer.settings;

		containers.forEach( ( container ) => {
			const targetSettings = container.settings,
				targetSettingsAttributes = targetSettings.attributes,
				targetControls = targetSettings.controls,
				diffSettings = {};

			Object.entries( targetControls ).forEach( ( [ controlName, control ] ) => {
				if ( ! container.view.isStyleTransferControl( control ) ) {
					return;
				}

				const controlSourceValue = sourceSettings[ controlName ],
					controlTargetValue = targetSettingsAttributes[ controlName ];

				if ( ! this.validateControls( controlSourceValue, controlTargetValue ) ) {
					return;
				}

				if ( 'object' === typeof controlSourceValue ) {
					const isEqual = Object.keys( controlSourceValue ).some( ( propertyKey ) => {
						if ( controlSourceValue[ propertyKey ] !== controlTargetValue[ propertyKey ] ) {
							return false;
						}
					} );

					if ( isEqual ) {
						return;
					}
				}

				if ( controlSourceValue === controlTargetValue ||
					! elementor.getControlView( control.type ).onPasteStyle( control, controlSourceValue ) ) {
					return;
				}

				diffSettings[ controlName ] = controlSourceValue;
			} );

			container.view.allowRender = false;

			$e.run( 'document/elements/settings', {
				container,
				settings: diffSettings,
			} );

			container.view.allowRender = true;

			container.render();
		} );
	}
}
