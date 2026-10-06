import { hasAccessibilityWidgetScript } from '../scan-accessibility-widgets';

describe( 'hasAccessibilityWidgetScript', () => {
	it( 'detects the Ally widget script with an api_key query string', () => {
		const html = '<script src="https://cdn.elementor.com/a11y/widget.js?api_key=abc123"></script>';

		expect( hasAccessibilityWidgetScript( html ) ).toBe( true );
	} );

	it( 'detects the Ally widget script without a query string', () => {
		const html = '<script src="https://cdn.elementor.com/a11y/widget.js"></script>';

		expect( hasAccessibilityWidgetScript( html ) ).toBe( true );
	} );

	it( 'returns false when no known accessibility widget script is present', () => {
		const html = '<html><head></head><body>Hello</body></html>';

		expect( hasAccessibilityWidgetScript( html ) ).toBe( false );
	} );
} );
