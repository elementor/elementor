import { ControlHeaderAppPromotion } from '../../components/control-header-app-promotion';
import { injectIntoControlHeader } from '../../components/control-header-location';
import { CONTROL_HEADER_APP_PROMOTION_ID, initControlHeader } from '../init';

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
