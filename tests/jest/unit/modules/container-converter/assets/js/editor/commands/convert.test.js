import { Convert } from 'elementor/modules/container-converter/assets/js/editor/commands';

describe( `$e.run( 'container-converter/convert' )`, () => {
	beforeEach( () => {
		let clipboard = null;

		const eCreate = ( args ) => {
			const newContainer = createContainer( {
				type: args.model.elType,
				settings: args.model.settings,
			} );

			const { at = 0 } = args.options;

			args.container.children.splice( at, 0, newContainer );
			newContainer.parent = args.container;

			return newContainer;
		};

		global.$e = {
			run: jest.fn( ( id, args ) => {
				switch ( id ) {
					case 'document/elements/create':
						return eCreate( args );

					case 'document/elements/copy':
						clipboard = {
							elType: args.container.type,
							settings: args.container.settings.toJSON(),
						};
						break;

					case 'document/elements/paste':
						eCreate( {
							container: args.container,
							model: clipboard,
							options: {
								at: args.at,
							},
						} );
						clipboard = null;
						break;

					case 'container-converter/convert':
						Convert.convert( args );
						break;

					default:
						break;
				}
			} ),
		};

		global.elementorFrontend = {
			config: {
				responsive: {
					activeBreakpoints: {
						tablet: {},
						mobile: {},
					},
				},
			},
		};
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'Should create Containers from sections & columns, and copy-paste widgets', () => {
		// Arrange.
		const column1 = createContainer( {
			type: 'column',
			children: [
				createContainer( { type: 'widget' } ),
				createContainer( { type: 'widget' } ),
			],
		} );

		const column2 = createContainer( {
			type: 'column',
			children: [
				createContainer( { type: 'widget' } ),
				createContainer( { type: 'widget' } ),
			],
		} );

		const section = createContainer( {
			type: 'section',
			children: [
				column1,
				column2,
			],
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const migrated = {
			section: document.children[ 0 ],
			column1: document.children[ 0 ].children[ 0 ],
			widget1_1: document.children[ 0 ].children[ 0 ].children[ 0 ],
			widget1_2: document.children[ 0 ].children[ 0 ].children[ 1 ],
			column2: document.children[ 0 ].children[ 1 ],
			widget2_1: document.children[ 0 ].children[ 1 ].children[ 0 ],
			widget2_2: document.children[ 0 ].children[ 1 ].children[ 1 ],
		};

		// Make sure the original section is the same.
		expect( document.children[ 1 ] ).toBe( section );

		// Verify the migrated elements.
		expect( migrated.section.type ).toBe( 'container' );

		expect( migrated.column1.type ).toBe( 'container' );
		expect( migrated.widget1_1.type ).toBe( 'widget' );
		expect( migrated.widget1_2.type ).toBe( 'widget' );

		expect( migrated.column2.type ).toBe( 'container' );
		expect( migrated.widget2_1.type ).toBe( 'widget' );
		expect( migrated.widget2_2.type ).toBe( 'widget' );
	} );

	it( 'Should migrate section settings', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {
				setting_that_should_stay: 123,
				content_width: {
					size: 100,
					unit: '%',
				},
				content_width_tablet: {
					size: 1,
					unit: 'vw',
				},
				content_width_mobile: {
					size: 200,
					unit: 'px',
				},
				custom_height: {
					size: 100,
					unit: '%',
				},
				custom_height_tablet: {
					size: 1,
					unit: 'vh',
				},
				custom_height_mobile: {
					size: 200,
					unit: 'px',
				},
				gap: 'extended',
				column_position: 'top',
			},
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const expected = {
			setting_that_should_stay: 123,
			width: {
				size: 100,
				unit: '%',
			},
			width_tablet: {
				size: 1,
				unit: 'vw',
			},
			width_mobile: {
				size: 200,
				unit: 'px',
			},
			min_height: {
				size: 100,
				unit: '%',
			},
			min_height_tablet: {
				size: 1,
				unit: 'vh',
			},
			min_height_mobile: {
				size: 200,
				unit: 'px',
			},
			flex_gap: {
				size: 15,
				unit: 'px',
			},
			flex_align_items: 'flex-start',
			flex_direction: 'row', // Default value.
		};

		expect( document.children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate section settings -- Height = Full', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {
				height: 'full',
			},
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const expected = {
			min_height: {
				size: 100,
				unit: 'vh',
			},
			flex_align_items: 'center', // Default value.
			flex_direction: 'row', // Default value.
		};

		expect( document.children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate section settings -- Height = Min height -- Uses default', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {
				height: 'min-height',
			},
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const expected = {
			min_height: {
				size: 400,
				unit: 'px',
			},
			flex_align_items: 'center', // Default value.
			flex_direction: 'row', // Default value.
		};

		expect( document.children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate section settings -- Height = Min height -- Uses custom height', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {
				height: 'min-height',
				custom_height: {
					size: 100,
					unit: 'px',
				},
			},
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const expected = {
			min_height: {
				size: 100,
				unit: 'px',
			},
			flex_align_items: 'center', // Default value.
			flex_direction: 'row', // Default value.
		};

		expect( document.children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate section settings -- Gap = Custom', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {
				gap: 'custom',
				gap_columns_custom: {
					size: 10,
					unit: '%',
				},
			},
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const expected = {
			flex_gap: {
				size: 10,
				unit: '%',
			},
			flex_align_items: 'center', // Default value.
			flex_direction: 'row', // Default value.
		};

		expect( document.children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate column settings', () => {
		// Arrange.
		const column = createContainer( {
			type: 'column',
			settings: {
				_inline_size: 10,
				_inline_size_tablet: 20,
				_inline_size_mobile: 30,
				content_position: 'top',
				content_position_tablet: 'center',
				content_position_mobile: 'bottom',
				space_between_widgets: 10,
				space_between_widgets_tablet: 20,
				space_between_widgets_mobile: 30,
			},
		} );

		const section = createContainer( {
			type: 'section',
			children: [
				column,
			],
		} );

		const document = createContainer( {
			type: 'document',
			children: [
				section,
			],
		} );

		// Act.
		$e.run( 'container-converter/convert', { container: section } );

		// Assert.
		const expected = {
			width: {
				size: 10,
				unit: '%',
			},
			width_tablet: {
				size: 20,
				unit: '%',
			},
			width_mobile: {
				size: 30,
				unit: '%',
			},
			flex_justify_content: 'flex-start',
			flex_justify_content_tablet: 'center',
			flex_justify_content_mobile: 'flex-end',
			flex_gap: {
				size: 10,
				unit: 'px',
			},
			flex_gap_tablet: {
				size: 20,
				unit: 'px',
			},
			flex_gap_mobile: {
				size: 30,
				unit: 'px',
			},
		};

		expect( document.children[ 0 ].children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );
} );

function createContainer( { type, id, settings = {}, children = [], index = 0 } ) {
	const container = {
		id,
		type,
		view: { _index: index },
		settings: {
			toJSON: () => ( {
				...settings,
			} ),
		},
		children,
	};

	children.forEach( ( child, i ) => {
		child.parent = container;
		child.view._index = i;
	} );

	return container;
}
