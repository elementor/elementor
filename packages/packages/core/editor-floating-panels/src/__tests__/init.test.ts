import { injectIntoTop } from '@elementor/editor';

import { slice } from '../store/slice';

const mockRegisterSlice = jest.fn();

jest.mock( '@elementor/editor', () => ( {
	injectIntoTop: jest.fn(),
} ) );

jest.mock( '../sync', () => ( {
	sync: jest.fn(),
} ) );

jest.mock( '@elementor/store', () => {
	const actual = jest.requireActual( '@elementor/store' );

	return {
		...actual,
		__registerSlice: ( ...args: unknown[] ) => mockRegisterSlice( ...args ),
	};
} );

import { init } from '../init';
import { sync } from '../sync';

describe( 'init', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'registers the slice, injects the host, and starts persistence sync', () => {
		// Act.
		init();

		// Assert.
		expect( mockRegisterSlice ).toHaveBeenCalledWith( slice );
		expect( injectIntoTop ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: 'floating-panels',
			} )
		);
		expect( sync ).toHaveBeenCalled();
	} );
} );
