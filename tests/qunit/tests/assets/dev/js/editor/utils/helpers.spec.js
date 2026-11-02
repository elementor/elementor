QUnit.module( 'File: assets/dev/js/editor/utils/helpers.js', () => {
	QUnit.module( 'isActiveControl(): Check conversion from \'condition\' to \'conditions\' format', () => {
		QUnit.test( 'When the condition term value is an array and control supposed to be invisible', ( assert ) => {
			const model = {
				condition: {
					'control_name[sub_key]': [ 'test_value1', 'test_value2' ],
				},
			};
			const values = {
				control_name: {
					sub_key: 'test_value3',
				},
			};

			// Act.
			const actual = elementor.helpers.isActiveControl( model, values );

			// Assert.
			assert.false( actual );
		} );

		QUnit.test( 'When the condition term value is an array, negative operator is used and control supposed to be visible', ( assert ) => {
			const model = {
				condition: {
					'control_name[sub_key]!': [ 'test_value1', 'test_value2' ],
				},
			};
			const values = {
				control_name: {
					sub_key: 'test_value3',
				},
			};

			// Act.
			const actual = elementor.helpers.isActiveControl( model, values );

			// Assert.
			assert.true( actual );
		} );

		QUnit.test( 'When the condition term value is a string and control supposed to be invisible', ( assert ) => {
			const model = {
				condition: {
					'control_name[sub_key]': 'test_value1',
				},
			};
			const values = {
				control_name: {
					sub_key: 'test_value3',
				},
			};

			// Act.
			const actual = elementor.helpers.isActiveControl( model, values );

			// Assert.
			assert.false( actual );
		} );

		QUnit.test( 'When the condition term value is a string, negative operator is used and control supposed to be visible', ( assert ) => {
			const model = {
				condition: {
					'control_name[sub_key]!': 'test_value1',
				},
			};
			const values = {
				control_name: {
					sub_key: 'test_value3',
				},
			};

			// Act.
			const actual = elementor.helpers.isActiveControl( model, values );

			// Assert.
			assert.true( actual );
		} );
	} );

	QUnit.module( 'renderIcon()', () => {
		QUnit.test( 'panel svg escapes a url so it cannot break out of the image attribute', ( assert ) => {
			// Arrange
			const icon = {
				library: 'svg',
				value: {
					url: 'https://example.com/icon.svg" onerror="alert(1)',
				},
			};

			// Act
			const html = elementor.helpers.renderIcon( null, icon, {}, 'i', 'panel' );

		// Assert
		assert.strictEqual(
			html,
			'<img src="https://example.com/icon.svg&quot; onerror=&quot;alert(1)">',
		);
	} );

		QUnit.test( 'panel font icon escapes the class attribute', ( assert ) => {
			// Arrange
			const icon = {
				library: 'fa-solid',
				value: 'fas fa-star" onmouseover="alert(1)',
			};
			const originalGetIconLibrarySettings = elementor.helpers.getIconLibrarySettings;
			const originalEnqueueIconFonts = elementor.helpers.enqueueIconFonts;
			elementor.helpers.getIconLibrarySettings = () => ( { name: 'fa-solid' } );
			elementor.helpers.enqueueIconFonts = () => {};

			// Act
			const html = elementor.helpers.renderIcon( null, icon, {}, 'i', 'panel' );

		// Assert
		elementor.helpers.getIconLibrarySettings = originalGetIconLibrarySettings;
		elementor.helpers.enqueueIconFonts = originalEnqueueIconFonts;
		assert.strictEqual(
			html,
			'<i class="fas fa-star&quot; onmouseover=&quot;alert(1)"></i>',
		);
	} );
	} );
} );
