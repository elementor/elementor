import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import { DefaultStylesHeaderSlot, injectIntoDefaultStylesHeader } from '../default-styles-header-location';

describe( 'default styles header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items', () => {
		// Arrange.
		const TestAction = () => <button type="button">Angie</button>;
		injectIntoDefaultStylesHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <DefaultStylesHeaderSlot /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Angie' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <DefaultStylesHeaderSlot /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
