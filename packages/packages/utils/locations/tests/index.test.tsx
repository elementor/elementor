import { LocationsManager } from '../src/locations-manager';
import { Slot } from '../src/components/slot';
import { render } from '@testing-library/react';

describe( 'Test', () => {
	it( 'Should work', () => {
		const { container } = render( <Slot name="test" /> );

		expect( container ).toBeTruthy();
	} );
} );
