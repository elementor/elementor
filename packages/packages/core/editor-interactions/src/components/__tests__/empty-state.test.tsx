import * as React from 'react';
import { __flushAllInjections as flushAllInjections } from '@elementor/locations';
import { render, screen } from '@testing-library/react';

import { injectIntoInteractionsHeader } from '../interactions-header-location';
import { EmptyState } from '../empty-state';

describe( 'interactions EmptyState', () => {
	afterEach( () => {
		flushAllInjections();
	} );

	it( 'renders interactions header injections with elementId', () => {
		// Arrange.
		const ELEMENT_ID = 'el-empty';
		const TestAction = ( { elementId }: { elementId: string } ) => (
			<span role="status">{ elementId }</span>
		);
		injectIntoInteractionsHeader( { id: 'test-action', component: TestAction } );

		// Act.
		render( <EmptyState elementId={ ELEMENT_ID } onCreateInteraction={ jest.fn() } /> );

		// Assert.
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( ELEMENT_ID );
	} );
} );
