import {
	ANALYTICS_TRANSFORM_RULES,
	getTotalAvailableCount,
	transformValueForAnalytics,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/utils/analytics-transformer';

describe( 'Analytics Transformer', () => {
	describe( 'ANALYTICS_TRANSFORM_RULES', () => {
		test( 'should transform string values correctly', () => {
			expect( ANALYTICS_TRANSFORM_RULES.STRING( 'test' ) ).toBe( 'test' );
			expect( ANALYTICS_TRANSFORM_RULES.STRING( '' ) ).toBe( '' );
		} );

		test( 'should transform boolean values correctly', () => {
			expect( ANALYTICS_TRANSFORM_RULES.BOOLEAN( true ) ).toBe( true );
			expect( ANALYTICS_TRANSFORM_RULES.BOOLEAN( false ) ).toBe( false );
		} );

		test( 'should return "None" for empty array', () => {
			expect( ANALYTICS_TRANSFORM_RULES.EMPTY_ARRAY() ).toBe( 'None' );
		} );

		test( 'should return "All" for full array', () => {
			expect( ANALYTICS_TRANSFORM_RULES.FULL_ARRAY() ).toBe( 'All' );
		} );

		test( 'should return "Partial" for partial array', () => {
			expect( ANALYTICS_TRANSFORM_RULES.PARTIAL_ARRAY() ).toBe( 'Partial' );
		} );
	} );

	describe( 'getTotalAvailableCount', () => {
		test( 'should return correct count for existing key', () => {
			// Arrange
			const optionsArray = [
				{ key: 'pages', options: [ 'page1', 'page2', 'page3' ] },
				{ key: 'posts', options: [ 'post1', 'post2' ] },
			];

			// Act
			const result = getTotalAvailableCount( 'pages', optionsArray );

			// Assert
			expect( result ).toBe( 3 );
		} );

		test( 'should return 0 for non-existing key', () => {
			// Arrange
			const optionsArray = [
				{ key: 'pages', options: [ 'page1', 'page2' ] },
			];

			// Act
			const result = getTotalAvailableCount( 'nonExisting', optionsArray );

			// Assert
			expect( result ).toBe( 0 );
		} );

		test( 'should handle empty options array', () => {
			// Arrange
			const optionsArray = [];

			// Act
			const result = getTotalAvailableCount( 'anyKey', optionsArray );

			// Assert
			expect( result ).toBe( 0 );
		} );

		test( 'should handle empty options within array', () => {
			// Arrange
			const optionsArray = [
				{ key: 'pages', options: [] },
				{ key: 'posts', options: [ 'post1' ] },
			];

			// Act
			const result = getTotalAvailableCount( 'pages', optionsArray );

			// Assert
			expect( result ).toBe( 0 );
		} );
	} );

	describe( 'transformValueForAnalytics', () => {
		const mockOptionsArray = [
			{ key: 'pages', options: [ 'page1', 'page2', 'page3' ] },
			{ key: 'posts', options: [ 'post1', 'post2' ] },
		];

		test( 'should transform string values', () => {
			// Act & Assert
			expect( transformValueForAnalytics( 'test', 'hello', mockOptionsArray ) ).toBe( 'hello' );
			expect( transformValueForAnalytics( 'test', '', mockOptionsArray ) ).toBe( '' );
		} );

		test( 'should transform boolean values', () => {
			// Act & Assert
			expect( transformValueForAnalytics( 'test', true, mockOptionsArray ) ).toBe( true );
			expect( transformValueForAnalytics( 'test', false, mockOptionsArray ) ).toBe( false );
		} );

		test( 'should transform objects with enabled property', () => {
			// Arrange
			const objectWithEnabled = { enabled: true, other: 'value' };
			const objectWithDisabled = { enabled: false, other: 'value' };

			// Act & Assert
			expect( transformValueForAnalytics( 'test', objectWithEnabled, mockOptionsArray ) ).toBe( true );
			expect( transformValueForAnalytics( 'test', objectWithDisabled, mockOptionsArray ) ).toBe( false );
		} );

		test( 'should transform empty arrays to "None"', () => {
			// Act & Assert
			expect( transformValueForAnalytics( 'pages', [], mockOptionsArray ) ).toBe( 'None' );
		} );

		test( 'should transform full arrays to "All"', () => {
			// Arrange
			const fullPagesArray = [ 'page1', 'page2', 'page3' ];
			const fullPostsArray = [ 'post1', 'post2' ];

			// Act & Assert
			expect( transformValueForAnalytics( 'pages', fullPagesArray, mockOptionsArray ) ).toBe( 'All' );
			expect( transformValueForAnalytics( 'posts', fullPostsArray, mockOptionsArray ) ).toBe( 'All' );
		} );

		test( 'should transform partial arrays to "Partial"', () => {
			// Arrange
			const partialPagesArray = [ 'page1', 'page2' ];
			const partialPostsArray = [ 'post1' ];

			// Act & Assert
			expect( transformValueForAnalytics( 'pages', partialPagesArray, mockOptionsArray ) ).toBe( 'Partial' );
			expect( transformValueForAnalytics( 'posts', partialPostsArray, mockOptionsArray ) ).toBe( 'Partial' );
		} );

		test( 'should handle null values', () => {
			// Act & Assert
			expect( transformValueForAnalytics( 'test', null, mockOptionsArray ) ).toBe( null );
		} );

		test( 'should handle undefined values', () => {
			// Act & Assert
			expect( transformValueForAnalytics( 'test', undefined, mockOptionsArray ) ).toBe( undefined );
		} );

		test( 'should handle objects without enabled property', () => {
			// Arrange
			const objectWithoutEnabled = { other: 'value', nested: { data: 'test' } };

			// Act & Assert
			expect( transformValueForAnalytics( 'test', objectWithoutEnabled, mockOptionsArray ) ).toBe( objectWithoutEnabled );
		} );

		test( 'should handle arrays with unknown key', () => {
			// Arrange
			const unknownKeyArray = [ 'item1', 'item2' ];

			// Act & Assert
			expect( transformValueForAnalytics( 'unknownKey', unknownKeyArray, mockOptionsArray ) ).toBe( 'Partial' );
		} );

		test( 'should handle numeric values', () => {
			// Act & Assert
			expect( transformValueForAnalytics( 'test', 42, mockOptionsArray ) ).toBe( 42 );
			expect( transformValueForAnalytics( 'test', 0, mockOptionsArray ) ).toBe( 0 );
		} );
	} );
} );
