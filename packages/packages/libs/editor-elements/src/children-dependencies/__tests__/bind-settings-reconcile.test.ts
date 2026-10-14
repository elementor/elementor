import { createMockChild, createMockContainer } from 'test-utils';
import { type Dependency } from '@elementor/editor-props';

import { getContainer } from '../../sync/get-container';
import { addModelToParent, removeModelFromParent } from '../../sync/resolve-element';
import { type V1ElementConfig, type V1ElementData } from '../../sync/types';
import { bindSettingsReconcile } from '../bind-settings-reconcile';
import { createChildrenStash } from '../stash';
import { type ChildDependencyRule } from '../types';

jest.mock( '../../sync/get-container' );
jest.mock( '../../sync/resolve-element', () => ( {
	...jest.requireActual( '../../sync/resolve-element' ),
	addModelToParent: jest.fn(),
	removeModelFromParent: jest.fn(),
} ) );

const mockGetContainer = jest.mocked( getContainer );
const mockAddModelToParent = jest.mocked( addModelToParent );
const mockRemoveModelFromParent = jest.mocked( removeModelFromParent );

const PAGINATION_ON: Dependency = {
	relation: 'or',
	terms: [ { operator: 'eq', path: [ 'pagination' ], value: true } ],
};

function createRule( overrides: Partial< ChildDependencyRule > = {} ): ChildDependencyRule {
	return {
		child_type: 'e-pagination',
		when: PAGINATION_ON,
		position: { kind: 'last', value: null },
		stash: true,
		default_model: null,
		...overrides,
	};
}

function createReactiveSettings( initial: Record< string, unknown > ) {
	let current = { ...initial };
	const listeners: Array< ( ...args: unknown[] ) => void > = [];

	return {
		toJSON: () => current,
		get: ( key: string ) => current[ key ],
		set: ( next: Record< string, unknown > ) => {
			current = { ...current, ...next };
			listeners.forEach( ( fn ) => fn() );
		},
		on: jest.fn( ( _event: string, callback: ( ...args: unknown[] ) => void ) => {
			listeners.push( callback );
		} ),
		off: jest.fn( ( _event: string, callback?: ( ...args: unknown[] ) => void ) => {
			if ( ! callback ) {
				return;
			}
			const index = listeners.indexOf( callback );
			if ( index >= 0 ) {
				listeners.splice( index, 1 );
			}
		} ),
	};
}

function createReactiveModel( id: string, settings: ReturnType< typeof createReactiveSettings > ) {
	return {
		get: ( key: string ) => {
			if ( 'settings' === key ) {
				return settings;
			}
			if ( 'id' === key ) {
				return id;
			}
			return undefined;
		},
	};
}

function createConfig( rules: ChildDependencyRule[] ): V1ElementConfig {
	return {
		title: 'Test',
		controls: {},
		children_dependencies: rules,
	};
}

