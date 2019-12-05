import History from '../../commands/base/history';

export class PasteStyle extends History {
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
			storageData = elementorCommon.storage.get( storageKey );

		containers.forEach( ( targetContainer ) => {
			const targetSettings = targetContainer.settings,
				targetSettingsAttributes = targetSettings.attributes,
				targetControls = targetSettings.controls,
				diffSettings = {};

			storageData.forEach( ( sourceModel ) => {
				const sourceSettings = sourceModel.settings;

				Object.entries( targetControls ).forEach( ( [ controlName, control ] ) => {
					if ( ! targetContainer.view.isStyleTransferControl( control ) ) {
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

				// Moved from `editor/elements/views/base.js` `pasteStyle` function.
				targetContainer.view.allowRender = false;

				// BC: Deprecated since 2.8.0 - use `$e.events`.
				elementor.channels.data.trigger( 'element:before:paste:style', targetContainer.model );

				$e.run( 'document/elements/settings', {
					container: targetContainer,
					settings: diffSettings,
				} );

				// BC: Deprecated since 2.8.0 - use `$e.events`.
				elementor.channels.data.trigger( 'element:after:paste:style', targetContainer.model );

				targetContainer.view.allowRender = true;

				targetContainer.render();
			} );
		} );
	}
}

export default PasteStyle;
