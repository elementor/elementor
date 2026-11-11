import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import { ComponentsTabHeaderSlot, injectIntoComponentsTabHeader } from '../components-tab-header-location';

describe( 'components tab header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items', () => {
		// Arrange.
		const TestAction = () => <button type="button">Angie</button>;
		injectIntoComponentsTabHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <ComponentsTabHeaderSlot /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Angie' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <ComponentsTabHeaderSlot /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
