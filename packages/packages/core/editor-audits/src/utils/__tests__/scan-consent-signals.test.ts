import { hasConsentDefaultCall, hasGoogleTracking } from '../scan-consent-signals';

describe( 'hasGoogleTracking', () => {
	it( 'returns true when a GA4 gtag script is present', () => {
		// Arrange.
		const html = '<script src="https://www.googletagmanager.com/gtag/js?id=G-ABC123"></script>';

		// Act & Assert.
		expect( hasGoogleTracking( html ) ).toBe( true );
	} );

	it( 'returns true when a Google Ads gtag script is present', () => {
		// Arrange.
		const html = '<script src="https://www.googletagmanager.com/gtag/js?id=AW-123456"></script>';

		// Act & Assert.
		expect( hasGoogleTracking( html ) ).toBe( true );
	} );

	it( 'returns true when a GTM container script is present', () => {
		// Arrange.
		const html = '<script src="https://www.googletagmanager.com/gtm.js?id=GTM-XYZ123"></script>';

		// Act & Assert.
		expect( hasGoogleTracking( html ) ).toBe( true );
	} );

	it( 'returns true for an inline GTM bootstrap snippet that builds the src via concatenation', () => {
		// Arrange.
		const html = `(function(w,d,s,l,i){w[l]=w[l]||[];var f=d.getElementsByTagName(s)[0],j=d.createElement(s);
			j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);
			})(window,document,'script','dataLayer','GTM-XYZ123');`;

		// Act & Assert.
		expect( hasGoogleTracking( html ) ).toBe( true );
	} );

	it( 'returns true for an inline gtag config call without a script src', () => {
		// Arrange.
		const html = "gtag('config', 'G-ABC123');";

		// Act & Assert.
		expect( hasGoogleTracking( html ) ).toBe( true );
	} );

	it( 'returns false when no Google tracking script is present', () => {
		// Arrange.
		const html = '<html><head></head><body>Hello</body></html>';

		// Act & Assert.
		expect( hasGoogleTracking( html ) ).toBe( false );
	} );
} );

describe( 'hasConsentDefaultCall', () => {
	it( 'returns true when gtag consent default call is present with double quotes', () => {
		// Arrange.
		const html = 'gtag("consent", "default", { ad_storage: "denied" });';

		// Act & Assert.
		expect( hasConsentDefaultCall( html ) ).toBe( true );
	} );

	it( 'returns true when gtag consent default call is present with single quotes', () => {
		// Arrange.
		const html = "gtag('consent', 'default', { ad_storage: 'denied' });";

		// Act & Assert.
		expect( hasConsentDefaultCall( html ) ).toBe( true );
	} );

	it( 'returns true when consent default is pushed to dataLayer directly (GTM/CMP setups)', () => {
		// Arrange.
		const html = "dataLayer.push(['consent', 'default', { ad_storage: 'denied' }]);";

		// Act & Assert.
		expect( hasConsentDefaultCall( html ) ).toBe( true );
	} );

	it( 'returns false when gtag is called with a different command', () => {
		// Arrange.
		const html = "gtag('config', 'G-ABC123');";

		// Act & Assert.
		expect( hasConsentDefaultCall( html ) ).toBe( false );
	} );

	it( 'returns false when no gtag call is present', () => {
		// Arrange.
		const html = '<html><head></head><body>Hello</body></html>';

		// Act & Assert.
		expect( hasConsentDefaultCall( html ) ).toBe( false );
	} );
} );
