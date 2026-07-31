import { readKitSnapshot } from '../read-kit-snapshot';

type GlobalColorApiItem = {
	id: string;
	title?: string;
	value?: string;
};

type GlobalTypographyApiItem = {
	id: string;
	title?: string;
	value?: {
		typography_font_family?: string;
	};
};

type AuditWindow = Window & {
	elementor?: {
		documents?: {
			get: ( id: number ) => { config?: { settings?: { settings?: Record< string, unknown > } } } | undefined;
		};
	};
	$e?: {
		data?: {
			get: (
				command: string
			) => Promise< { data?: Record< string, GlobalColorApiItem | GlobalTypographyApiItem > } >;
		};
	};
};

const KIT_ID = 42;

function setWindowMocks( overrides: Partial< AuditWindow > ): void {
	Object.assign( window, overrides );
}

describe( 'readKitSnapshot', () => {
	const originalElementor = ( window as AuditWindow ).elementor;
	const original$e = ( window as AuditWindow ).$e;

	afterEach( () => {
		setWindowMocks( { elementor: originalElementor, $e: original$e } );
	} );

	it( 'reads colors from the globals/colors API', async () => {
		setWindowMocks( {
			$e: {
				data: {
					get: jest.fn( async ( command: string ) => {
						if ( command === 'globals/colors' ) {
							return {
								data: {
									primary: { id: 'primary', title: 'Primary', value: '#6EC1E4' },
								},
							};
						}

						return { data: {} as Record< string, GlobalColorApiItem | GlobalTypographyApiItem > };
					} ),
				},
			},
		} );

		const snapshot = await readKitSnapshot( KIT_ID );

		expect( snapshot.globals.colors ).toEqual( [ { id: 'primary', value: '#6EC1E4', title: 'Primary' } ] );
	} );

	it( 'falls back to the kit document when the API returns no colors', async () => {
		setWindowMocks( {
			$e: {
				data: {
					get: jest.fn( async () => ( { data: {} as Record< string, GlobalColorApiItem | GlobalTypographyApiItem > } ) ),
				},
			},
			elementor: {
				documents: {
					get: () => ( {
						config: {
							settings: {
								settings: {
									system_colors: [ { _id: 'primary', title: 'Primary', color: '#111111' } ],
									custom_colors: [],
								},
							},
						},
					} ),
				},
			},
		} );

		const snapshot = await readKitSnapshot( KIT_ID );

		expect( snapshot.globals.colors ).toEqual( [ { id: 'primary', value: '#111111', title: 'Primary' } ] );
	} );

	it( 'returns empty globals when no API and no kit document exist', async () => {
		setWindowMocks( {
			$e: undefined,
			elementor: undefined,
		} );

		const snapshot = await readKitSnapshot( KIT_ID );

		expect( snapshot.globals.colors ).toEqual( [] );
		expect( snapshot.globals.fonts ).toEqual( [] );
	} );
} );
