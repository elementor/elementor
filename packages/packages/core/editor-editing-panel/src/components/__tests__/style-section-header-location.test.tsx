import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import {
	injectIntoStyleSectionHeader,
	type StyleSectionHeaderProps,
	StyleSectionHeaderSlot,
} from '../style-section-header-location';

describe( 'style section header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items with section props', () => {
		// Arrange.
		const TestAction = ( { elementId, sectionName }: StyleSectionHeaderProps ) => (
			<button type="button">{ `${ elementId }:${ sectionName }` }</button>
		);
		injectIntoStyleSectionHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <StyleSectionHeaderSlot elementId="el-1" sectionName="Layout" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'el-1:Layout' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when the section is not in the filter list', () => {
		// Arrange.
		const TestAction = () => <button type="button">Filtered</button>;
		injectIntoStyleSectionHeader( {
			id: 'filtered-action',
			component: TestAction,
			sections: [ 'Typography' ],
		} );

		// Act.
		render( <StyleSectionHeaderSlot elementId="el-1" sectionName="Layout" /> );

		// Assert.
		expect( screen.queryByRole( 'button', { name: 'Filtered' } ) ).not.toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <StyleSectionHeaderSlot elementId="el-1" sectionName="Layout" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
