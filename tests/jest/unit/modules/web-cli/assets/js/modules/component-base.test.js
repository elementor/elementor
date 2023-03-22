jest.mock( 'elementor/assets/dev/js/modules/imports/module.js', () => {
	return class Module {
		constructor( config ) {
		}
	}
} );

import ComponentBase from 'elementor-api/modules/component-base';

describe( 'ComponentBase', () => {
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

	beforeAll( async () => {

		global.elementor = {
			getPanelView: () => ( {
				getCurrentPageView: () => ( {
					content: {
						currentView: {
							getControlViewByName: ( name ) => {
								if ( ! document.querySelector( `div.elementor-control-${ name }` ) ) {
									throw new TypeError( 'Document does not have control' );
								}

								return {
									getChildControlView: () => ( {
										getChildControlView: () => ( {
											activate: () => {
												document.querySelector( 'div.pickr button.pcr-button' ).click();
											},
										} ),
									} ),
								};
							},
						},
					},
				} ),
			} ),
		};

	} );

	afterAll( () => {
		delete global.elementor;

		jest.resetAllMocks();
	} );

	test( 'activateControl - should call mock onclick (activate) for picker button when controlPath is correct and throw error if not', () => {
		const component = new ComponentBase();
		let controlPath = 'custom_colors/primary/color';

		// Act & Assert.
		expect(
			() => component.activateControl( controlPath ) // Document does not have custom colors.
		).toThrow( TypeError );

		// Act.
		controlPath = 'system_colors/primary/color'; // Document has system colors.
		component.activateControl( controlPath );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 1 );

		// Act.
		controlPath = 'system_colors/secondary/color'; // Document has system colors.
		component.activateControl( controlPath );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 2 );
	} );
} );
