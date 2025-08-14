import { createMockChild, createMockContainer, dispatchCommandAfter, dispatchV1ReadyEvent } from 'test-utils';
import { act, renderHook } from '@testing-library/react';

import { getContainer } from '../../sync/get-container';
import { type ElementChildren, useElementChildren } from '../use-element-children';

jest.mock( '../../sync/get-container' );

describe( 'useElementChildren', () => {
	const mockGetContainer = jest.mocked( getContainer );

	beforeEach( () => {
		mockGetContainer.mockClear();
	} );

	it( 'should return empty arrays for each requested type when container is not found', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( null );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab', 'accordion' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [],
			accordion: [],
		} );
	} );

	it( 'should return empty arrays for each requested type when container has no children', () => {
		// Arrange.
		const mockContainer = createMockContainer( 'element-1', [] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab', 'accordion' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [],
			accordion: [],
		} );
	} );

	it( 'should return children grouped by widget type', () => {
		// Arrange.
		const mockChildren = [
			createMockChild( 'child-1', 'tab' ),
			createMockChild( 'child-2', 'accordion' ),
			createMockChild( 'child-3', 'tab' ),
		];
		const mockContainer = createMockContainer( 'element-1', mockChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab', 'accordion' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' }, { id: 'child-3' } ],
			accordion: [ { id: 'child-2' } ],
		} );
	} );

	it( 'should filter children by requested types only', () => {
		// Arrange.
		const mockChildren = [
			createMockChild( 'child-1', 'tab' ),
			createMockChild( 'child-2', 'accordion' ),
			createMockChild( 'child-3', 'button' ),
		];
		const mockContainer = createMockContainer( 'element-1', mockChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );
	} );

	it( 'should include empty arrays for types with no matching children', () => {
		// Arrange.
		const mockChildren = [ createMockChild( 'child-1', 'tab' ) ];
		const mockContainer = createMockContainer( 'element-1', mockChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab', 'accordion' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
			accordion: [],
		} );
	} );

	it( 'should update when V1 ready event is dispatched', () => {
		// Arrange.
		const mockChildren = [ createMockChild( 'child-1', 'tab' ) ];
		const mockContainer = createMockContainer( 'element-1', mockChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );

		// Arrange.
		const newMockChildren = [ createMockChild( 'child-1', 'tab' ), createMockChild( 'child-2', 'tab' ) ];
		const newMockContainer = createMockContainer( 'element-1', newMockChildren );
		mockGetContainer.mockReturnValue( newMockContainer );

		// Act.
		act( () => {
			dispatchV1ReadyEvent();
		} );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' }, { id: 'child-2' } ],
		} );
	} );

	it.each( [
		'document/elements/create',
		'document/elements/delete',
		'document/elements/update',
		'document/elements/set-settings',
	] )( 'should update when %s command ends', ( command ) => {
		// Arrange.
		const mockChildren = [ createMockChild( 'child-1', 'tab' ) ];
		const mockContainer = createMockContainer( 'element-1', mockChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );

		// Arrange.
		const newMockChildren = [ createMockChild( 'child-1', 'tab' ), createMockChild( 'child-2', 'tab' ) ];
		const newMockContainer = createMockContainer( 'element-1', newMockChildren );
		mockGetContainer.mockReturnValue( newMockContainer );

		// Act.
		act( () => {
			dispatchCommandAfter( command );
		} );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' }, { id: 'child-2' } ],
		} );
	} );

	it( 'should re-compute when elementId dependency changes', () => {
		// Arrange.
		const mockContainer1 = createMockContainer( 'element-1', [ createMockChild( 'child-1', 'tab' ) ] );
		const mockContainer2 = createMockContainer( 'element-2', [
			createMockChild( 'child-2', 'tab' ),
			createMockChild( 'child-3', 'tab' ),
		] );

		mockGetContainer.mockImplementation( ( id ) => {
			if ( id === 'element-1' ) {
				return mockContainer1;
			}
			if ( id === 'element-2' ) {
				return mockContainer2;
			}
			return null;
		} );

		// Act.
		const { result, rerender } = renderHook( ( { elementId } ) => useElementChildren( elementId, [ 'tab' ] ), {
			initialProps: { elementId: 'element-1' },
		} );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );

		// Act.
		rerender( { elementId: 'element-2' } );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-2' }, { id: 'child-3' } ],
		} );
	} );

	it( 'should handle children without widgetType', () => {
		// Arrange.
		const mockChildren = [
			createMockChild( 'child-1', 'tab' ),
			createMockChild( 'child-2', undefined ), // No widgetType
		];
		const mockContainer = createMockContainer( 'element-1', mockChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', [ 'tab' ] ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );
	} );
} );
