import { getContainer, selectElement } from '@elementor/editor-elements';
import { __privateOpenRoute as openRoute, __privateRunCommand as runCommand } from '@elementor/editor-v1-adapters';

import { focusViolation } from '../focus-violation';

type ElementorWindowWithScroll = Window & {
	elementor?: {
		helpers?: {
			scrollToView?: ( element: unknown, timeout?: number ) => void;
		};
	};
};

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	__privateOpenRoute: jest.fn(),
	__privateRunCommand: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	getContainer: jest.fn(),
	selectElement: jest.fn(),
} ) );

describe( 'focusViolation', () => {
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
		// Act.
		focusViolation( {
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

		// Act.
		focusViolation( {
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

	it( 'should focus the element when both elementId and externalUrl are set', () => {
		// Arrange.
		const domElement = document.createElement( 'div' );
		const container = {
			view: {
				getDomElement: () => domElement,
			},
		};
		const scrollToView = jest.fn();
		const extendedWindow = window as unknown as ElementorWindowWithScroll;
		const originalElementor = extendedWindow.elementor;

		extendedWindow.elementor = {
			helpers: { scrollToView },
		};

		jest.mocked( getContainer ).mockReturnValue( container as unknown as ReturnType< typeof getContainer > );
		const url = 'https://example.com/wp-admin/plugin-install.php?tab=plugin-information&plugin=pojo-accessibility';

		// Act.
		focusViolation( {
			auditId: 'audits/images-alt-text',
			elementId: 'i1',
			targetHint: 'element-settings',
			label: 'One or more images are missing alt text.',
			externalUrl: url,
		} );

		// Assert.
		expect( selectElement ).toHaveBeenCalledWith( 'i1' );
		expect( scrollToView ).toHaveBeenCalledWith( domElement, 200 );
		expect( runCommand ).toHaveBeenCalledWith( 'panel/editor/open' );
		expect( window.open ).not.toHaveBeenCalled();

		extendedWindow.elementor = originalElementor;
	} );

	it( 'should open the external url in a new tab when externalUrl is set', () => {
		// Arrange.
		const url = 'https://example.com/wp-admin/options-privacy.php';

		// Act.
		focusViolation( {
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
