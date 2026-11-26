import { dismissNotification, notify } from '@elementor/editor-notifications';
import { renderHook } from '@testing-library/react';

import { useActionProps } from '../use-action-props';

const ANGIE_OPEN_ERROR_NOTIFICATION_ID = 'angie-top-bar-open-error';

jest.mock( '@elementor/editor-notifications', () => ( {
	dismissNotification: jest.fn(),
	notify: jest.fn(),
} ) );

const setHost = (
	state: 'plugin' | 'sdk' | 'promo' | 'hidden',
	editorAngie: { getAngieState: () => typeof state; openAngie?: jest.Mock } = {
		getAngieState: () => state,
		openAngie: jest.fn().mockResolvedValue( undefined ),
	}
) => {
	window.elementorV2 = { editorAngie };
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

	it.each( [ 'sdk', 'plugin' ] as const )(
		'opens Angie through the editor host when state is %s',
		async ( state ) => {
			const openAngie = jest.fn().mockResolvedValue( undefined );
			setHost( state, { getAngieState: () => state, openAngie } );

			const { result } = renderHook( () => useActionProps() );

			result.current.onClick();

			await Promise.resolve();

			expect( openAngie ).toHaveBeenCalledWith(
				expect.objectContaining( {
					prompt: '',
					mode: 'ask',
				} )
			);
		}
	);

	it.each( [ 'sdk', 'plugin' ] as const )(
		'shows an error notification when openAngie is missing in %s state',
		async ( state ) => {
			setHost( state, { getAngieState: () => state } );

			const { result } = renderHook( () => useActionProps() );

			result.current.onClick();

			await Promise.resolve();

			expect( notify ).toHaveBeenCalledWith(
				expect.objectContaining( {
					id: ANGIE_OPEN_ERROR_NOTIFICATION_ID,
					type: 'error',
				} )
			);
		}
	);

	it( 'shows an error notification when openAngie rejects and retries on click', async () => {
		const openAngie = jest.fn().mockRejectedValue( new Error( 'failed' ) );
		setHost( 'sdk', { getAngieState: () => 'sdk', openAngie } );

		const { result } = renderHook( () => useActionProps() );

		result.current.onClick();

		await Promise.resolve();

		expect( notify ).toHaveBeenCalledWith(
			expect.objectContaining( {
				id: ANGIE_OPEN_ERROR_NOTIFICATION_ID,
				type: 'error',
			} )
		);

		const retryOnClick = ( notify as jest.Mock ).mock.calls[ 0 ][ 0 ].additionalActionProps[ 0 ].onClick;

		retryOnClick();

		expect( dismissNotification ).toHaveBeenCalledWith( ANGIE_OPEN_ERROR_NOTIFICATION_ID );
		expect( openAngie ).toHaveBeenCalledTimes( 2 );
	} );
} );