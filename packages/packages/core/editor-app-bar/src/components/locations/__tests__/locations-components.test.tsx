import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { injectIntoPageIndication, injectIntoPrimaryAction, injectIntoResponsive } from '../../../locations';
import PageIndicationLocation from '../page-indication-location';
import PrimaryActionLocation from '../primary-action-location';
import ResponsiveLocation from '../responsive-location';

describe( 'Locations components', () => {
	it.each( [
		{
			name: 'page indication',
			component: PageIndicationLocation,
			inject: injectIntoPageIndication,
		},
		{
			name: 'responsive',
			component: ResponsiveLocation,
			inject: injectIntoResponsive,
		},
		{
			name: 'primary action',
			component: PrimaryActionLocation,
			inject: injectIntoPrimaryAction,
		},
	] )( 'should inject into $name', ( { inject, component: Component } ) => {
		// Act.
		inject( {
			id: 'test',
			component: () => <span>test</span>,
		} );

		// Assert.
		renderWithTheme( <Component /> );

		expect( screen.getByText( 'test' ) ).toBeInTheDocument();
	} );
} );
