import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

/**
 * @typedef {import('elementor/assets/dev/js/editor/container/container')} Container
 */

describe( 'set-direction-mode--document/elements/settings', () => {
	beforeEach( async () => {
		await setupMock();

		// Polyfill `replaceAll()` since it's not available in Node 14.
		String.prototype.replaceAll = function( search, replace ) {
			return this.replace( new RegExp( search, 'g' ), replace );
		};

		document.body.dispatchEvent = () => {};

		global.elementor = {
			$previewContents: [ document ],
		};

		const { SetDirectionMode } = await import( 'elementor-document/hooks/ui/settings/set-direction-mode' );
		const { DirectionMode } = await import( 'elementor-document/ui-states/direction-mode' );

		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'document';
			}

			defaultHooks() {
				return this.importHooks( {
					SetDirectionMode,
				} );
			}

			defaultUiStates() {
				return this.importUiStates( {
					DirectionMode,
				} );
			}
		} );

		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'panel';
			}

			defaultRoutes() {
				return {
					'editor/advanced': () => {},
				};
			}
		} );
	} );

	afterEach( async () => {
		await freeMock();
	} );

	it( 'Should not set direction for containers that don\'t support UI states', async () => {
		// Arrange.
		const container = createContainer();

		// Act.
		$e.hooks.runUIAfter( 'document/elements/settings', { container } );

		// Assert.
		expect( $e.uiStates.getCurrent( 'document/direction-mode' ) ).toBeFalsy();
	} );

	it( 'Should set direction for containers that support UI states', async () => {
		// Arrange.
		const container = createContainer( {
			renderer: {
				view: {
					getCurrentUiStates: () => ( {
						directionMode: 'column',
					} ),
				},
			},
		} );

		// Act.
		$e.hooks.runUIAfter( 'document/elements/settings', { container } );

		// Assert.
		expect( $e.uiStates.getCurrent( 'document/direction-mode' ) ).toBe( 'column' );
	} );

	it( 'Should use parent direction when editing the advanced settings', async () => {
		// Arrange.
		const child = createContainer( {
			renderer: {
				view: {
					getCurrentUiStates: () => {},
				},
			},
		} );

		createContainer( {
			renderer: {
				view: {
					getCurrentUiStates: () => ( {
						directionMode: 'row',
					} ),
				},
			},
			children: [ child ],
		} );

		$e.route( 'panel/editor/advanced' );

		// Act.
		$e.hooks.runUIAfter( 'document/elements/settings', { container: child } );

		// Assert.
		expect( $e.uiStates.getCurrent( 'document/direction-mode' ) ).toBe( 'row' );
	} );

	it( 'Should remove the direction mode UI state when the container doesn\'t support it', async () => {
		// Arrange.
		const container = createContainer( {
			renderer: {
				view: {
					getCurrentUiStates: () => ( {} ),
				},
			},
		} );

		$e.uiStates.set( 'document/direction-mode', 'row' );

		// Act.
		$e.hooks.runUIAfter( 'document/elements/settings', { container } );

		// Assert.
		expect( $e.uiStates.getCurrent( 'document/direction-mode' ) ).toBeFalsy();
	} );

	it( 'Should work with multiple containers', async () => {
		// Arrange.
		const container1 = createContainer( {
			renderer: {
				view: {
					getCurrentUiStates: () => ( {
						directionMode: 'column',
					} ),
				},
			},
		} );

		const container2 = createContainer( {
			renderer: {
				view: {
					getCurrentUiStates: () => ( {
						directionMode: 'row',
					} ),
				},
			},
		} );

		// Act.
		$e.hooks.runUIAfter( 'document/elements/settings', { containers: [ container1, container2 ] } );

		// Assert.
		expect( $e.uiStates.getCurrent( 'document/direction-mode' ) ).toBe( 'row' );
	} );
} );

/**
 * Mock Container.
 * TODO: Move to testing utils.
 *
 * @param {{}}      el
 * @param {string}  el.type
 * @param {string}  el.widgetType
 * @param {string}  el.id
 * @param {{}}      el.settings
 * @param {{}}      el.children
 * @param {{}}      el.parent
 * @param {number}  el.index
 * @param {boolean} el.isInner
 * @return {Container} The new created container
 */
function createContainer( {
	type,
	widgetType,
	id,
	settings = {},
	children = [],
	parent = null,
	index = 0,
	isInner = false,
	...args
} = {} ) {
	const container = {
		id,
		type,
		view: { _index: index },
		settings: {
			toJSON: () => ( {
				...settings,
			} ),
		},
		children,
		model: {
			get: ( key ) => {
				const map = {
					elType: type,
					widgetType,
				};

				return map[ key ];
			},
			toJSON: () => ( {
				elType: type,
				isInner,
			} ),
		},
		...args,
	};

	// Attach the current Container as a parent of its children Containers.
	children.forEach( ( child, i ) => {
		child.parent = container;
		child.view._index = i;
	} );

	// Attach the current Container as a child of its parent Container.
	if ( parent ) {
		if ( ! parent.children ) {
			parent.children = [];
		}

		parent.children.push( container );
		container.view._index = parent.children.length - 1;
	}

	return container;
}
