import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import {
	type CustomCssHeaderProps,
	CustomCssHeaderSlot,
	injectIntoCustomCssHeader,
} from '../custom-css-header-location';

describe( 'custom css header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items with element id', () => {
		// Arrange.
		const TestAction = ( { elementId }: CustomCssHeaderProps ) => <button type="button">{ elementId }</button>;
		injectIntoCustomCssHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <CustomCssHeaderSlot elementId="el-3" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'el-3' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <CustomCssHeaderSlot elementId="el-3" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
