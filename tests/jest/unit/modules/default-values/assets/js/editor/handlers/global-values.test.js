import GlobalValues from 'elementor/modules/default-values/assets/js/editor/handlers/global-values';

describe( 'Default Values - Handlers - Global Values', () => {
	test( 'appendSettingsForSave', () => {
		// Arrange
		const globalValues = new GlobalValues( {
			test_widget: {
				controls: {
					control_default_color: {
						global: {
							default: 'globals/colors?id=sec',
						},
					},
					control_default_typography: {
						global: {
							default: 'globals/typography?id=sec',
						},
					},
				},
			},
		} );

		const container = {
			model: {
				attributes: {
					widgetType: 'test_widget',
				},
			},
			settings: {
				attributes: {
					__globals__: {
						title_color: 'globals/colors?id=secondary',
						typography_typography: 'globals/typography?id=primary',
						control_default_color: 'globals/colors?id=primary',
						local_setting: 'global index',
						empty_global: '',
					},
				},
			},
		};

		// Act
		const result = globalValues.appendSettingsForSave( {
			local_setting: 'red',
			another_local_setting: 'blue',
		}, container );

		// Assert
		expect( result ).toEqual( {
			another_local_setting: 'blue',
			__globals__: {
				title_color: 'globals/colors?id=secondary',
				typography_typography: 'globals/typography?id=primary',
				control_default_color: 'globals/colors?id=primary',
				control_default_typography: 'globals/typography?id=sec',
				local_setting: 'global index',
			},
		} );
	} );

	test( 'appendSettingsForRecreate - return the non default globals of the element', () => {
		// Arrange
		const globalValues = new GlobalValues( {} );

		const firstElement = {
			settings: {
				__globals__: {
					title_color: 'globals/colors?id=secondary',
					typography_typography: 'globals/typography?id=primary',
				},
			},
		};

		const secondElement = {
			settings: {
				__globals__: {
					title_color: 'globals/colors?id=primary',
					typography_typography: 'globals/typography?id=primary',
				},
			},
		};

		const newDefaultSettings = {
			__globals__: {
				title_color: 'globals/colors?id=secondary',
			},
		};

		// Act
		const result = globalValues.appendSettingsForRecreate( firstElement, newDefaultSettings );
		const result2 = globalValues.appendSettingsForRecreate( secondElement, newDefaultSettings );

		// Assert
		expect( result.settings.__globals__ ).toEqual( {
			typography_typography: 'globals/typography?id=primary',
		} );

		expect( result2.settings.__globals__ ).toEqual( {
			title_color: 'globals/colors?id=primary',
			typography_typography: 'globals/typography?id=primary',
		} );
	} );
} );
