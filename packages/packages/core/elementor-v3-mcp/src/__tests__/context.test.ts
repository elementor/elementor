/* eslint-disable import/no-relative-packages */
import {
	cleanupElementorMocks,
	type ElementorMockSetup,
	setupElementorMocks,
} from '../../../../libs/elementor-mcp-common/src/__tests__/test-mocks';
/* eslint-enable import/no-relative-packages */
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
		it( 'should return mapped controls schema for a valid widget type', () => {
			const schema = getElementSchema( 'heading' );

			expect( schema ).toEqual( {
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
							type: undefined,
							default: 'Item text',
						},
						item_link: {
							type: undefined,
							default: '',
						},
					},
				},
			} );
		} );

		it( 'should return empty object for non-existent widget type', () => {
			const schema = getElementSchema( 'non-existent' );
			expect( schema ).toEqual( {} );
		} );

		it( 'should filter out section, tab, and tabs control types', () => {
			const mockWidgetsCache = {
				'test-widget': {
					controls: {
						section_start: { type: 'section', default: null },
						tab_start: { type: 'tab', default: null },
						tabs_start: { type: 'tabs', default: null },
						actual_control: { type: 'text', default: 'value' },
					},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'test-widget' );

			expect( schema ).toHaveProperty( 'actual_control' );
			expect( schema ).not.toHaveProperty( 'section_start' );
			expect( schema ).not.toHaveProperty( 'tab_start' );
			expect( schema ).not.toHaveProperty( 'tabs_start' );
		} );

		it( 'should include options array from controls that have options', () => {
			const mockWidgetsCache = {
				'select-widget': {
					controls: {
						dropdown: {
							type: 'select',
							default: 'option1',
							options: {
								option1: 'Option 1',
								option2: 'Option 2',
								option3: 'Option 3',
							},
						},
					},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'select-widget' );

			expect( schema.dropdown ).toEqual( {
				type: 'select',
				default: 'option1',
				options: [ 'option1', 'option2', 'option3' ],
			} );
		} );

		it( 'should recursively map nested fields in repeater controls', () => {
			const mockWidgetsCache = {
				'repeater-widget': {
					controls: {
						items: {
							type: 'repeater',
							default: [],
							fields: {
								title: { type: 'text', default: '' },
								content: { type: 'textarea', default: '' },
							},
						},
					},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'repeater-widget' );

			expect( schema.items ).toEqual( {
				type: 'repeater',
				default: [],
				fields: {
					title: { type: 'text', default: '' },
					content: { type: 'textarea', default: '' },
				},
			} );
		} );

		it( 'should include size_units when present in control config', () => {
			const mockWidgetsCache = {
				'dimension-widget': {
					controls: {
						width: {
							type: 'slider',
							default: { size: 100, unit: 'px' },
							size_units: [ 'px', '%', 'em', 'rem' ],
						},
					},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'dimension-widget' );

			expect( schema.width ).toEqual( {
				type: 'slider',
				default: { size: 100, unit: 'px' },
				size_units: [ 'px', '%', 'em', 'rem' ],
			} );
		} );

		it( 'should include onValue (return_value) when present', () => {
			const mockWidgetsCache = {
				'toggle-widget': {
					controls: {
						show_title: {
							type: 'switcher',
							default: '',
							return_value: 'yes',
						},
					},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'toggle-widget' );

			expect( schema.show_title ).toEqual( {
				type: 'switcher',
				default: '',
				onValue: 'yes',
			} );
		} );

		it( 'should merge control config with global control type config', () => {
			const mockWidgetsCache = {
				'merge-widget': {
					controls: {
						custom_text: {
							type: 'text',
							default: 'local default',
						},
					},
				},
			};

			const mockGlobalConfig = {
				controls: {
					text: {
						type: 'text',
						default: 'global default',
						return_value: 'global_return',
					},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: mockGlobalConfig,
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'merge-widget' );

			expect( schema.custom_text ).toEqual( {
				type: 'text',
				default: 'local default',
				onValue: 'global_return',
			} );
		} );

		it( 'should handle undefined widgetsCache gracefully', () => {
			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: undefined,
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'any-widget' );
			expect( schema ).toEqual( {} );
		} );

		it( 'should handle widget with no controls', () => {
			const mockWidgetsCache = {
				'empty-widget': {
					controls: {},
				},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'empty-widget' );
			expect( schema ).toEqual( {} );
		} );

		it( 'should handle widget with undefined controls', () => {
			const mockWidgetsCache = {
				'no-controls-widget': {},
			};

			Object.defineProperty( window, 'elementor', {
				value: {
					...elementorMocks.mockElementor,
					widgetsCache: mockWidgetsCache,
					config: { controls: {} },
				},
				writable: true,
				configurable: true,
			} );

			const schema = getElementSchema( 'no-controls-widget' );
			expect( schema ).toEqual( {} );
		} );
	} );
} );
