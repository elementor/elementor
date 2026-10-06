import Component from 'elementor-document/component.js';
import { cloneElementTree } from 'elementor/packages/packages/libs/editor-elements/src/sync/clone-element-tree';

jest.mock( 'elementor/packages/packages/libs/editor-elements/src/sync/clone-element-tree', () => ( {
	cloneElementTree: jest.fn(),
} ) );

jest.mock( 'elementor-api/modules/component-base', () => class ComponentBase {
	importHooks( hooks ) {
		return hooks;
	}

	importUiStates( uiStates ) {
		return uiStates;
	}

	registerAPI() {}
} );

jest.mock( 'elementor-document/index.js', () => ( {} ) );
jest.mock( 'elementor-document/hooks/index.js', () => ( {} ) );
jest.mock( 'elementor-document/ui-states/index.js', () => ( {} ) );

describe( 'document Component utils', () => {
	let component;
	let elementsCollection;
	let parentModel;

	beforeEach( () => {
		component = new Component();
		component.utils = component.defaultUtils();

		elementsCollection = {
			add: jest.fn(),
		};

		parentModel = {
			get: jest.fn().mockReturnValue( elementsCollection ),
		};

		component.utils.findModelById = jest.fn().mockReturnValue( parentModel );
		cloneElementTree.mockReset();
	} );

	it( 'clones the element tree before fallback insertion when clone is true', () => {
		// Arrange.
		const childData = { id: 'original-id', elType: 'widget', settings: {}, elements: [] };
		const clonedChildData = { id: 'cloned-id', elType: 'widget', settings: {}, elements: [] };
		cloneElementTree.mockReturnValue( clonedChildData );

		// Act.
		component.utils.addModelToParent( 'parent-id', childData, { at: 2, clone: true } );

		// Assert.
		expect( cloneElementTree ).toHaveBeenCalledWith( childData );
		expect( elementsCollection.add ).toHaveBeenCalledWith( clonedChildData, {
			at: 2,
			silent: true,
		} );
	} );

	it( 'preserves the provided element data when clone is false', () => {
		// Arrange.
		const childData = { id: 'original-id', elType: 'widget', settings: {}, elements: [] };

		// Act.
		component.utils.addModelToParent( 'parent-id', childData, { at: 1, clone: false } );

		// Assert.
		expect( cloneElementTree ).not.toHaveBeenCalled();
		expect( elementsCollection.add ).toHaveBeenCalledWith( childData, {
			at: 1,
			silent: true,
		} );
	} );
} );
