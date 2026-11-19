import { renderHook } from '@testing-library/react';

import { DOCKED_BODY_CLASS, DOCKED_WIDTH_VAR, useDockedLayout } from '../use-docked-layout';

describe( 'useDockedLayout', () => {
	afterEach( () => {
		document.body.className = '';
		document.body.style.removeProperty( DOCKED_WIDTH_VAR );
	} );

	it( 'sets the docked body class and width while active', () => {
		const { unmount } = renderHook( () => useDockedLayout( true, 360 ) );

		expect( document.body ).toHaveClass( DOCKED_BODY_CLASS );
		expect( document.body.style.getPropertyValue( DOCKED_WIDTH_VAR ) ).toBe( '360px' );

		unmount();

		expect( document.body ).not.toHaveClass( DOCKED_BODY_CLASS );
		expect( document.body.style.getPropertyValue( DOCKED_WIDTH_VAR ) ).toBe( '' );
	} );
} );
