import Base from './base';

// Paste style.
export default class extends Base {
	apply() {
		const { args } = this;

		if ( ! args.element && ! args.elements ) {
			throw Error( 'element or elements are required.' );
		}

		if ( args.element && args.elements ) {
			throw Error( 'element and elements cannot go together please select one of them.' );
		}

		if ( args.element ) {
			args.elements = [ args.element ];
		}

		const historyId = $e.run( 'document/history/startLog', {
				elements: args.elements,
				type: 'paste_style',
				returnValue: true,
			} ),
			transferData = elementorCommon.storage.get( 'transfer' ),
			sourceElement = transferData.elements[ 0 ],
			sourceSettings = sourceElement.settings;

		args.elements.forEach( ( element ) => {
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

			elementor.channels.data.trigger( 'element:before:paste:style', targetEditModel );

			targetEditModel.setSetting( diffSettings );

			elementor.channels.data.trigger( 'element:after:paste:style', targetEditModel );

			element.allowRender = true;

			element.renderOnChange();
		} );

		$e.run( 'document/history/endLog', { id: historyId } );
	}
}
