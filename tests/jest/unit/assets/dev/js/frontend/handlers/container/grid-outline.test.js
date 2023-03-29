import GridOutline from '../../../../../../../../../assets/dev/js/frontend/handlers/container/grid-outline';

const gridOutline = new GridOutline();
gridOutline.getGridDimensions = jest.fn().mockReturnValue( 12 );

describe( 'GridOutline', () => {
	it( 'should return the grid dimensions', () => {

		expect( gridOutline.getGridDimensions() ).toBe( 12 );
	} );
} );
