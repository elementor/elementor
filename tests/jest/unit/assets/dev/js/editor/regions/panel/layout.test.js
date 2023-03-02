import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

describe( `assets/dev/js/editor/regions/panel/layout.js`, () => {
	window.document.body.innerHTML = `
		<div class="elementor-control elementor-control-system_colors">
			<div class="elementor-repeater-row-controls">
				<div class="elementor elementor-control elementor-control-_id">
					<div class="elementor-control-content">
						<input type="hidden" data-setting="_id" value="primary">
					</div>
				</div>
				<div class="elementor elementor-control elementor-control-_id">
					<div class="elementor-control-content">
						<input type="hidden" data-setting="_id" value="secondary">
					</div>
				</div>
				<div class="pickr">
					<button class="pcr-button"></button>
				</div>
			</div>
		</div>
	`;
	const mockCallBack = jest.fn();
	document.querySelector( 'div.pickr button.pcr-button' ).addEventListener( 'click', mockCallBack );

	beforeEach( async () => {
		await setupMock();

		jest.mock( 'elementor-document/hooks', () => {} );

		const jqueryMock = class {
			constructor( element ) {
				this.element = element;
			}

			find( selector ) {
				return new jqueryMock( this.element.querySelector( selector ) );
			}

			closest( selector ) {
				return new jqueryMock( this.element.closest( selector ) );
			}

			trigger( event ) {
				this.element.dispatchEvent( new Event( event ) );
			}
		};

		global.elementor = {
			getPanelView: () => {
				return {
					getCurrentPageView: () => {
						return {
							content: {
								currentView: {
									getControlViewByName: ( name ) => {
										return {
											$el: new jqueryMock( document.querySelector( `.elementor-control-${ name }` ) ),
										};
									},
								},
							},
						};
					},
				};
			},
		};

		global.Marionette = {
			LayoutView: {
				extend: ( obj ) => obj,
			},
			ItemView: {
				extend: ( obj ) => obj,
			},
		};
		const layout = require( 'elementor-panel/layout' );

		$e.components.register( new class extends $e.modules.ComponentBase {
			getNamespace() {
				return 'panel';
			}

			defaultRoutes() {
				return {
					'design-system-picker/show': ( args ) => layout.toggleDesignSystemPicker( args ),
					'design-system-picker/hide': ( args ) => layout.toggleDesignSystemPicker( args ),
				};
			}
		} );
	} );

	afterEach( () => {
		freeMock();
		jest.resetAllMocks();
	} );

	it( 'should call mock onclick for picker button when route is correct and throw error if not', () => {
		// Arrange.
		const route = 'panel/design-system-picker/show';

		// Act & Assert.
		expect(
			() => $e.route( route, {
				name: 'colors',
				type: 'custom', // Document does not have custom colors.
				id: 'primary',
			} ),
		).toThrow( TypeError );

		// Act.
		$e.route( route, {
			name: 'colors',
			type: 'system', // Document has system colors.
			id: 'primary',
		} );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 1 );

		// Act.
		$e.route( route, {
			name: 'colors',
			type: 'system',
			id: 'secondary',
		} );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 2 );
	} );
} );
