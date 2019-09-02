import Base from './base';

// PasteStyle.
export default class extends Base {
	validateArgs( args ) {
		this.requireElements( args );
	}

	getHistory( args ) {
		const { elements = [ args.element ] } = args;

		return {
			elements,
			type: 'paste_style',
		};
	}

	apply( args ) {
		// TODO: rewrite ( warning: too many function exits ).
		// Moved from Old mechanism.
		const { elements = [ args.element ] } = args;

		const transferData = elementorCommon.storage.get( 'transfer' ), // TODO: storage should be args.storageKey
			sourceElement = transferData.elements[ 0 ],
			sourceSettings = sourceElement.settings;

		elements.forEach( ( element ) => {
			const targetEditModel = element.getEditModel(),
				targetSettings = targetEditModel.get( 'settings' ),
				targetSettingsAttributes = targetSettings.attributes,
				targetControls = targetSettings.controls,
				diffSettings = {};

			jQuery.each( targetControls, ( controlName, control ) => {
				if ( ! element.isStyleTransferControl( control ) ) {
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

			element.allowRender = false;

			$e.run( 'document/elements/settings', {
				element,
				settings: diffSettings,
			} );

			element.allowRender = true;

			element.renderOnChange();
		} );
	}
}
