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
		const { result } = renderHook( () =>
			useElementChildren( 'element-1', { tabs: 'tab', accordions: 'accordion' } )
		);

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
		const { result } = renderHook( () =>
			useElementChildren( 'element-1', { tabs: 'tab', accordions: 'accordion' } )
		);

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [],
			accordion: [],
		} );
	} );

	it( 'should return children grouped by element type', () => {
		// Arrange.
		const tabs = [
			createMockChild( { id: 'child-1', elType: 'tab' } ),
			createMockChild( { id: 'child-3', elType: 'tab' } ),
		];

		const tabsParent = createMockContainer( 'tabs-parent', tabs, 'tabs' );

		const accordions = [ createMockChild( { id: 'child-2', elType: 'accordion' } ) ];

		const accordionsParent = createMockContainer( 'accordions-parent', accordions, 'accordions' );

		const mockContainer = createMockContainer( 'element-1', [ tabsParent, accordionsParent ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () =>
			useElementChildren( 'element-1', { tabs: 'tab', accordions: 'accordion' } )
		);

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' }, { id: 'child-3' } ],
			accordion: [ { id: 'child-2' } ],
		} );
	} );

	it( 'should filter children by requested types only', () => {
		// Arrange.
		const mockChildren = [
			createMockChild( { id: 'child-1', elType: 'tab' } ),
			createMockChild( { id: 'child-2', elType: 'accordion' } ),
			createMockChild( { id: 'child-3', elType: 'button' } ),
		];

		const tabsParent = createMockContainer( 'tabs-parent', mockChildren, 'tabs' );

		const mockContainer = createMockContainer( 'element-1', [ tabsParent ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );
	} );

	it( 'should include empty arrays for types with no matching children', () => {
		// Arrange.
		const tabs = [ createMockChild( { id: 'child-1', elType: 'tab' } ) ];
		const tabsParent = createMockContainer( 'tabs-parent', tabs, 'tabs' );

		const accordionsParent = createMockContainer( 'accordions-parent', [], 'accordions' );

		const mockContainer = createMockContainer( 'element-1', [ tabsParent, accordionsParent ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () =>
			useElementChildren( 'element-1', { tabs: 'tab', accordions: 'accordion' } )
		);

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
			accordion: [],
		} );
	} );

	it( 'should update when V1 ready event is dispatched', () => {
		// Arrange.
		const tabs = [ createMockChild( { id: 'child-1', elType: 'tab' } ) ];
		const tabsParent = createMockContainer( 'tabs-parent', tabs, 'tabs' );

		const mockContainer = createMockContainer( 'element-1', [ tabsParent ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );

		// Arrange.
		const newTabs = [
			createMockChild( { id: 'child-1', elType: 'tab' } ),
			createMockChild( { id: 'child-2', elType: 'tab' } ),
		];

		const newTabsParent = createMockContainer( 'tabs-parent', newTabs, 'tabs' );

		const newMockContainer = createMockContainer( 'element-1', [ newTabsParent ] );
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
		const tabs = [ createMockChild( { id: 'child-1', elType: 'tab' } ) ];
		const tabsParent = createMockContainer( 'tabs-parent', tabs, 'tabs' );

		const mockContainer = createMockContainer( 'element-1', [ tabsParent ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );

		// Arrange.
		const newTabs = [
			createMockChild( { id: 'child-1', elType: 'tab' } ),
			createMockChild( { id: 'child-2', elType: 'tab' } ),
		];
		const newTabsParent = createMockContainer( 'tabs-parent', newTabs, 'tabs' );

		const newMockContainer = createMockContainer( 'element-1', [ newTabsParent ] );
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
		const tabs1 = [ createMockChild( { id: 'child-1', elType: 'tab' } ) ];
		const tabsParent1 = createMockContainer( 'tabs-parent-1', tabs1, 'tabs' );
		const mockContainer1 = createMockContainer( 'element-1', [ tabsParent1 ] );

		const tabs2 = [
			createMockChild( { id: 'child-2', elType: 'tab' } ),
			createMockChild( { id: 'child-3', elType: 'tab' } ),
		];
		const tabsParent2 = createMockContainer( 'tabs-parent-2', tabs2, 'tabs' );
		const mockContainer2 = createMockContainer( 'element-2', [ tabsParent2 ] );

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
		const { result, rerender } = renderHook(
			( { elementId } ) => useElementChildren( elementId, { tabs: 'tab' } ),
			{
				initialProps: { elementId: 'element-1' },
			}
		);

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

	it( 'should handle children without elType', () => {
		// Arrange.
		const tabs = [
			createMockChild( { id: 'child-1', elType: 'tab' } ),
			createMockChild( { id: 'child-2', elType: '' } ),
		];
		const tabsParent = createMockContainer( 'tabs-parent', tabs, 'tabs' );

		const mockContainer = createMockContainer( 'element-1', [ tabsParent ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'child-1' } ],
		} );
	} );

	it( 'should find children recursively at multiple levels', () => {
		// Arrange.
		const nestedChildren = createNestedMockElements();
		const mockContainer = createMockContainer( 'element-1', nestedChildren );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () =>
			useElementChildren( 'element-1', { container: 'tab', section: 'accordion' } )
		);

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'grandchild-1' } ],
			accordion: [ { id: 'grandchild-2' } ],
		} );
	} );

	it( 'should handle deeply nested children correctly', () => {
		// Arrange.
		const deeplyNestedChild = createMockChild( { id: 'deep-child', elType: 'tab' } );
		const levelThreeContainer = createMockContainer( 'level-3', [ deeplyNestedChild ], 'tabs' );

		const levelTwoContainer = createMockContainer( 'level-2', [ levelThreeContainer ] );
		const levelOneContainer = createMockContainer( 'level-1', [ levelTwoContainer ] );
		const mockContainer = createMockContainer( 'element-1', [ levelOneContainer ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'deep-child' } ],
		} );
	} );

	it( 'should handle case when container children is undefined', () => {
		// Arrange.
		const mockContainer = {
			id: 'element-1',
			model: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
			settings: { get: jest.fn(), set: jest.fn(), toJSON: jest.fn() },
			children: undefined,
		};

		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [],
		} );
	} );

	it( 'should properly group nested children by element type', () => {
		// Arrange.
		const nestedTabChild = createMockChild( { id: 'nested-tab', elType: 'tab' } );
		const nestedAccordionChild = createMockChild( { id: 'nested-accordion', elType: 'accordion' } );
		const nestedButtonChild = createMockChild( { id: 'nested-button', elType: 'button' } );

		const container1 = createMockContainer( 'container-1', [ nestedTabChild, nestedButtonChild ], 'tabs' );

		const container2 = createMockContainer( 'container-2', [ nestedAccordionChild ], 'accordions' );

		const mockContainer = createMockContainer( 'element-1', [ container1, container2 ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () =>
			useElementChildren( 'element-1', { tabs: 'tab', accordions: 'accordion' } )
		);

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'nested-tab' } ],
			accordion: [ { id: 'nested-accordion' } ],
		} );
	} );

	it( 'should only return direct children from the first level where parent is found, not nested descendants', () => {
		// Arrange.
		const deeplyNestedTab = createMockChild( { id: 'deeply-nested-tab', elType: 'tab' } );
		const nestedTabContainer = createMockContainer( 'nested-tab-container', [ deeplyNestedTab ] );

		const directTab1 = createMockChild( { id: 'direct-tab-1', elType: 'tab' } );
		const directTab2 = createMockContainer( 'direct-tab-2', [ nestedTabContainer ], 'tab' );

		const tabsParent = createMockContainer( 'tabs-parent', [ directTab1, directTab2 ], 'tabs' );

		const outerContainer = createMockContainer( 'outer-container', [ tabsParent ] );
		const mockContainer = createMockContainer( 'element-1', [ outerContainer ] );
		mockGetContainer.mockReturnValue( mockContainer );

		// Act.
		const { result } = renderHook( () => useElementChildren( 'element-1', { tabs: 'tab' } ) );

		// Assert.
		expect( result.current ).toEqual< ElementChildren >( {
			tab: [ { id: 'direct-tab-1' }, { id: 'direct-tab-2' } ],
		} );
	} );
} );

function createNestedMockElements() {
	const grandChild1 = createMockChild( { id: 'grandchild-1', elType: 'tab' } );
	const grandChild2 = createMockChild( { id: 'grandchild-2', elType: 'accordion' } );

	const child1 = createMockContainer( 'child-1', [ grandChild1 ] );

	const child2 = createMockChild( { id: 'child-2', elType: 'tab' } );
	const child3 = createMockContainer( 'child-3', [ grandChild2 ], 'section' );

	return [ child1, child2, child3 ];
}
