import { act, renderHook, waitFor } from '@testing-library/react';

import {
	getDockedPanelInsetInlineEnd,
	NAVIGATOR_DOCKED_BODY_CLASS,
	NAVIGATOR_WIDTH_VAR,
	useDockedPanelInsetInlineEnd,
} from '../use-docked-layout';

describe( 'useDockedLayout navigator offset', () => {
	afterEach( () => {
		document.body.className = '';
		document.body.style.removeProperty( NAVIGATOR_WIDTH_VAR );
	} );

	it( 'returns zero inset when the navigator is not docked', () => {
		expect( getDockedPanelInsetInlineEnd() ).toBe( '0' );
	} );

	it( 'returns the navigator width variable when the navigator is docked', () => {
		document.body.classList.add( NAVIGATOR_DOCKED_BODY_CLASS );

		expect( getDockedPanelInsetInlineEnd() ).toBe( `var(${ NAVIGATOR_WIDTH_VAR }, 0px)` );
	} );

	it( 'updates the inset when the navigator docked class toggles', async () => {
		const { result } = renderHook( () => useDockedPanelInsetInlineEnd( true ) );

		expect( result.current ).toBe( '0' );

		await act( async () => {
			document.body.classList.add( NAVIGATOR_DOCKED_BODY_CLASS );
		} );

		await waitFor( () => {
			expect( result.current ).toBe( `var(${ NAVIGATOR_WIDTH_VAR }, 0px)` );
		} );
	} );
} );
