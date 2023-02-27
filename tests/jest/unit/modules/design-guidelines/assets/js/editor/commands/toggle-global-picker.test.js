describe( `$e.commands.run( 'design-guidelines/toggle-global-picker' )`, () => {
	let ToggleGlobalPickerCommand;

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
		}

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

		ToggleGlobalPickerCommand = ( await import( 'elementor/modules/design-guidelines/assets/js/editor/commands/toggle-global-picker' ) ).default;
	} );

	afterEach( () => {
		delete global.$e;
		delete global.elementor;

		jest.resetAllMocks();
	} );

	it( 'should call mock onclick for picker button when command is correct and throw error if not', () => {
		// Arrange.
		const command = new ToggleGlobalPickerCommand();

		// Act & Assert.
		expect(
			() => command.apply( {
				name: 'colors',
				type: 'custom', // Document does not have custom colors.
				id: 'primary',
			} )
		).toThrow( TypeError );

		// Act.
		command.apply( {
			name: 'colors',
			type: 'system', // Document has system colors.
			id: 'primary',
		} );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 1 );

		// Act.
		command.apply( {
			name: 'colors',
			type: 'system',
			id: 'secondary',
		} );

		// Assert.
		expect( mockCallBack ).toHaveBeenCalledTimes( 2 );
	} );
} );
