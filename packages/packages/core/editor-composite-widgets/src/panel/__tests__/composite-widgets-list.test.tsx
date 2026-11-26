import * as React from 'react';
import { renderWithStore } from 'test-utils';
import { screen } from '@testing-library/react';

import { CompositeWidgetsList } from '../composite-widgets-list';
import { createDefinition, setupStore } from './panel-definitions-fixture';

describe( 'CompositeWidgetsList', () => {
	it( 'should render the stored site widgets', () => {
		// Arrange.
		const store = setupStore( [
			createDefinition( 'site/card', { title: 'Card' } ),
			createDefinition( 'site/hero', { title: 'Hero' } ),
		] );

		// Act.
		renderWithStore( <CompositeWidgetsList />, store );

		// Assert.
		expect( screen.getByText( 'Card' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Hero' ) ).toBeInTheDocument();
	} );

	it( 'should hide archived, non-insertable and built-in widgets', () => {
		// Arrange.
		const store = setupStore( [
			createDefinition( 'site/card', { title: 'Card' } ),
			createDefinition( 'site/old', { title: 'Old', archived: true } ),
			createDefinition( 'site/locked', { title: 'Locked', insertable: false } ),
			createDefinition( 'elementor/icon-button', { title: 'Icon button', source: 'code' } ),
		] );

		// Act.
		renderWithStore( <CompositeWidgetsList />, store );

		// Assert.
		expect( screen.getByText( 'Card' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Old' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Locked' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Icon button' ) ).not.toBeInTheDocument();
	} );

	it( 'should render nothing when there are no site widgets', () => {
		// Arrange.
		const store = setupStore( [ createDefinition( 'elementor/icon-button', { source: 'code' } ) ] );

		// Act.
		const { container } = renderWithStore( <CompositeWidgetsList />, store );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );
} );
