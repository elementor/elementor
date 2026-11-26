import {
	getSiteIdentityValues,
	handleKitSiteIdentityTool,
	resolveKitContainer,
	setSiteIdentityValues,
} from '../handler';
import { fetchKitSettings, updateKitSettings } from '../kit-settings-api';

jest.mock( '../kit-settings-api', () => ( {
	fetchKitSettings: jest.fn(),
	updateKitSettings: jest.fn(),
} ) );

const KIT_ID = 42;
const OTHER_DOCUMENT_ID = 999;

const createKitContainer = ( {
	siteName = 'My Site',
	siteDescription = 'Tagline',
	siteLogo = { id: 10, url: 'https://example.com/logo.png' },
	siteFavicon = { id: 0, url: '' },
}: {
	siteName?: string;
	siteDescription?: string;
	siteLogo?: { id: number; url: string };
	siteFavicon?: { id: number; url: string };
} = {} ) => {
	const values: Record< string, unknown > = {
		site_name: siteName,
		site_description: siteDescription,
		site_logo: siteLogo,
		site_favicon: siteFavicon,
	};

	return {
		settings: {
			get: jest.fn( ( key: string ) => values[ key ] ),
		},
	};
};

describe( 'v3-kit-site-identity handler', () => {
	let run: jest.Mock;
	let getContainer: jest.Mock;
	let documentsGet: jest.Mock;

	beforeEach( () => {
		run = jest.fn( () => Promise.resolve() );
		getContainer = jest.fn();
		documentsGet = jest.fn();

		Object.defineProperty( window, '$e', {
			configurable: true,
			writable: true,
			value: { run },
		} );
		Object.defineProperty( window, 'elementor', {
			configurable: true,
			writable: true,
			value: {
				config: { kit_id: KIT_ID },
				documents: { get: documentsGet, getCurrentId: () => KIT_ID },
				getContainer,
			},
		} );
	} );

	afterEach( () => {
		Reflect.deleteProperty( window, '$e' );
		Reflect.deleteProperty( window, 'elementor' );
		jest.clearAllMocks();
	} );

	it( 'resolves the kit container from documents.get', () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act
		const resolved = resolveKitContainer();

		// Assert
		expect( documentsGet ).toHaveBeenCalledWith( KIT_ID );
		expect( resolved ).toBe( container );
		expect( getContainer ).not.toHaveBeenCalled();
	} );

	it( 'refuses to resolve the container when the kit is not the current document', () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );
		Object.defineProperty( window, 'elementor', {
			configurable: true,
			writable: true,
			value: {
				config: { kit_id: KIT_ID },
				documents: { get: documentsGet, getCurrentId: () => OTHER_DOCUMENT_ID },
				getContainer,
			},
		} );

		// Act / Assert
		expect( () => resolveKitContainer() ).toThrow( /must be the current document/ );
	} );

	it( 'falls back to getContainer when the kit document has no container', () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container: null } );
		getContainer.mockReturnValue( container );

		// Act
		const resolved = resolveKitContainer();

		// Assert
		expect( getContainer ).toHaveBeenCalledWith( String( KIT_ID ) );
		expect( resolved ).toBe( container );
	} );

	it( 'reads selected site identity fields with normalized media values', async () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act
		const result = await getSiteIdentityValues( [ 'site_name', 'site_logo' ] );

		// Assert
		expect( result ).toEqual( {
			site_name: 'My Site',
			site_logo: { id: 10, url: 'https://example.com/logo.png' },
		} );
	} );

	it( 'writes through document/elements/settings with external: true', async () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act
		const result = await setSiteIdentityValues( {
			site_name: 'Renamed',
			site_logo: { id: 99, url: 'https://cdn.example/new-logo.svg' },
		} );

		// Assert
		expect( run ).toHaveBeenCalledWith( 'document/elements/settings', {
			container,
			settings: {
				site_name: 'Renamed',
				site_logo: { id: 99, url: 'https://cdn.example/new-logo.svg' },
			},
			options: { external: true },
		} );
		expect( result ).toEqual( {
			success: true,
			site_name: 'Renamed',
			site_logo: { id: 99, url: 'https://cdn.example/new-logo.svg' },
		} );
	} );

	it( 'rejects a missing kit id', async () => {
		// Arrange
		Object.defineProperty( window, 'elementor', {
			configurable: true,
			writable: true,
			value: { config: {}, documents: { get: documentsGet, getCurrentId: () => KIT_ID }, getContainer },
		} );

		// Act / Assert
		await expect(
			handleKitSiteIdentityTool( {
				action: 'get',
			} )
		).rejects.toThrow( /Kit ID is missing/ );
	} );

	it( 'rejects when the kit container is not loaded', async () => {
		// Arrange
		documentsGet.mockReturnValue( { container: null } );
		getContainer.mockReturnValue( null );

		// Act / Assert
		await expect(
			handleKitSiteIdentityTool( {
				action: 'get',
			} )
		).rejects.toThrow( /container is not loaded/ );
	} );

	it( 'rejects invalid field names on get', async () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act / Assert
		await expect(
			handleKitSiteIdentityTool( {
				action: 'get',
				fields: [ 'site_logo', 'not_a_field' as 'site_logo' ],
			} )
		).rejects.toThrow( /Invalid field/ );
	} );

	it( 'rejects set without a patch', async () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act / Assert
		await expect(
			handleKitSiteIdentityTool( {
				action: 'set',
			} )
		).rejects.toThrow( /patch is required/ );
		expect( run ).not.toHaveBeenCalled();
	} );

	it( 'rejects an empty patch on set', async () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act / Assert
		await expect(
			handleKitSiteIdentityTool( {
				action: 'set',
				patch: {},
			} )
		).rejects.toThrow( /at least one site identity field/ );
		expect( run ).not.toHaveBeenCalled();
	} );

	it( 'rejects invalid media shape on set', async () => {
		// Arrange
		const container = createKitContainer();
		documentsGet.mockReturnValue( { container } );

		// Act / Assert
		await expect(
			handleKitSiteIdentityTool( {
				action: 'set',
				patch: {
					site_logo: { id: 'bad' as unknown as number },
				},
			} )
		).rejects.toThrow( /Invalid media shape/ );
		expect( run ).not.toHaveBeenCalled();
	} );

	describe( 'when the kit is not the current document', () => {
		beforeEach( () => {
			Object.defineProperty( window, 'elementor', {
				configurable: true,
				writable: true,
				value: {
					config: { kit_id: KIT_ID },
					documents: { get: documentsGet, getCurrentId: () => OTHER_DOCUMENT_ID },
					getContainer,
				},
			} );
		} );

		it( 'reads site identity through the active kit settings API', async () => {
			// Arrange
			( fetchKitSettings as jest.Mock ).mockResolvedValue( {
				settings: {
					site_name: 'Remote Site',
					site_logo: { id: 7, url: 'https://example.com/remote.png' },
				},
				editable: { site_name: false, site_logo: true },
			} );

			// Act
			const result = await getSiteIdentityValues( [ 'site_name', 'site_logo' ] );

			// Assert
			expect( fetchKitSettings ).toHaveBeenCalledWith( [ 'site_name', 'site_logo' ] );
			expect( result ).toEqual( {
				editable: { site_name: false, site_logo: true },
				site_name: 'Remote Site',
				site_logo: { id: 7, url: 'https://example.com/remote.png' },
			} );
		} );

		it( 'writes through the active kit settings API and syncs the loaded kit model', async () => {
			// Arrange
			const container = { settings: { get: jest.fn(), set: jest.fn() } };
			documentsGet.mockReturnValue( { container } );
			( updateKitSettings as jest.Mock ).mockResolvedValue( undefined );

			// Act
			const result = await setSiteIdentityValues( { site_name: 'Renamed' } );

			// Assert
			expect( updateKitSettings ).toHaveBeenCalledWith( { site_name: 'Renamed' } );
			expect( container.settings.set ).toHaveBeenCalledWith( { site_name: 'Renamed' } );
			expect( run ).not.toHaveBeenCalled();
			expect( result ).toEqual( { success: true, site_name: 'Renamed' } );
		} );

		it( 'writes through the active kit settings API when the kit model is not loaded', async () => {
			// Arrange
			documentsGet.mockReturnValue( undefined );
			getContainer.mockReturnValue( null );
			( updateKitSettings as jest.Mock ).mockResolvedValue( undefined );

			// Act
			const result = await setSiteIdentityValues( { site_name: 'Renamed' } );

			// Assert
			expect( updateKitSettings ).toHaveBeenCalledWith( { site_name: 'Renamed' } );
			expect( result ).toEqual( { success: true, site_name: 'Renamed' } );
		} );
	} );
} );
