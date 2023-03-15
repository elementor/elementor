describe( `$e.commands.run( 'controls/toggle-control' )`, () => {
	let ToggleControlCommand;

	jest.mock( 'elementor-controls/base-data', () => {} );

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
		global.$e = {
			internal: jest.fn(),
			modules: {
				CommandBase: class {},
			},
		};

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
											toggle: () => {
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

		ToggleControlCommand = ( await import( 'elementor/assets/dev/js/editor/controls/commands/toggle-control' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should call mock onclick for picker button when command is correct and throw error if not', () => {
		// Arrange.
		const command = new ToggleControlCommand();

		// Act & Assert.
		expect(
			() => command.apply( {
				controlPath: 'custom_colors/primary/color', // Document does not have custom colors.
			} ),
		).toThrow( TypeError );

		// Act.
		command.apply( {
			controlPath: 'system_colors/primary/color', // Document has system colors.
		} );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 1 );

		// Act.
		command.apply( {
			controlPath: 'system_colors/secondary/color',
		} );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 2 );
	} );
} );
