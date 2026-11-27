import { mockLegacyElementor } from 'test-utils';

import { createNestedTemplatedElementView } from '../create-nested-templated-element-type';
import { type ElementView, type LegacyWindow } from '../types';

const MOCK_ELEMENT_TYPE = 'test-nested-element';

const createMockRenderer = () => ( {
	register: jest.fn(),
	render: jest.fn( () => Promise.resolve( '<div></div>' ) ),
} );

const createMockElementConfig = () => ( {
	twig_templates: {},
	twig_main_template: 'main',
	atomic_props_schema: {},
	base_styles_dictionary: {},
	default_html_tag: 'div',
	html_tag_follows_link: true,
	support_nesting: true,
} );

describe( 'createNestedTemplatedElementView', () => {
	beforeEach( () => {
		mockLegacyElementor();

		class BaseView {
			static extend( proto: Record< string, unknown > ) {
				return class extends BaseView {
					constructor() {
						super();
						Object.assign( this, proto );
					}
				};
			}

			getContextMenuGroups() {
				return [];
			}
		}

		( window as unknown as LegacyWindow ).elementor.modules.elements.views.createAtomicElementBase = () =>
			BaseView as never;
	} );

	const createRenderableView = ( ViewClass: ReturnType< typeof createNestedTemplatedElementView > ) => {
		const view = new ViewClass() as unknown as ElementView & {
			_abortController: AbortController;
			_attachTwigContent: jest.Mock;
		};

		view.model = {
			cid: 'c1',
			get: ( key: string ) => {
				if ( key === 'id' ) {
					return 'test-id';
				}

				if ( key === 'settings' ) {
					return { toJSON: () => ( {} ) };
				}

				return undefined;
			},
		} as unknown as ElementView[ 'model' ];
		view.isRendered = false;
		view._abortController = new AbortController();
		view.triggerMethod = jest.fn();
		view.bindUIElements = jest.fn();
		view._attachTwigContent = jest.fn();

		return view;
	};

	it( 'should merge the element template_context into the twig render context without overriding core keys', async () => {
		// Arrange.
		const utils = createMockRenderer();
		const ViewClass = createNestedTemplatedElementView( {
			type: MOCK_ELEMENT_TYPE,
			renderer: utils,
			element: {
				...createMockElementConfig(),
				template_context: {
					collapse_breakpoints: { laptop: 'tablet' },
					id: 'should-not-override',
				},
			},
		} );

		const view = createRenderableView( ViewClass );

		// Act.
		await view._renderTemplate();

		// Assert.
		expect( utils.render ).toHaveBeenCalledWith(
			'main',
			expect.objectContaining( {
				id: 'test-id',
				collapse_breakpoints: { laptop: 'tablet' },
			} )
		);
	} );
} );
