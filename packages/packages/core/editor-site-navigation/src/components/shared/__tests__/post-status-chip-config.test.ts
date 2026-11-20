import { getStatusChipConfig } from '../page-title-and-status';

describe( 'getStatusChipConfig', () => {
	it( 'maps pending to warning tone', () => {
		expect( getStatusChipConfig( 'pending' ) ).toEqual( {
			color: 'warning',
			label: 'Pending Review',
		} );
	} );

	it( 'maps draft to neutral tone', () => {
		expect( getStatusChipConfig( 'draft' ) ).toMatchObject( {
			color: 'default',
			label: 'Draft',
		} );
	} );

	it( 'maps scheduled and private to neutral tone', () => {
		expect( getStatusChipConfig( 'future' ) ).toMatchObject( {
			color: 'default',
			label: 'Scheduled',
		} );
		expect( getStatusChipConfig( 'private' ) ).toMatchObject( {
			color: 'default',
			label: 'Private',
		} );
	} );

	it( 'falls back to neutral for custom statuses', () => {
		expect( getStatusChipConfig( 'custom-status' ) ).toEqual( {
			color: 'default',
			label: 'custom-status',
		} );
	} );
} );
