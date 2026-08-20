import { type Dependency } from '@elementor/editor-props';

import { type V1ElementConfig, type V1ElementData } from '../../sync/types';
import { reconcileInitialChildren } from '../reconcile-initial-children';
import { createChildrenStash } from '../stash';
import { type ChildDependencyRule } from '../types';

const PAGINATION_ON: Dependency = {
	relation: 'or',
	terms: [ { operator: 'eq', path: [ 'pagination' ], value: true } ],
};

describe( 'reconcileInitialChildren', () => {
	beforeEach( () => {
		sessionStorage.clear();
	} );

	it( 'is a no-op when the config has no children_dependencies', () => {
		// Arrange.
		const attributes = { elements: [ { elType: 'e-child' } ] as V1ElementData[] };

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: { title: 'Test', controls: {} },
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [ { elType: 'e-child' } ] );
	} );

	it( 'removes a stale child and stashes it when when() is unmet', () => {
		// Arrange.
		const paginationChild = { elType: 'e-pagination', id: 'pag-1' } as V1ElementData;
		const attributes = {
			elements: [ paginationChild ] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: false } },
		};
		const verifyStash = createChildrenStash();

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule() ] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [] );
		expect( verifyStash.get( 'parent', 'e-pagination' ) ).toEqual( paginationChild );
	} );

	it( 'does not stash when rule.stash is false', () => {
		// Arrange.
		const attributes = {
			elements: [ { elType: 'e-pagination' } ] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: false } },
		};
		const verifyStash = createChildrenStash();

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule( { stash: false } ) ] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [] );
		expect( verifyStash.get( 'parent', 'e-pagination' ) ).toBeUndefined();
	} );

	it( 'restores a stashed child when when() flips to met', () => {
		// Arrange.
		const stashed = { elType: 'e-pagination', id: 'stashed-1', settings: { style: 'dots' } } as V1ElementData;
		const attributes = {
			elements: [] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};
		const setupStash = createChildrenStash();
		setupStash.save( 'parent', 'e-pagination', stashed );

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule() ] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [ stashed ] );
		expect( createChildrenStash().get( 'parent', 'e-pagination' ) ).toBeUndefined();
	} );

	it( 'falls back to default_model when nothing is stashed', () => {
		// Arrange.
		const defaultModel = { elType: 'e-pagination', isLocked: true } as V1ElementData;
		const attributes = {
			elements: [] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule( { default_model: defaultModel } ) ] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [
			{ elType: 'e-pagination', isLocked: true, id: expect.any( String ) },
		] );
	} );

	it( 'assigns a generated id when default_model has none', () => {
		// Arrange.
		const attributes = {
			elements: [] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [
				createRule( { default_model: { elType: 'e-pagination' } as V1ElementData } ),
			] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements[ 0 ]?.id ).toEqual( expect.any( String ) );
		expect( attributes.elements[ 0 ]?.id ).not.toBe( '' );
	} );

	it( 'preserves an existing id on default_model rather than replacing it', () => {
		// Arrange.
		const attributes = {
			elements: [] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [
				createRule( { default_model: { elType: 'e-pagination', id: 'preset-id' } as V1ElementData } ),
			] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements[ 0 ]?.id ).toBe( 'preset-id' );
	} );

	it( 'strips skipDefaultChildren from an inserted default_model', () => {
		// Arrange.
		const defaultModel = {
			elType: 'e-pagination',
			skipDefaultChildren: true,
		} as V1ElementData;
		const attributes = {
			elements: [] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule( { default_model: defaultModel } ) ] ),
			attributes,
		} );

		// Assert.
		const inserted = attributes.elements[ 0 ] as V1ElementData & { skipDefaultChildren?: boolean };
		expect( inserted?.skipDefaultChildren ).toBeUndefined();
		expect( inserted?.elType ).toBe( 'e-pagination' );
		expect( inserted?.id ).toEqual( expect.any( String ) );
	} );

	it( 'falls back to a minimal { elType } (with generated id) when neither stash nor default_model exist', () => {
		// Arrange.
		const attributes = {
			elements: [] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule( { stash: false } ) ] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [ { elType: 'e-pagination', id: expect.any( String ) } ] );
	} );

	it( 'inserts at position kind "after_type"', () => {
		// Arrange.
		const layout = { elType: 'e-collection-loop-layout' } as V1ElementData;
		const other = { elType: 'e-other' } as V1ElementData;
		const attributes = {
			elements: [ layout, other ] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [
				createRule( {
					position: { kind: 'after_type', value: 'e-collection-loop-layout' },
				} ),
			] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [
			layout,
			{ elType: 'e-pagination', id: expect.any( String ) },
			other,
		] );
	} );

	it( 'is idempotent: does nothing when state already matches the rule', () => {
		// Arrange.
		const attributes = {
			elements: [ { elType: 'e-pagination' } ] as V1ElementData[],
			settings: { pagination: { $$type: 'boolean', value: true } },
		};
		const verifyStash = createChildrenStash();

		// Act.
		reconcileInitialChildren( {
			elementId: 'parent',
			elementConfig: createConfig( [ createRule() ] ),
			attributes,
		} );

		// Assert.
		expect( attributes.elements ).toEqual( [ { elType: 'e-pagination' } ] );
		expect( verifyStash.get( 'parent', 'e-pagination' ) ).toBeUndefined();
	} );
} );

function createConfig( rules: ChildDependencyRule[] ): V1ElementConfig {
	return {
		title: 'Test',
		controls: {},
		children_dependencies: rules,
	};
}

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
