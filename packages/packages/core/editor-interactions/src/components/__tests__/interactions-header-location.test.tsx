import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import {
	injectIntoInteractionsHeader,
	type InteractionsHeaderProps,
	InteractionsHeaderSlot,
} from '../interactions-header-location';

describe( 'interactions header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items with element id', () => {
		// Arrange.
		const TestAction = ( { elementId }: InteractionsHeaderProps ) => <button type="button">{ elementId }</button>;
		injectIntoInteractionsHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <InteractionsHeaderSlot elementId="el-5" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'el-5' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <InteractionsHeaderSlot elementId="el-5" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
