import LocalValues from 'elementor/modules/default-values/assets/js/editor/handlers/local-values';

describe( 'Default Values - Handlers - LocalValues', () => {
	const container = {
		view: {
			isStyleTransferControl( control ) {
				return control.isStyle;
			},
		},
		settings: {
			controls: {
				color: { isStyle: true },
				alignment: { isStyle: true },
				title: { isStyle: false },
				text_shadow_text_shadow_type: { isStyle: true },
				text_shadow_text_shadow: { isStyle: true },
			},
			toJSON() {
				return {
					__globals__: {},
					color: '#aaa',
					alignment: 'right',
					text_shadow_text_shadow_type: 'yes',
					text_shadow_text_shadow: {
						blur: 45,
						color: 'red',
					},
					title: 'some text',
					not_a_real_control: 1,
				};
			},
		},
	};

	test( 'appendSettingsForRecreate', () => {
		// Arrange
		const localValues = new LocalValues();

		const element = {
			prop: 1,
			prop2: 2,
		};

		// Act
		const result = localValues.appendSettingsForRecreate( element );

		// Assert
		expect( result ).toBe( element );
	} );

	test( 'appendSettingsForSave - return only non hardcoded default values and styled controls', () => {
		// Arrange
		const localValues = new LocalValues();

		// Act
		const newSettings = localValues.appendSettingsForSave( {}, container );

		// Assert
		expect( newSettings ).toEqual( {
			color: '#aaa',
			alignment: 'right',
			text_shadow_text_shadow_type: 'yes',
			text_shadow_text_shadow: {
				blur: 45,
				color: 'red',
			},
		} );
	} );
} );
