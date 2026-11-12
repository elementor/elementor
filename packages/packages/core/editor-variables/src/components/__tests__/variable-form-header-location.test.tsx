import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import {
	injectIntoVariableFormHeader,
	type VariableFormHeaderProps,
	VariableFormHeaderSlot,
} from '../variable-form-header-location';

describe( 'variable form header location', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'should render injected items with form header props', () => {
		// Arrange.
		const TestAction = ( { variableType, label }: VariableFormHeaderProps ) => (
			<button type="button">{ `${ variableType }:${ label ?? 'new' }` }</button>
		);
		injectIntoVariableFormHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <VariableFormHeaderSlot variableType="color" label="Brand" /> );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'color:Brand' } ) ).toBeInTheDocument();
	} );

	it( 'should render nothing when nothing is injected', () => {
		// Act.
		const { container } = render( <VariableFormHeaderSlot variableType="color" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
