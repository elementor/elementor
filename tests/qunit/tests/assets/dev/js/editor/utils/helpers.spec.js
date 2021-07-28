QUnit.module( 'File: assets/dev/js/editor/utils/helpers.js', () => {
	QUnit.module( 'isActiveControl(): Check conversion from \'condition\' to \'conditions\' format', () => {
		QUnit.only( 'When the condition term value is an array and control supposed to be invisible', ( assert ) => {
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

		QUnit.only( 'When the condition term value is an array, negative operator is used and control supposed to be visible', ( assert ) => {
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

		QUnit.only( 'When the condition term value is a string and control supposed to be invisible', ( assert ) => {
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

		QUnit.only( 'When the condition term value is a string, negative operator is used and control supposed to be visible', ( assert ) => {
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
} );
