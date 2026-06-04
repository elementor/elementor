import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { useViolationFocus } from '../use-violation-focus';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateOpenRoute: jest.fn(),
	__privateRunCommand: jest.fn(),
} ) );

describe( 'useViolationFocus', () => {
	const originalWindowOpen = window.open;

	beforeEach( () => {
		jest.clearAllMocks();
		window.open = jest.fn();
	} );

	afterEach( () => {
		window.open = originalWindowOpen;
	} );

	it( 'should open the page settings route for page settings violations', () => {
		// Arrange.
		const { focus } = useViolationFocus();

		// Act.
		focus( {
			auditId: 'audits/page-featured-image',
			label: 'No featured image set.',
			targetHint: 'page-settings',
		} );

		// Assert.
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/page-settings/settings' );
		expect( runCommand ).not.toHaveBeenCalled();
	} );

	it( 'should open site identity settings after opening global panel', async () => {
		// Arrange.
		jest.mocked( runCommand ).mockResolvedValue( undefined );
		const { focus } = useViolationFocus();

		// Act.
		focus( {
			auditId: 'audits/site-identity',
			label: 'Site logo is not set.',
			targetHint: 'site-identity-settings',
		} );

		await Promise.resolve();

		// Assert.
		expect( runCommand ).toHaveBeenCalledTimes( 1 );
		expect( runCommand ).toHaveBeenCalledWith( 'panel/global/open' );
		expect( openRoute ).toHaveBeenCalledTimes( 1 );
		expect( openRoute ).toHaveBeenCalledWith( 'panel/global/settings-site-identity' );
	} );

	it( 'should open the external url in a new tab when externalUrl is set', () => {
		// Arrange.
		const { focus } = useViolationFocus();
		const url = 'https://example.com/wp-admin/options-privacy.php';

		// Act.
		focus( {
			auditId: 'audits/privacy-policy',
			label: 'No privacy policy page is set.',
			externalUrl: url,
		} );

		// Assert.
		expect( window.open ).toHaveBeenCalledWith( url, '_blank' );
		expect( openRoute ).not.toHaveBeenCalled();
		expect( runCommand ).not.toHaveBeenCalled();
	} );
} );
