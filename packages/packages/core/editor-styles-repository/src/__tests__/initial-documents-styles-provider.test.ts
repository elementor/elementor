import { createMockStyleDefinition } from 'test-utils';
import { __getState as getState } from '@elementor/store';

import { initialDocumentsStylesProvider } from '../providers/inital-documents-styles-provider';
import { SLICE_NAME } from '../store/initial-documents-styles-store';

jest.mock( '@elementor/store', () => {
	const actual = jest.requireActual( '@elementor/store' );
	return {
		...actual,
		__getState: jest.fn(),
		__subscribeWithSelector: jest.fn(),
	};
} );

describe( 'initialDocumentsStylesProvider', () => {
	const DOC_ID_1 = 1;
	const DOC_ID_2 = 2;

	const STYLE_1 = createMockStyleDefinition( { id: 's-1' } );
	const STYLE_2 = createMockStyleDefinition( { id: 's-2' } );
	const STYLE_3 = createMockStyleDefinition( { id: 's-3' } );

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getState ).mockReturnValue( {
			[ SLICE_NAME ]: {
				data: {
					[ DOC_ID_1 ]: [ STYLE_1, STYLE_2 ],
					[ DOC_ID_2 ]: [ STYLE_3 ],
				},
			},
		} as unknown as ReturnType< typeof getState > );
	} );

	it.each( [
		{ id: 's-1', expected: STYLE_1 },
		{ id: 's-2', expected: STYLE_2 },
		{ id: 's-3', expected: STYLE_3 },
	] )( 'should get a style for $id', ( { id, expected } ) => {
		// Act.
		const style = initialDocumentsStylesProvider.actions.get( id );

		// Assert.
		expect( style ).toStrictEqual( expected );
	} );

	it( 'should expose the static key', () => {
		// Act.
		const key = initialDocumentsStylesProvider.getKey();

		// Assert.
		expect( key ).toBe( 'initial-documents-styles' );
	} );
} );
