import { createNestedTemplatedElementView } from '../create-nested-templated-element-type';
import { type LegacyWindow } from '../types';

type CapturedPrototype = {
	_renderChildren: () => Promise< void >;
	_removeChildrenPlaceholder: () => void;
	_domUpdateWasSkipped: boolean;
	children?: { each: ( cb: ( child: unknown ) => void ) => void };
	$el: { get: ( idx: number ) => Element | null };
};

const setupNestedView = () => {
	const parentRenderChildren = jest.fn();
	let capturedPrototype: CapturedPrototype | null = null;

	const AtomicElementBaseView = {
		prototype: {
			_renderChildren: parentRenderChildren,
			_openEditingPanel: jest.fn(),
			addElement: jest.fn(),
		},
		extend: ( prototype: CapturedPrototype ) => {
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

	return {
		prototype: capturedPrototype as unknown as CapturedPrototype,
		parentRenderChildren,
	};
};

describe( 'nested templated element view _renderChildren', () => {
	it( 'should call the parent _renderChildren when the DOM update was not skipped', async () => {
		// Arrange.
		const { prototype, parentRenderChildren } = setupNestedView();

		prototype._domUpdateWasSkipped = false;
		prototype.$el = { get: () => null };

		// Act.
		await prototype._renderChildren.call( prototype );

		// Assert.
		expect( parentRenderChildren ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should skip the parent _renderChildren when the DOM update was skipped', async () => {
		// Arrange.
		const { prototype, parentRenderChildren } = setupNestedView();

		prototype._domUpdateWasSkipped = true;
		prototype.$el = { get: () => null };

		// Act.
		await prototype._renderChildren.call( prototype );

		// Assert.
		expect( parentRenderChildren ).not.toHaveBeenCalled();
	} );
} );
