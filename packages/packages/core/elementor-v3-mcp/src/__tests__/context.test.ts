import { cleanupElementorMocks, type ElementorMockSetup, setupElementorMocks } from '@elementor/elementor-mcp-common';

import { getElementSchema } from '../context';

describe( 'context.ts', () => {
	let elementorMocks: ElementorMockSetup;

	beforeEach( () => {
		elementorMocks = setupElementorMocks();
	} );

	afterEach( () => {
		cleanupElementorMocks();
	} );

	describe( 'getElementSchema', () => {
		it( 'should return element schema for valid widget type', () => {
			const result = getElementSchema( 'heading' );

			expect( result ).toEqual( {
				text: {
					type: 'text',
					default: 'Default heading',
				},
				size: {
					type: 'select',
					default: 'medium',
					options: [ 'small', 'medium', 'large' ],
				},
				color: {
					type: 'color',
					default: '#000000',
					onValue: 'yes',
				},
				repeater_field: {
					type: 'repeater',
					default: [],
					fields: {
						item_text: {
							default: 'Item text',
						},
						item_link: {
							default: '',
						},
					},
				},
			} );
		} );

		it( 'should filter out undefined values from control schema', () => {
			( elementorMocks.mockElementor as unknown as { widgetsCache: Record< string, unknown > } ).widgetsCache = {
				minimal: {
					controls: {
						basic_control: {
							type: 'text',
							default: 'test',
							options: undefined,
							return_value: undefined,
							fields: undefined,
							size_units: undefined,
							range: undefined,
						},
					},
				},
			};

			const result = getElementSchema( 'minimal' );

			expect( result ).toEqual( {
				basic_control: {
					type: 'text',
					default: 'test',
				},
			} );
		} );

		describe( 'deepmerge behavior', () => {
			it( 'should merge global config controls with widget-specific controls', () => {
				( elementorMocks.mockElementor as unknown as { config: Record< string, unknown > } ).config = {
					controls: {
						size: {
							default: 10,
							size_units: [ 'px' ],
						},
					},
				};

				(
					elementorMocks.mockElementor as unknown as { widgetsCache: Record< string, unknown > }
				 ).widgetsCache = {
					custom_widget: {
						controls: {
							number: {
								type: 'size',
								default: 50,
							},
						},
					},
				};

				const result = getElementSchema( 'custom_widget' );

				expect( result ).toEqual( {
					number: {
						type: 'size',
						default: 50,
						size_units: [ 'px' ],
					},
				} );
			} );

			it( 'should allow widget-specific controls to override global config properties', () => {
				( elementorMocks.mockElementor as unknown as { config: Record< string, unknown > } ).config = {
					controls: {
						text: {
							type: 'text',
							default: 'Global default',
							size_units: [ 'px' ],
						},
					},
				};

				(
					elementorMocks.mockElementor as unknown as { widgetsCache: Record< string, unknown > }
				 ).widgetsCache = {
					custom_widget: {
						controls: {
							title: {
								type: 'text',
								default: 'Widget override',
								size_units: [ 'px', 'em', 'rem' ],
							},
						},
					},
				};

				const result = getElementSchema( 'custom_widget' );

				expect( result ).toEqual( {
					title: {
						type: 'text',
						default: 'Widget override',
						size_units: [ 'px', 'em', 'rem' ],
					},
				} );
			} );

			it( 'should merge nested object properties from global config', () => {
				( elementorMocks.mockElementor as unknown as { config: Record< string, unknown > } ).config = {
					controls: {
						slider: {
							type: 'slider',
							default: 50,
							range: {
								min: 0,
								max: 100,
								step: 1,
							},
						},
					},
				};

				(
					elementorMocks.mockElementor as unknown as { widgetsCache: Record< string, unknown > }
				 ).widgetsCache = {
					custom_widget: {
						controls: {
							my_slider: {
								type: 'slider',
								default: 75,
								range: {
									max: 200,
								},
							},
						},
					},
				};

				const result = getElementSchema( 'custom_widget' );

				expect( result ).toEqual( {
					my_slider: {
						type: 'slider',
						default: 75,
					},
				} );
			} );

			it( 'should merge options from global config with widget options', () => {
				( elementorMocks.mockElementor as unknown as { config: Record< string, unknown > } ).config = {
					controls: {
						select: {
							type: 'select',
							options: {
								option1: 'Option 1',
								option2: 'Option 2',
							},
						},
					},
				};

				(
					elementorMocks.mockElementor as unknown as { widgetsCache: Record< string, unknown > }
				 ).widgetsCache = {
					custom_widget: {
						controls: {
							my_select: {
								type: 'select',
								default: 'option3',
								options: {
									option3: 'Option 3',
									option4: 'Option 4',
								},
							},
						},
					},
				};

				const result = getElementSchema( 'custom_widget' );

				expect( result ).toEqual( {
					my_select: {
						type: 'select',
						default: 'option3',
						options: [ 'option1', 'option2', 'option3', 'option4' ],
					},
				} );
			} );

			it( 'should deeply merge repeater fields with global config', () => {
				( elementorMocks.mockElementor as unknown as { config: Record< string, unknown > } ).config = {
					controls: {
						repeater: {
							type: 'repeater',
							default: [],
						},
					},
				};

				(
					elementorMocks.mockElementor as unknown as { widgetsCache: Record< string, unknown > }
				 ).widgetsCache = {
					custom_widget: {
						controls: {
							items: {
								type: 'repeater',
								fields: {
									title: {
										type: 'text',
										default: 'Item title',
									},
									link: {
										type: 'url',
										default: '',
									},
								},
							},
						},
					},
				};

				const result = getElementSchema( 'custom_widget' );

				expect( result ).toEqual( {
					items: {
						type: 'repeater',
						default: [],
						fields: {
							title: {
								type: 'text',
								default: 'Item title',
							},
							link: {
								type: 'url',
								default: '',
							},
						},
					},
				} );
			} );
		} );
	} );
} );
