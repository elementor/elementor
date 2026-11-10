import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import {
	injectIntoStyleTabHeader,
	type StyleTabHeaderProps,
	StyleTabHeaderSlot,
} from '../style-tab-header-location';

describe( 'style tab header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items with element id', () => {
		// Arrange.
		const TestAction = ( { elementId }: StyleTabHeaderProps ) => (
			<button type="button">{ elementId }</button>
		);
		injectIntoStyleTabHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <StyleTabHeaderSlot elementId="el-2" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'el-2' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <StyleTabHeaderSlot elementId="el-2" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
