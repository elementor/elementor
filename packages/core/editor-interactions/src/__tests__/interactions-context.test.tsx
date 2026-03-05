import * as React from 'react';
import { playElementInteractions, useElementInteractions } from '@elementor/editor-elements';
import { act, renderHook } from '@testing-library/react';

import { InteractionsProvider, useInteractionsContext } from '../contexts/interactions-context';

jest.mock( '@elementor/editor-elements' );

describe( 'InteractionsContext', () => {
	const mockElementId = 'element-123';
	const wrapper = ( { children }: { children: React.ReactNode } ) => (
		<InteractionsProvider elementId={ mockElementId }>{ children }</InteractionsProvider>
	);

	beforeEach( () => {
		jest.clearAllMocks();
		( useElementInteractions as jest.Mock ).mockReturnValue( {
			version: 1,
			items: [],
		} );
	} );

	describe( 'playInteractions', () => {
		it( 'should call playElementInteractions with elementId and interactionId', () => {
			const { result } = renderHook( () => useInteractionsContext(), { wrapper } );

			act( () => {
				result.current.playInteractions( 'interaction-id-123' );
			} );

			expect( playElementInteractions ).toHaveBeenCalledWith( mockElementId, 'interaction-id-123' );
		} );

		it( 'should handle multiple playInteractions calls', () => {
			const { result } = renderHook( () => useInteractionsContext(), { wrapper } );

			act( () => {
				result.current.playInteractions( 'interaction-id-1' );
				result.current.playInteractions( 'interaction-id-2' );
			} );

			expect( playElementInteractions ).toHaveBeenCalledTimes( 2 );
			expect( playElementInteractions ).toHaveBeenNthCalledWith( 1, mockElementId, 'interaction-id-1' );
			expect( playElementInteractions ).toHaveBeenNthCalledWith( 2, mockElementId, 'interaction-id-2' );
		} );
	} );
} );
