import useKitCallToActionUpdatedUrl from '../../../../../../../../../app/modules/kit-library/assets/js/hooks/use-kit-call-to-action-updated-url.js';

test( 'useKitCallToActionUpdatedUrl should return the url with utm_term and utm_content', () => {
	// Arrange
	const url = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro';
	const kitTitle = 'Digital Marketing Studio';
	const kitId = '6242d5f21475e1001dc794ae';
	const expectedUrl = 'https://elementor.com/pro/?utm_source=kit-library&utm_medium=wp-dash&utm_campaign=gopro&utm_term=digital-marketing-studio&utm_content=6242d5f21475e1001dc794ae';

	// Act
	const updatedUrl = useKitCallToActionUpdatedUrl( url, kitId, kitTitle );

	// Assert
	expect( updatedUrl ).toBe( expectedUrl );
} );
