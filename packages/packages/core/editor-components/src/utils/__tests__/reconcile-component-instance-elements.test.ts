import {
  getWidgetsCache,
  type V1ElementConfig,
  type V1ElementData,
} from '@elementor/editor-elements';

import { reconcileComponentInstanceElements } from '../reconcile-component-instance-elements';

jest.mock( '@elementor/editor-elements', () => ( {
  ...jest.requireActual( '@elementor/editor-elements' ),
  getWidgetsCache: jest.fn(),
} ) );

const PARENT_TYPE = 'e-reconcile-test-parent';
const CHILD_TYPE = 'e-reconcile-test-child';
const LEAF_TYPE = 'e-reconcile-test-leaf';

const SHOW_CHILD_RULE = {
  child_type: CHILD_TYPE,
  when: {
    relation: 'or' as const,
    terms: [ { operator: 'ne' as const, path: [ 'show_child' ], value: false } ],
  },
  position: { kind: 'last' as const, value: null },
  stash: false,
  default_model: {
    elType: CHILD_TYPE,
    isLocked: true,
    elements: [ { elType: LEAF_TYPE }, { elType: LEAF_TYPE } ],
  } as unknown as V1ElementData,
};

describe( 'reconcileComponentInstanceElements', () => {
  beforeEach( () => {
    sessionStorage.clear();

    jest.mocked( getWidgetsCache ).mockReturnValue( {
      [ PARENT_TYPE ]: {
        title: 'Parent',
        controls: {},
        children_dependencies: [ SHOW_CHILD_RULE ],
      },
      [ CHILD_TYPE ]: { title: 'Child', controls: {} },
      [ LEAF_TYPE ]: { title: 'Leaf', controls: {} },
    } as unknown as Record< string, V1ElementConfig > );
  } );

  it( 'adds the child when the condition is met', () => {
    // Arrange.
    const elements = [ createParent( { show_child: { $$type: 'boolean', value: true } } ) ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result[ 0 ].elements?.map( ( child ) => child.elType ) ).toEqual( [ CHILD_TYPE ] );
  } );

  it( 'removes the child when the condition fails', () => {
    // Arrange.
    const existing = { id: 'child1', elType: CHILD_TYPE, elements: [] } as V1ElementData;
    const elements = [
      createParent( { show_child: { $$type: 'boolean', value: false } }, [ existing ] ),
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result[ 0 ].elements ).toEqual( [] );
  } );

  it( 'keeps an existing child untouched when the condition is met', () => {
    // Arrange.
    const existing = { id: 'child1', elType: CHILD_TYPE, elements: [] } as V1ElementData;
    const elements = [
      createParent( { show_child: { $$type: 'boolean', value: true } }, [ existing ] ),
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result[ 0 ].elements ).toHaveLength( 1 );
    expect( result[ 0 ].elements?.[ 0 ].id ).toBe( 'child1' );
  } );

  it( 'leaves elements without children_dependencies untouched', () => {
    // Arrange.
    const elements = [
      { id: 'leaf1', elType: LEAF_TYPE, settings: {}, elements: [] } as V1ElementData,
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result ).toEqual( elements );
  } );

  it( 'reconciles nested elements', () => {
    // Arrange.
    const elements = [
      {
        id: 'outer1',
        elType: CHILD_TYPE,
        settings: {},
        elements: [ createParent( { show_child: { $$type: 'boolean', value: true } } ) ],
      } as V1ElementData,
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result[ 0 ].elements?.[ 0 ].elements?.map( ( child ) => child.elType ) ).toEqual( [
      CHILD_TYPE,
    ] );
  } );

  it( 'applies overrides to the settings the dependency is evaluated against', () => {
    // Arrange: the element itself says "show", the instance override says "hide".
    const elements = [
      createParent( {
        show_child: {
          $$type: 'overridable',
          value: {
            override_key: 'show_child_override',
            origin_value: { $$type: 'boolean', value: true },
          },
        },
      } ),
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements, {
      show_child_override: { $$type: 'boolean', value: false },
    } );

    // Assert.
    expect( result[ 0 ].elements ).toEqual( [] );
  } );

  it( 'unwraps overridable settings so the rendered element sees plain values', () => {
    // Arrange.
    const elements = [
      createParent( {
        show_child: {
          $$type: 'overridable',
          value: {
            override_key: 'show_child_override',
            origin_value: { $$type: 'boolean', value: true },
          },
        },
      } ),
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result[ 0 ].settings?.show_child ).toEqual( { $$type: 'boolean', value: true } );
  } );

  it( 'derives ids for the whole inserted subtree instead of random ones', () => {
    // Arrange.
    const elements = [ createParent( { show_child: { $$type: 'boolean', value: true } } ) ];

    // Act.
    const inserted = reconcileComponentInstanceElements( elements )[ 0 ].elements?.[ 0 ];

    // Assert: these hashes are asserted verbatim in the PHP counterpart
    // (`test-reconcile-component-instance-elements.php`) so the render and canvas
    // element ids stay identical.
    expect( inserted?.id ).toBe( '0f3lpg5' );
    expect( inserted?.elements?.map( ( leaf ) => leaf.id ) ).toEqual( [ '0p2wcv5', '1ed1jog' ] );
  } );

  it( 'derives the same ids on every run', () => {
    // Arrange.
    const elements = [ createParent( { show_child: { $$type: 'boolean', value: true } } ) ];

    // Act.
    const first = reconcileComponentInstanceElements( elements );
    const second = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( first ).toEqual( second );
  } );

  it( 'derives distinct ids for different parents', () => {
    // Arrange.
    const settings = { show_child: { $$type: 'boolean', value: true } };
    const elements = [
      createParent( settings, [], 'parent1' ),
      createParent( settings, [], 'parent2' ),
    ];

    // Act.
    const result = reconcileComponentInstanceElements( elements );

    // Assert.
    expect( result[ 0 ].elements?.[ 0 ].id ).not.toBe( result[ 1 ].elements?.[ 0 ].id );
  } );

  it( 'preserves the default_model payload of the inserted child', () => {
    // Arrange.
    const elements = [ createParent( { show_child: { $$type: 'boolean', value: true } } ) ];

    // Act.
    const inserted = reconcileComponentInstanceElements( elements )[ 0 ].elements?.[ 0 ];

    // Assert.
    expect( inserted?.elType ).toBe( CHILD_TYPE );
    expect( inserted?.isLocked ).toBe( true );
  } );
} );

function createParent(
  settings: Record< string, unknown > = {},
  children: V1ElementData[] = [],
  id = 'parent1'
): V1ElementData {
  return {
    id,
    elType: PARENT_TYPE,
    settings,
    elements: children,
  } as V1ElementData;
}
