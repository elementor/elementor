import Base from '../../commands/base';

// PasteStyle.
export default class extends Base {
	validateArgs( args ) {
		this.requireContainer( args );
	}

	getHistory( args ) {
		const { containers = [ args.container ] } = args;

		return {
			containers,
			type: 'paste_style',
		};
	}

	apply( args ) {
		// TODO: rewrite ( warning: too many function exits ).
		// Moved from Old mechanism.
		const { containers = [ args.container ] } = args;

		const transferData = elementorCommon.storage.get( 'transfer' ), // TODO: storage should be args.storageKey
			sourceContainer = transferData.containers[ 0 ],
			sourceSettings = sourceContainer.settings;

		containers.forEach( ( container ) => {
			const targetSettings = container.settings,
				targetSettingsAttributes = targetSettings.attributes,
				targetControls = targetSettings.controls,
				diffSettings = {};

			jQuery.each( targetControls, ( controlName, control ) => {
				if ( ! container.view.isStyleTransferControl( control ) ) {
					return;
				}

				const controlSourceValue = sourceSettings[ controlName ],
					controlTargetValue = targetSettingsAttributes[ controlName ];

				if ( undefined === controlSourceValue || undefined === controlTargetValue ) {
					return;
				}

				if ( 'object' === typeof controlSourceValue ^ 'object' === typeof controlTargetValue ) {
					return;
				}

				if ( 'object' === typeof controlSourceValue ) {
					let isEqual = true;

					jQuery.each( controlSourceValue, function( propertyKey ) {
						if ( controlSourceValue[ propertyKey ] !== controlTargetValue[ propertyKey ] ) {
							return isEqual = false;
						}
					} );

					if ( isEqual ) {
						return;
					}
				}
				if ( controlSourceValue === controlTargetValue ) {
					return;
				}

				const ControlView = elementor.getControlView( control.type );

				if ( ! ControlView.onPasteStyle( control, controlSourceValue ) ) {
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

			container.view.renderOnChange();
		} );
	}
}
