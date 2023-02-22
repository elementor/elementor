describe( `$e.run( 'container-converter/convert' )`, () => {
	let Convert;

	beforeAll( async () => {
		global.$e = {
			modules: {
				document: {
					CommandHistory: class {},
				},
			},
		};

		// Need to import dynamically since the command extends a global variable which isn't available in regular import.
		Convert = await import(
			'elementor/modules/container-converter/assets/js/editor/commands'
		).then( ( { Convert: convert } ) => convert );
	} );

	beforeEach( () => {
		const eCreate = ( args ) => {
			const newContainer = createContainer( {
				type: args.model.elType,
				...args.model,
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
				createContainer( { type: 'widget', widgetType: 'button' } ),
				createContainer( { type: 'widget', widgetType: 'image' } ),
			],
		} );

		const column2 = createContainer( {
			type: 'column',
			children: [
				createContainer( { type: 'widget', widgetType: 'heading' } ),
				createContainer( { type: 'widget', widgetType: 'text' } ),
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
			section: document.children[ 1 ],
			column1: document.children[ 1 ].children[ 0 ],
			widget1_1: document.children[ 1 ].children[ 0 ].children[ 0 ],
			widget1_2: document.children[ 1 ].children[ 0 ].children[ 1 ],
			column2: document.children[ 1 ].children[ 1 ],
			widget2_1: document.children[ 1 ].children[ 1 ].children[ 0 ],
			widget2_2: document.children[ 1 ].children[ 1 ].children[ 1 ],
		};

		// Make sure the original section is the same.
		expect( document.children[ 0 ] ).toBe( section );

		// Verify the migrated elements.
		expect( migrated.section.type ).toBe( 'container' );

		expect( migrated.column1.type ).toBe( 'container' );
		expect( migrated.widget1_1.type ).toBe( 'widget' );
		expect( migrated.widget1_1.model.get( 'widgetType' ) ).toBe( 'button' );
		expect( migrated.widget1_2.type ).toBe( 'widget' );
		expect( migrated.widget1_2.model.get( 'widgetType' ) ).toBe( 'image' );

		expect( migrated.column2.type ).toBe( 'container' );
		expect( migrated.widget2_1.type ).toBe( 'widget' );
		expect( migrated.widget2_1.model.get( 'widgetType' ) ).toBe( 'heading' );
		expect( migrated.widget2_2.type ).toBe( 'widget' );
		expect( migrated.widget2_2.model.get( 'widgetType' ) ).toBe( 'text' );
	} );

	const sectionDefaultSettings = {
		flex_gap: {
			size: 10,
			unit: 'px',
		},
		flex_align_items: 'stretch',
		flex_direction: 'row',
	};

	it( 'Should migrate section settings', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {
				setting_that_should_stay: 123,
				layout: 'boxed',
				height: 'min-height',
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
			...sectionDefaultSettings,
			setting_that_should_stay: 123,
			content_width: 'boxed',
			boxed_width: {
				size: 100,
				unit: '%',
			},
			boxed_width_tablet: {
				size: 1,
				unit: 'vw',
			},
			boxed_width_mobile: {
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
		};

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
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
			...sectionDefaultSettings,
			min_height: {
				size: 100,
				unit: 'vh',
			},
		};

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
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
			...sectionDefaultSettings,
			min_height: {
				size: 400,
				unit: 'px',
			},
		};

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
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
			...sectionDefaultSettings,
			min_height: {
				size: 100,
				unit: 'px',
			},
		};

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
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
			...sectionDefaultSettings,
			flex_gap: {
				size: 10,
				unit: '%',
			},
		};

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate section settings -- Defaults', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			settings: {},
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
		const expected = { ...sectionDefaultSettings };

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate inner section settings', () => {
		// Arrange.
		const section = createContainer( {
			type: 'section',
			isInner: true,
			settings: {
				layout: 'boxed',
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
			...sectionDefaultSettings,
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
			content_width: 'full',
		};

		expect( document.children[ 1 ].settings.toJSON() ).toStrictEqual( expected );
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
			content_width: 'full', // Default setting.
		};

		expect( document.children[ 1 ].children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );

	it( 'Should migrate widget settings', () => {
		// Arrange.
		const button = createContainer( {
			type: 'widget',
			widgetType: 'button',
			settings: {
				some_settings_that_should_stay: 123,
			},
		} );

		const column = createContainer( {
			type: 'column',
			children: [
				button,
			],
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
			some_settings_that_should_stay: 123,
		};

		expect( document.children[ 1 ].children[ 0 ].children[ 0 ].settings.toJSON() ).toStrictEqual( expected );
	} );
} );

/**
 * Create a mock Container object.
 *
 * @param {Object}   root0
 * @param {string}   root0.type
 * @param {string}   root0.widgetType
 * @param {string}   root0.id
 * @param {Object}   root0.settings
 * @param {Object[]} root0.children
 * @param {number}   root0.index
 * @param {boolean}  root0.isInner
 * @param {Object}   root0.args
 * @return {Object} container
 */
function createContainer( { type, widgetType, id, settings = {}, children = [], index = 0, isInner = false, ...args } ) {
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
		model: {
			get: ( key ) => {
				const map = {
					elType: type,
					widgetType,
				};

				return map[ key ];
			},
			toJSON: () => ( {
				elType: type,
				isInner,
				settings,
			} ),
		},
		...args,
	};

	// Attach the current Container as a parent of its children Containers.
	children.forEach( ( child, i ) => {
		child.parent = container;
		child.view._index = i;
	} );

	return container;
}
