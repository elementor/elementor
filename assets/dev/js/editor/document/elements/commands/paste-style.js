/**
 * @typedef {import('../../../container/container')} Container
 */
 export class PasteStyle extends $e.modules.editor.document.CommandHistoryBase {
	validateArgs( args ) {
		this.requireContainer( args );

		// Validate if storage have data.
		const { storageKey = 'clipboard' } = args,
			storageData = elementorCommon.storage.get( storageKey );

		this.requireArgumentType( 'storageData', 'object', { storageData } );
	}

	validateControls( source, target ) {
		let result = true;

		// Cannot use `_.isEmpty()` does not pass paste style test.
		if (
			null === source ||
			null === target ||
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

		if ( ! storageData || ! storageData?.elements?.length || 'elementor' !== storageData?.type ) {
			return false;
		}

		this.applyPasteStyleData( containers, storageData.elements );
	}

	applyPasteStyleData( containers, data ) {
		containers.forEach( ( targetContainer ) => {
			const targetSettings = targetContainer.settings,
				targetSettingsAttributes = targetSettings.attributes,
				targetControls = targetSettings.controls,
				diffSettings = {},
				addExtraControls = ( sourceSettings, extraType ) => {
					if ( sourceSettings[ extraType ] ) {
						Object.entries( sourceSettings[ extraType ] ).forEach( ( [ controlName, value ] ) => {
							const control = targetControls[ controlName ];
							if ( targetContainer.view.isStyleTransferControl( control ) ) {
								diffSettings[ extraType ] = diffSettings[ extraType ] || {};
								diffSettings[ extraType ][ controlName ] = value;
							}
						} );
					}
				};

			data.forEach( ( sourceModel ) => {
				const sourceSettings = sourceModel.settings;

				addExtraControls( sourceSettings, '__globals__' );
				addExtraControls( sourceSettings, '__dynamic__' );

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
						// eslint-disable-next-line array-callback-return
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

				this.pasteStyle( targetContainer, diffSettings );
			} );
		} );
	}

	/**
	 * @param {Container} targetContainer
	 * @param {{}}        settings
	 */
	pasteStyle( targetContainer, settings ) {
		const globals = settings.__globals__;

		if ( globals ) {
			delete settings.__globals__;
		}

		$e.run( 'document/elements/settings', {
			container: targetContainer,
			settings,
			options: {
				external: true,
				render: false,
			},
		} );

		if ( globals ) {
			$e.run( 'document/globals/settings', {
				container: targetContainer,
				settings: globals,
				options: {
					external: true,
					render: false,
				},
			} );

			targetContainer.panel.refresh();
		}

		targetContainer.render();
	}
}

export default PasteStyle;
