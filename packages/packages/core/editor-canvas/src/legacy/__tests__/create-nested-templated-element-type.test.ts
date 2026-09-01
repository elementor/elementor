import { ELEMENT_STYLE_CHANGE_EVENT } from '@elementor/editor-elements';

import { createNestedTemplatedElementView } from '../create-nested-templated-element-type';
import { type ElementModel, type LegacyWindow } from '../types';

type ViewPrototype = {
	_lastRenderedStyles: ElementModel[ 'styles' ];
	_notifyStylesChanged: () => void;
	model: { get: ( key: 'styles' ) => ElementModel[ 'styles' ] };
};

const createViewPrototype = (): ViewPrototype => {
	let capturedPrototype: ViewPrototype | null = null;

	const AtomicElementBaseView = {
		prototype: {
			_renderChildren: jest.fn(),
			_openEditingPanel: jest.fn(),
			addElement: jest.fn(),
		},
		extend: ( prototype: ViewPrototype ) => {
			capturedPrototype = prototype;

			return prototype;
		},
	};

	( window as unknown as LegacyWindow ).elementor = {
		modules: {
			elements: {
				views: {
					createAtomicElementBase: () => AtomicElementBaseView,
				},
			},
		},
	} as unknown as LegacyWindow[ 'elementor' ];

	createNestedTemplatedElementView( {
		type: 'e-div-block',
		renderer: { register: jest.fn(), render: jest.fn() } as never,
		element: {
			twig_templates: {},
			twig_main_template: 'main',
			atomic_props_schema: {},
			base_styles_dictionary: {},
			support_nesting: true,
		},
	} );

	return capturedPrototype as unknown as ViewPrototype;
};

describe( 'nested templated element view style notifications', () => {
	it( 'should notify when the element styles changed since the last render', () => {
		// Arrange.
		const styles = { 'style-1': { id: 'style-1', label: 'local', type: 'class', variants: [] } };
		const view = createViewPrototype();
		const listener = jest.fn();

		view._lastRenderedStyles = undefined;
		view.model = { get: () => styles as ElementModel[ 'styles' ] };

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, listener );

		// Act.
		view._notifyStylesChanged();

		// Assert.
		expect( listener ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not notify when the element styles are unchanged', () => {
		// Arrange.
		const styles = { 'style-1': { id: 'style-1', label: 'local', type: 'class', variants: [] } };
		const view = createViewPrototype();
		const listener = jest.fn();

		view._lastRenderedStyles = undefined;
		view.model = { get: () => styles as ElementModel[ 'styles' ] };

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, listener );

		// Act.
		view._notifyStylesChanged();
		view._notifyStylesChanged();
		view._notifyStylesChanged();

		// Assert.
		expect( listener ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should dispatch one style event when many renders leave styles unchanged', () => {
		// Arrange.
		const styles = { 'style-1': { id: 'style-1', label: 'local', type: 'class', variants: [] } };
		const view = createViewPrototype();
		const listener = jest.fn();
		const subtreeSize = 100;

		view._lastRenderedStyles = undefined;
		view.model = { get: () => styles as ElementModel[ 'styles' ] };

		window.addEventListener( ELEMENT_STYLE_CHANGE_EVENT, listener );

		// Act - simulates a parent re-render cascading through a large subtree.
		for ( let index = 0; index < subtreeSize; index++ ) {
			view._notifyStylesChanged();
		}

		// Assert.
		expect( listener ).toHaveBeenCalledTimes( 1 );
	} );
} );