describe( 'bindSettingsReconcile', () => {
	beforeEach( () => {
		sessionStorage.clear();
		mockGetContainer.mockReset();
		mockAddModelToParent.mockReset();
		mockRemoveModelFromParent.mockReset();
		mockAddModelToParent.mockReturnValue( true );
		mockRemoveModelFromParent.mockReturnValue( true );
	} );

	const paginationOff = { pagination: { $$type: 'boolean', value: false } };
	const paginationOn = { pagination: { $$type: 'boolean', value: true } };

	it( 'returns a no-op detach when the config has no rules', () => {
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );

		const detach = bindSettingsReconcile( {
			model,
			elementConfig: { title: 'Test', controls: {} },
		} );

		settings.set( paginationOn );

		expect( settings.on ).not.toHaveBeenCalled();
		expect( mockAddModelToParent ).not.toHaveBeenCalled();
		expect( () => detach() ).not.toThrow();
	} );

	it( 'attaches a stashed child when when() flips to met', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );
		const stashedData = { elType: 'e-pagination', id: 'stashed', settings: {} } as V1ElementData;
		createChildrenStash().save( 'parent-1', 'e-pagination', stashedData );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		// Act.
		settings.set( paginationOn );

		// Assert.
		expect( mockAddModelToParent ).toHaveBeenCalledWith( 'parent-1', stashedData, { at: 0 } );
		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
	} );

	it( 'attaches from default_model when nothing is stashed', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );
		const defaultModel = { elType: 'e-pagination', isLocked: true } as V1ElementData;

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule( { default_model: defaultModel } ) ] ),
		} );

		// Act.
		settings.set( paginationOn );

		// Assert.
		expect( mockAddModelToParent ).toHaveBeenCalledWith(
			'parent-1',
			expect.objectContaining( { elType: 'e-pagination', isLocked: true, id: expect.any( String ) } ),
			{ at: 0 }
		);
	} );

	it( 'generates a fresh id when default_model has none', () => {
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [
				createRule( { default_model: { elType: 'e-pagination' } as V1ElementData } ),
			] ),
		} );

		settings.set( paginationOn );

		const [ , attached ] = mockAddModelToParent.mock.calls[ 0 ] ?? [];
		expect( attached ).toEqual( expect.objectContaining( { elType: 'e-pagination', id: expect.any( String ) } ) );
		expect( ( attached as { id: string } ).id ).not.toBe( '' );
	} );

	it( 'detaches and stashes an existing child when when() flips to unmet', () => {
		// Arrange.
		const pagination = createMockChild( { id: 'pag-1', elType: 'e-pagination' } );
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [ pagination ] ) );

		const settings = createReactiveSettings( paginationOn );
		const model = createReactiveModel( 'parent-1', settings );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		// Act.
		settings.set( paginationOff );

		// Assert.
		expect( mockRemoveModelFromParent ).toHaveBeenCalledWith( 'parent-1', 'pag-1' );
		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toMatchObject( {
			elType: 'e-pagination',
			id: 'pag-1',
		} );
	} );

	it( 'skips stashing when rule.stash is false', () => {
		// Arrange.
		const pagination = createMockChild( { id: 'pag-1', elType: 'e-pagination' } );
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [ pagination ] ) );

		const settings = createReactiveSettings( paginationOn );
		const model = createReactiveModel( 'parent-1', settings );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule( { stash: false } ) ] ),
		} );

		// Act.
		settings.set( paginationOff );

		// Assert.
		expect( mockRemoveModelFromParent ).toHaveBeenCalledWith( 'parent-1', 'pag-1' );
		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
	} );

	it( 'does nothing when the relevant setting is unchanged', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOn );
		const model = createReactiveModel( 'parent-1', settings );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		// Act - unrelated change; pagination stays true.
		settings.set( { other: { $$type: 'string', value: 'noise' } } );

		// Assert.
		expect( mockAddModelToParent ).not.toHaveBeenCalled();
		expect( mockRemoveModelFromParent ).not.toHaveBeenCalled();
	} );

	it( 'dispatches elementor/navigator/refresh-children after attaching a child', () => {
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [
				createRule( { default_model: { elType: 'e-pagination' } as V1ElementData } ),
			] ),
		} );

		settings.set( paginationOn );

		const refreshEvents = dispatchSpy.mock.calls
			.map( ( args: unknown[] ) => args[ 0 ] as Event )
			.filter( ( event: Event ) => event.type === 'elementor/navigator/refresh-children' );

		expect( refreshEvents ).toHaveLength( 1 );
		expect( ( refreshEvents[ 0 ] as CustomEvent ).detail ).toEqual( { elementId: 'parent-1' } );

		dispatchSpy.mockRestore();
	} );

	it( 'dispatches elementor/navigator/refresh-children after detaching a child', () => {
		const pagination = createMockChild( { id: 'pag-1', elType: 'e-pagination' } );
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [ pagination ] ) );
		const settings = createReactiveSettings( paginationOn );
		const model = createReactiveModel( 'parent-1', settings );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		settings.set( paginationOff );

		const refreshEvents = dispatchSpy.mock.calls
			.map( ( args: unknown[] ) => args[ 0 ] as Event )
			.filter( ( event: Event ) => event.type === 'elementor/navigator/refresh-children' );

		expect( refreshEvents ).toHaveLength( 1 );
		expect( ( refreshEvents[ 0 ] as CustomEvent ).detail ).toEqual( { elementId: 'parent-1' } );

		dispatchSpy.mockRestore();
	} );

	it( 'preserves stashed data when addModelToParent fails', () => {
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		mockAddModelToParent.mockReturnValue( false );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );
		const stashedData = { elType: 'e-pagination', id: 'stashed', settings: {} } as V1ElementData;
		createChildrenStash().save( 'parent-1', 'e-pagination', stashedData );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		settings.set( paginationOn );

		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toEqual( stashedData );
		expect(
			dispatchSpy.mock.calls
				.map( ( args: unknown[] ) => args[ 0 ] as Event )
				.some( ( event: Event ) => event.type === 'elementor/navigator/refresh-children' )
		).toBe( false );

		dispatchSpy.mockRestore();
	} );

	it( 'does not stash or refresh when removeModelFromParent fails', () => {
		const pagination = createMockChild( { id: 'pag-1', elType: 'e-pagination' } );
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [ pagination ] ) );
		mockRemoveModelFromParent.mockReturnValue( false );
		const settings = createReactiveSettings( paginationOn );
		const model = createReactiveModel( 'parent-1', settings );
		const dispatchSpy = jest.spyOn( window, 'dispatchEvent' );

		bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		settings.set( paginationOff );

		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
		expect(
			dispatchSpy.mock.calls
				.map( ( args: unknown[] ) => args[ 0 ] as Event )
				.some( ( event: Event ) => event.type === 'elementor/navigator/refresh-children' )
		).toBe( false );

		dispatchSpy.mockRestore();
	} );

	it( 'clears the element stash when detach() is called', () => {
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );
		const stashedData = { elType: 'e-pagination', id: 'stashed', settings: {} } as V1ElementData;
		createChildrenStash().save( 'parent-1', 'e-pagination', stashedData );

		const detach = bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toEqual( stashedData );

		detach();

		expect( createChildrenStash().get( 'parent-1', 'e-pagination' ) ).toBeUndefined();
	} );

	it( 'detach() unsubscribes so subsequent changes are ignored', () => {
		// Arrange.
		mockGetContainer.mockReturnValue( createMockContainer( 'parent-1', [] ) );
		const settings = createReactiveSettings( paginationOff );
		const model = createReactiveModel( 'parent-1', settings );

		const detach = bindSettingsReconcile( {
			model,
			elementConfig: createConfig( [ createRule() ] ),
		} );

		// Act.
		detach();
		settings.set( paginationOn );

		// Assert.
		expect( mockAddModelToParent ).not.toHaveBeenCalled();
	} );
} );
