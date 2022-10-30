export class CreateFromPreset extends $e.modules.editor.document.CommandHistoryBase {
	static restore( historyItem, isRedo ) {

	}

	validateArgs( args ) {
		this.requireContainer( args );

		// Avoid Backbone model & etc.
		this.requireArgumentConstructor( 'preset', String, args );
	}

	getHistory( args ) {
		// Const { model, containers = [ args.container ] } = args;
		//
		// return {
		// 	containers,
		// 	model,
		// 	type: 'add',
		// 	title: elementor.helpers.getModelLabel( model ),
		// };
	}

	apply( args ) {
		const { preset, container } = args;

		const presetsConfig = this.getPresetsConfig(),
			presetConfigCreator = presetsConfig[ args.preset ] || presetsConfig.default,
			config = presetConfigCreator( preset );

		this.createElements( config, container );

		return {};
	}

	createElements( config, container ) {
		const {
			elements = [],
			elType = 'container',
			settings = {},
		} = config;

		const parent = $e.run( 'document/elements/create', {
			container,
			model: { elType, settings },
			options: { edit: false },
		} );

		elements.forEach( ( element ) => {
			this.createElements( element, parent );
		} );
	}

	getPresetsConfig() {
		return {
			c100: () => ( {
				settings: {
					flex_direction: 'column',
				},
			} ),
			r100: () => ( {
				settings: {
					flex_direction: 'row',
				},
			} ),
			'c100-c50-50': () => {
				const baseChildSettings = {
					content_width: 'full-width',
					width: {
						unit: '%',
						size: '50',
					},
				};

				return {
					elType: 'container',
					settings: {
						flex_direction: 'row',
						flex_wrap: 'wrap',
						flex_gap: {
							unit: 'px',
							size: 0, // Set the gap to 0 to override the default inherited from `Site Settings`.
						},
					},
					elements: [
						{
							elType: 'container',
							settings: { ...baseChildSettings },
						},
						{
							elType: 'container',
							settings: {
								...baseChildSettings,
								padding: { size: '' }, // Create the right Container with 0 padding (default is 10px) to fix UI (ED-4900).
								flex_gap: {
									unit: 'px',
									size: 0, // Set the gap to 0 to override the default inherited from `Site Settings`.
								},
							},
							elements: [
								{ elType: 'container' },
								{ elType: 'container' },
							],
						},
					],
				};
			},
			default: ( preset ) => {
				const sizes = preset.split( '-' );

				// Map rounded, user-readable sizes to actual percentages.
				const sizesMap = {
					33: '33.3333',
					66: '66.6666',
				};

				const sizesSum = sizes.reduce( ( sum, size ) => sum + parseInt( size ), 0 );

				return {
					elType: 'container',
					settings: {
						...( sizesSum > 100 ? { flex_wrap: 'wrap' } : {} ),
						flex_direction: 'row',
						flex_gap: {
							unit: 'px',
							size: 0, // Set the gap to 0 to override the default inherited from `Site Settings`.
						},
					},
					elements: sizes.map( ( size ) => {
						size = sizesMap[ size ] || size;

						return {
							elType: 'container',
							settings: {
								flex_direction: 'column',
								content_width: 'full-width',
								width: {
									unit: '%',
									size,
								},
							},
						};
					} ),
				};
			},
		};
	}
}

export default CreateFromPreset;
