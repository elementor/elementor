import { getContainer, getElementSettings, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';
import { mockHistoryManager } from 'test-utils';

import { HISTORY_DEBOUNCE_WAIT } from '../../../../hooks/use-styles-fields';
import { cascadeShowIconToHeads, useShowIconWriteThrough } from '../use-show-icon-write-through';

jest.mock( '@elementor/editor-elements' );

describe( 'useShowIconWriteThrough / cascadeShowIconToHeads', () => {
	const ACCORDION_ID = 'accordion-1';

	const headContainer = ( id: string ): V1Element =>
		( {
			id,
			model: { get: ( key: string ) => ( key === 'elType' ? 'e-accordion-item-head' : undefined ) },
		} as unknown as V1Element );

	const itemContainer = ( id: string ): V1Element =>
		( {
			id,
			model: { get: ( key: string ) => ( key === 'elType' ? 'e-accordion-item' : undefined ) },
			children: [ headContainer( `${ id }-head` ) ],
		} as unknown as V1Element );

	const accordionContainer = ( itemIds: string[] ): V1Element =>
		( {
			id: ACCORDION_ID,
			model: { get: ( key: string ) => ( key === 'elType' ? 'e-accordion' : undefined ) },
			children: itemIds.map( itemContainer ),
		} as unknown as V1Element );

	const historyMock = mockHistoryManager();

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		historyMock.beforeEach();

		jest.mocked( getContainer ).mockImplementation( ( id: string ) =>
			id === ACCORDION_ID ? accordionContainer( [ 'item-1', 'item-2' ] ) : null
		);

		jest.mocked( getElementSettings ).mockImplementation( ( elementId: string ) => ( {
			show_icon: { $$type: 'boolean', value: elementId === 'item-1-head' ? true : false },
		} ) );
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.useRealTimers();
	} );

	describe( 'cascadeShowIconToHeads', () => {
		it( 'updates every head under the accordion in one call', () => {
			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );

			// Assert.
			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-1-head',
				props: { show_icon: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-2-head',
				props: { show_icon: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
		} );

		it( 'restores every head to its previous value with a single undo', () => {
			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );

			// The history push is debounced (see the "debounce timing" tests below) - flush it before
			// undo can see anything on the stack.
			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT );
			jest.mocked( updateElementSettings ).mockClear();

			historyMock.instance.undo();

			// Assert.
			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-1-head',
				props: { show_icon: { $$type: 'boolean', value: true } },
				withHistory: false,
			} );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-2-head',
				props: { show_icon: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
		} );

		// Regression test: a head whose `show_icon` was never explicitly set (the common case - the
		// two default accordion items' heads start this way, see `Atomic_Accordion::build_default_item()`)
		// reports `null`, not a boolean prop object, from `getElementSettings`. The old `undo` guard
		// (`if ( ! previousValue ) return;`) treated that falsy `null` as "skip this head", so undo
		// silently did nothing for exactly this case. It must still write the head back (to `null`),
		// not skip it.
		it( 'restores a head to null on undo when its show_icon was unset beforehand', () => {
			// Arrange.
			jest.mocked( getElementSettings ).mockImplementation( ( elementId: string ) => ( {
				show_icon: elementId === 'item-1-head' ? null : { $$type: 'boolean', value: false },
			} ) );

			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );

			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT );
			jest.mocked( updateElementSettings ).mockClear();

			historyMock.instance.undo();

			// Assert.
			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-1-head',
				props: { show_icon: null },
				withHistory: false,
			} );
			expect( updateElementSettings ).toHaveBeenCalledWith( {
				id: 'item-2-head',
				props: { show_icon: { $$type: 'boolean', value: false } },
				withHistory: false,
			} );
		} );

		it( 'does nothing when the accordion has no heads', () => {
			// Arrange.
			jest.mocked( getContainer ).mockReturnValue( accordionContainer( [] ) );

			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );

			// Assert.
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'cascadeShowIconToHeads history debounce timing', () => {
		// `settings-field.tsx`'s `useUndoableUpdateElementProp` (the pipeline the root's plain
		// `Switch_Control` goes through) debounces its history push by `HISTORY_DEBOUNCE_WAIT`. Before
		// this fix, `cascadeShowIconToHeads` pushed its own history entry immediately/undebounced, so it
		// would always land on the undo stack *before* the root's - the opposite of the order the spec
		// wants (heads reverted together on the first Undo, root on the second). These tests exercise
		// the timing directly against `getHistoryManager`'s `addItem`, since the fake history util used
		// elsewhere in this file only retains a single item and can't itself demonstrate two-entry
		// stack ordering - see the task report for what this test suite can and cannot prove.
		it( 'does not push a history entry synchronously', () => {
			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );

			// Assert - the settings write happens synchronously ...
			expect( updateElementSettings ).toHaveBeenCalled();
			// ... but nothing has reached the undo stack yet.
			expect( historyMock.instance.get() ).toBeNull();
		} );

		it( 'still has not pushed a history entry just before the debounce window elapses', () => {
			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );
			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT - 1 );

			// Assert.
			expect( historyMock.instance.get() ).toBeNull();
		} );

		it( 'pushes the history entry once the same wait used by the root switch elapses', () => {
			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );
			jest.advanceTimersByTime( HISTORY_DEBOUNCE_WAIT );

			// Assert.
			expect( historyMock.instance.get() ).not.toBeNull();
			expect( historyMock.instance.get()?.subTitle ).toBe( 'Show Icon' );
		} );
	} );

	describe( 'useShowIconWriteThrough', () => {
		it( 'does not cascade on initial mount, even when show_icon is already off', () => {
			// Act.
			renderHook( () => useShowIconWriteThrough( ACCORDION_ID, false ) );

			// Assert.
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'cascades once when the value flips', () => {
			// Arrange.
			const { rerender } = renderHook( ( { showIcon }: { showIcon: boolean } ) =>
				useShowIconWriteThrough( ACCORDION_ID, showIcon ), { initialProps: { showIcon: true } }
			);

			// Act.
			rerender( { showIcon: false } );

			// Assert.
			expect( updateElementSettings ).toHaveBeenCalledTimes( 2 );
			expect( updateElementSettings ).toHaveBeenCalledWith(
				expect.objectContaining( { id: 'item-1-head', props: { show_icon: { $$type: 'boolean', value: false } } } )
			);
		} );

		it( 'does not cascade again when re-rendered with the same value', () => {
			// Arrange.
			const { rerender } = renderHook( ( { showIcon }: { showIcon: boolean } ) =>
				useShowIconWriteThrough( ACCORDION_ID, showIcon ), { initialProps: { showIcon: true } }
			);

			// Act.
			rerender( { showIcon: true } );

			// Assert.
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );

		it( 'does not cascade when only the accordion identity changes', () => {
			// Arrange.
			const { rerender } = renderHook(
				( { accordionId, showIcon }: { accordionId: string; showIcon: boolean } ) =>
					useShowIconWriteThrough( accordionId, showIcon ),
				{ initialProps: { accordionId: ACCORDION_ID, showIcon: true } }
			);

			// Act.
			rerender( { accordionId: 'other-accordion', showIcon: false } );

			// Assert.
			expect( updateElementSettings ).not.toHaveBeenCalled();
		} );
	} );
} );
