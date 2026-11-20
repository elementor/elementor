import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import {
	type ComponentInstanceHeaderProps,
	ComponentInstanceHeaderSlot,
	injectIntoComponentInstanceHeader,
} from '../component-instance-header-location';

describe( 'component instance header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items with component instance props', () => {
		// Arrange.
		const TestAction = ( { componentId, elementId }: ComponentInstanceHeaderProps ) => (
			<button type="button">{ `${ componentId }:${ elementId }` }</button>
		);
		injectIntoComponentInstanceHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <ComponentInstanceHeaderSlot componentId="comp-1" elementId="el-2" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'comp-1:el-2' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <ComponentInstanceHeaderSlot componentId="comp-1" elementId="el-2" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
