import { renderHook } from '@testing-library/react';

import { useActionProps } from '../use-action-props';

jest.mock( '@elementor/editor-notifications', () => ( {
	notify: jest.fn(),
} ) );

const setHost = ( state: 'plugin' | 'sdk' | 'promo' | 'hidden', openAngie = jest.fn() ) => {
	window.elementorV2 = { editorAngie: { getAngieState: () => state, openAngie } };
};

describe( 'useAngieActionProps', () => {
	const originalElementorV2 = window.elementorV2;

	afterEach( () => {
		window.elementorV2 = originalElementorV2;
		jest.clearAllMocks();
	} );

	it( 'is not visible when Angie state is hidden', () => {
		setHost( 'hidden' );

		const { result } = renderHook( () => useActionProps() );

		expect( result.current.visible ).toBe( false );
	} );

	it( 'toggles the guide card when Angie state is promo', () => {
		setHost( 'promo' );
		const dispatchEvent = jest.spyOn( window, 'dispatchEvent' );

		const { result } = renderHook( () => useActionProps() );

		expect( result.current.visible ).toBe( true );
		result.current.onClick();

		expect( dispatchEvent ).toHaveBeenCalledWith(
			expect.objectContaining( { type: 'elementor/editor/toggle-angie-guide' } )
		);
	} );

	it( 'opens Angie through the editor host when state is sdk', async () => {
		const openAngie = jest.fn().mockResolvedValue( undefined );
		setHost( 'sdk', openAngie );

		const { result } = renderHook( () => useActionProps() );

		result.current.onClick();

		await Promise.resolve();

		expect( openAngie ).toHaveBeenCalledWith(
			expect.objectContaining( {
				prompt: '',
				mode: 'ask',
			} )
		);
	} );
} );
