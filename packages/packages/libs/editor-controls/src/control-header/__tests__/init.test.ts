import { ControlHeaderAppPromotion } from '../../components/control-header-app-promotion';
import { injectIntoControlHeader } from '../../components/control-header-location';
import { CONTROL_HEADER_APP_PROMOTION_ID, hasExternalControlHeaderInjections, initControlHeader } from '../init';

jest.mock( '../../components/control-header-location', () => ( {
	injectIntoControlHeader: jest.fn(),
} ) );

describe( 'initControlHeader', () => {
	it( 'injects the app promotion trigger before other header actions', () => {
		// Act.
		initControlHeader();

		// Assert.
		expect( injectIntoControlHeader ).toHaveBeenCalledWith( {
			id: CONTROL_HEADER_APP_PROMOTION_ID,
			component: ControlHeaderAppPromotion,
			options: { priority: 5 },
		} );
	} );
} );

describe( 'hasExternalControlHeaderInjections', () => {
	it.each( [
		{ case: 'no injections', ids: [], expected: false },
		{ case: 'only the built-in app promotion', ids: [ CONTROL_HEADER_APP_PROMOTION_ID ], expected: false },
		{ case: 'an external injection', ids: [ CONTROL_HEADER_APP_PROMOTION_ID, 'external' ], expected: true },
	] )( 'returns $expected for $case', ( { ids, expected } ) => {
		// Act.
		const result = hasExternalControlHeaderInjections( ids.map( ( id ) => ( { id } ) ) );

		// Assert.
		expect( result ).toBe( expected );
	} );
} );
