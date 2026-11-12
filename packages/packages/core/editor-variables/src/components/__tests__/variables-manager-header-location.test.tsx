import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import { injectIntoVariablesManagerHeader, VariablesManagerHeaderSlot } from '../variables-manager-header-location';

describe( 'variables manager header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items', () => {
		// Arrange.
		const TestAction = () => <button type="button">Angie</button>;
		injectIntoVariablesManagerHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <VariablesManagerHeaderSlot /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Angie' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <VariablesManagerHeaderSlot /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
