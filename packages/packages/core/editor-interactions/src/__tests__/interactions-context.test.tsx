import * as React from 'react';
import type { ReactNode } from 'react';
import { mockHistoryManager } from 'test-utils';
import {
	getElementInteractions,
	getElementLabel,
	playElementInteractions,
	updateElementInteractions,
} from '@elementor/editor-elements';
import { act, renderHook } from '@testing-library/react';

import { InteractionsProvider, useInteractionsContext } from '../contexts/interactions-context';
import { useElementInteractions } from '../hooks/use-element-interactions';
import type { ElementInteractions, InteractionItemPropValue } from '../types';
import { createInteractionItemValue } from './utils';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../hooks/use-element-interactions' );

function createMockInteractionItem( id: string ): InteractionItemPropValue {
	return {
		$$type: 'interaction-item',
		value: createInteractionItemValue( { interactionId: id } ),
	};
}

describe( 'InteractionsContext', () => {
	const mockElementId = 'element-123';
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<InteractionsProvider elementId={ mockElementId }>{ children }</InteractionsProvider>
	);

	beforeEach( () => {
		jest.clearAllMocks();
		( useElementInteractions as jest.Mock ).mockReturnValue( {
			version: 1,
			items: [],
		} );
		jest.mocked( getElementLabel ).mockReturnValue( 'Test Element' );
		jest.mocked( getElementInteractions ).mockReturnValue( {
			version: 1,
			items: [],
		} as unknown as ElementInteractions );
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

	describe( 'setInteractions history', () => {
		const historyMock = mockHistoryManager();

		beforeEach( () => {
			historyMock.beforeEach();
		} );

		afterEach( () => {
			historyMock.afterEach();
		} );

		it.each( [
			{ operation: 'apply', subtitle: 'Interaction Applied', prevCount: 0, nextCount: 1 },
			{ operation: 'delete', subtitle: 'Interaction Deleted', prevCount: 2, nextCount: 1 },
		] )( 'should support undo/redo for interaction $operation', ( { subtitle, prevCount, nextCount } ) => {
			// Arrange.
			const items = Array.from( { length: Math.max( prevCount, nextCount ) }, ( _, i ) =>
				createMockInteractionItem( `id-${ i }` )
			);
			const previous = { version: 1, items: items.slice( 0, prevCount ) } as unknown as ElementInteractions;
			const next = { version: 1, items: items.slice( 0, nextCount ) } as unknown as ElementInteractions;
			const expectedUndo = prevCount === 0 ? undefined : previous;

			( useElementInteractions as jest.Mock ).mockReturnValue( previous );
			jest.mocked( getElementInteractions ).mockReturnValue( previous );

			const { result } = renderHook( () => useInteractionsContext(), { wrapper } );

			// Act.
			act( () => {
				result.current.setInteractions( next );
			} );

			// Assert.
			expect( updateElementInteractions ).toHaveBeenNthCalledWith( 1, {
				elementId: mockElementId,
				interactions: next,
			} );
			expect( historyMock.instance.get()?.title ).toBe( 'Test Element' );
			expect( historyMock.instance.get()?.subTitle ).toBe( subtitle );

			// Act - Undo.
			act( () => {
				historyMock.instance.undo();
			} );

			// Assert - Reverted.
			expect( updateElementInteractions ).toHaveBeenNthCalledWith( 2, {
				elementId: mockElementId,
				interactions: expectedUndo,
			} );

			// Act - Redo.
			act( () => {
				historyMock.instance.redo();
			} );

			// Assert - Re-applied.
			expect( updateElementInteractions ).toHaveBeenNthCalledWith( 3, {
				elementId: mockElementId,
				interactions: next,
			} );
		} );

		it( 'should normalize empty items to undefined when clearing all interactions', () => {
			// Arrange.
			const previousInteractions = {
				version: 1,
				items: [ createMockInteractionItem( 'last-id' ) ],
			} as unknown as ElementInteractions;

			( useElementInteractions as jest.Mock ).mockReturnValue( previousInteractions );
			jest.mocked( getElementInteractions ).mockReturnValue( previousInteractions );

			const { result } = renderHook( () => useInteractionsContext(), { wrapper } );

			// Act.
			act( () => {
				result.current.setInteractions( { version: 1, items: [] } as unknown as ElementInteractions );
			} );

			// Assert.
			expect( updateElementInteractions ).toHaveBeenCalledWith( {
				elementId: mockElementId,
				interactions: undefined,
			} );
		} );

		it( 'should not create a history entry when editing (same item count)', () => {
			// Arrange.
			( useElementInteractions as jest.Mock ).mockReturnValue( {
				version: 1,
				items: [ createMockInteractionItem( 'existing-id' ) ],
			} );

			const { result } = renderHook( () => useInteractionsContext(), { wrapper } );

			const editedInteractions = {
				version: 1,
				items: [ createMockInteractionItem( 'existing-id' ) ],
			} as unknown as ElementInteractions;

			// Act.
			act( () => {
				result.current.setInteractions( editedInteractions );
			} );

			// Assert.
			expect( updateElementInteractions ).toHaveBeenCalledWith( {
				elementId: mockElementId,
				interactions: editedInteractions,
			} );
			expect( historyMock.instance.get() ).toBeNull();
		} );
	} );
} );
