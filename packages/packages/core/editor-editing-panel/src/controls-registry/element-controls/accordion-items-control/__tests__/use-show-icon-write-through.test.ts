import { getContainer, getElementSettings, updateElementSettings, type V1Element } from '@elementor/editor-elements';
import { renderHook } from '@testing-library/react';
import { mockHistoryManager } from 'test-utils';

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

		it( 'does nothing when the accordion has no heads', () => {
			// Arrange.
			jest.mocked( getContainer ).mockReturnValue( accordionContainer( [] ) );

			// Act.
			cascadeShowIconToHeads( { accordionId: ACCORDION_ID, showIcon: false } );

			// Assert.
			expect( updateElementSettings ).not.toHaveBeenCalled();
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
