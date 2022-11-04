import useAddKitPromotionUtm from 'elementor/app/modules/kit-library/assets/js/hooks/use-add-kit-promotion-utm.js';

describe( 'useAddKitPromotionUtm', () => {
	test( 'should return the url with utm_term and utm_content', () => {
		// Arrange
		const url = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro';
		const kitTitle = 'Digital Marketing Studio';
		const kitId = '6242d5f21475e1001dc794ae';
		const expectedUrl = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae';

		// Act
		const updatedUrl = useAddKitPromotionUtm( url, kitId, kitTitle );

		// Assert
		expect( updatedUrl ).toBe( expectedUrl );
	} );

	test( 'query params with  multiple spaces, numbers and invalid characters', () => {
		// Arrange
		const url = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro';
		const kitTitle = 'Digital *  Marketing Studio 2';
		const kitId = '6242d5f21475e1001dc794ae';
		const expectedUrl = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital---marketing-studio-2&utm_content=6242d5f21475e1001dc794ae';

		// Act
		const updatedUrl = useAddKitPromotionUtm( url, kitId, kitTitle );

		// Assert
		expect( updatedUrl ).toBe( expectedUrl );
	} );

	test( 'no query params', () => {
		// Arrange
		const url = 'https://elementor.com/pro/';
		const kitTitle = 'Digital Marketing Studio';
		const kitId = '6242d5f21475e1001dc794ae';
		const expectedUrl = 'https://elementor.com/pro/?utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae';

		// Act
		const updatedUrl = useAddKitPromotionUtm( url, kitId, kitTitle );

		// Assert
		expect( updatedUrl ).toBe( expectedUrl );
	} );

	test( 'no query params', () => {
		// Arrange
		const url = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=already_exists';
		const kitTitle = 'Digital Marketing Studio';
		const kitId = '6242d5f21475e1001dc794ae';
		const expectedUrl = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae';

		// Act
		const updatedUrl = useAddKitPromotionUtm( url, kitId, kitTitle );

		// Assert
		expect( updatedUrl ).toBe( expectedUrl );
	} );
} );

