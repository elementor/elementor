import { getV1CurrentDocument, setDocumentModifiedStatus } from '@elementor/editor-documents';

import {
	AGENTS_SETTINGS_KEY,
	getKitSettingsBag,
	LLMS_SETTINGS_KEY,
	readLlmsContent,
	writeLlmsContent,
} from '../llms-settings';

jest.mock( '@elementor/editor-documents', () => ( {
	getV1CurrentDocument: jest.fn(),
	setDocumentModifiedStatus: jest.fn(),
} ) );

const mockGetV1CurrentDocument = jest.mocked( getV1CurrentDocument );
const mockSetDocumentModifiedStatus = jest.mocked( setDocumentModifiedStatus );

function createSettingsBag( initial: Record< string, unknown > = {} ) {
	const store = { ...initial };

	return {
		get: jest.fn( ( key: string ) => store[ key ] ),
		set: jest.fn( ( key: string, value: unknown ) => {
			if ( undefined === value ) {
				delete store[ key ];
				return;
			}

			store[ key ] = value;
		} ),
		store,
	};
}

describe( 'llms-settings', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns null when the kit settings bag is unavailable', () => {
		// Arrange.
		mockGetV1CurrentDocument.mockReturnValue( null );

		// Assert.
		expect( getKitSettingsBag() ).toBeNull();
		expect( readLlmsContent() ).toBe( '' );
		expect( writeLlmsContent( 'content' ) ).toBe( false );
	} );

	it( 'reads llms content from nested agents settings', () => {
		// Arrange.
		const settings = createSettingsBag( {
			[ AGENTS_SETTINGS_KEY ]: {
				[ LLMS_SETTINGS_KEY ]: '# llms.txt',
			},
		} );

		mockGetV1CurrentDocument.mockReturnValue( {
			container: { settings },
		} as unknown as ReturnType< typeof getV1CurrentDocument > );

		// Assert.
		expect( readLlmsContent() ).toBe( '# llms.txt' );
	} );

	it( 'writes llms content and marks the document as modified', () => {
		// Arrange.
		const settings = createSettingsBag();
		mockGetV1CurrentDocument.mockReturnValue( {
			container: { settings },
		} as unknown as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		const result = writeLlmsContent( '# llms.txt' );

		// Assert.
		expect( result ).toBe( true );
		expect( settings.set ).toHaveBeenCalledWith( AGENTS_SETTINGS_KEY, {
			[ LLMS_SETTINGS_KEY ]: '# llms.txt',
		} );
		expect( mockSetDocumentModifiedStatus ).toHaveBeenCalledWith( true );
	} );

	it( 'preserves existing agents keys when updating llms content', () => {
		// Arrange.
		const settings = createSettingsBag( {
			[ AGENTS_SETTINGS_KEY ]: {
				future_setting: 'keep-me',
			},
		} );
		mockGetV1CurrentDocument.mockReturnValue( {
			container: { settings },
		} as unknown as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		writeLlmsContent( '# llms.txt' );

		// Assert.
		expect( settings.set ).toHaveBeenCalledWith( AGENTS_SETTINGS_KEY, {
			future_setting: 'keep-me',
			[ LLMS_SETTINGS_KEY ]: '# llms.txt',
		} );
	} );

	it( 'removes only llms when clearing content but keeps other agents keys', () => {
		// Arrange.
		const settings = createSettingsBag( {
			[ AGENTS_SETTINGS_KEY ]: {
				[ LLMS_SETTINGS_KEY ]: '# llms.txt',
				future_setting: 'keep-me',
			},
		} );
		mockGetV1CurrentDocument.mockReturnValue( {
			container: { settings },
		} as unknown as ReturnType< typeof getV1CurrentDocument > );

		// Act.
		writeLlmsContent( '' );

		// Assert.
		expect( settings.set ).toHaveBeenCalledWith( AGENTS_SETTINGS_KEY, {
			future_setting: 'keep-me',
		} );
	} );
} );
