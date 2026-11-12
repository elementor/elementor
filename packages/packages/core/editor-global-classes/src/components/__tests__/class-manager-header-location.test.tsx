import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import { ClassManagerHeaderSlot, injectIntoClassManagerHeader } from '../class-manager-header-location';

describe( 'class manager header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items', () => {
		// Arrange.
		const TestAction = () => <button type="button">Angie</button>;
		injectIntoClassManagerHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <ClassManagerHeaderSlot /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Angie' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <ClassManagerHeaderSlot /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
