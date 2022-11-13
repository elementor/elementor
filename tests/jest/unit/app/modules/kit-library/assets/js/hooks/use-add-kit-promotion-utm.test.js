import useAddKitPromotionUTM from 'elementor/app/modules/kit-library/assets/js/hooks/use-add-kit-promotion-utm.js';

describe( 'useAddKitPromotionUTM', () => {
	test.each( [
		{
			testName: 'Should return the URL with utm_term and utm_content',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: 'Digital Marketing Studio',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae',
		},
		{
			testName: 'Should handle invalid URL ',
			url: 'elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: 'Digital Marketing Studio',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: '',
		},
		{
			testName: 'Should handle query params with invalid characters',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: 'Digital Mark*eting Studio',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae',
		},
		{
			testName: 'Should handle query params with multiple spaces',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: 'Digital Marketing    Studio',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae',
		},
		{
			testName: 'Should handle query params with multiple spaces, numbers and invalid characters',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: 'Digital Marketing *  Studio',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing--studio&utm_content=6242d5f21475e1001dc794ae',
		},
		{
			testName: 'Should handle no kitTitle',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: '',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_content=6242d5f21475e1001dc794ae',
		},
		{
			testName: 'Should handle no kitId',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: 'Digital Marketing Studio',
			kitId: '',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio',
		},
		{
			testName: 'Should handle no kitTitle and no kitId',
			url: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
			kitTitle: '',
			kitId: '',
			expectedUrl: 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro',
		},
		{
			testName: 'Should handle no URL',
			url: '',
			kitTitle: 'Digital Marketing Studio',
			kitId: '6242d5f21475e1001dc794ae',
			expectedUrl: '',
		},
	] )( `$testName`, ( { url, kitTitle, kitId, expectedUrl } ) => {
		// Act
		const updatedUrl = useAddKitPromotionUTM( url, kitId, kitTitle );

		// Assert
		expect( updatedUrl ).toBe( expectedUrl );
	} );
} );

