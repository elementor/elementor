describe( 'GridOutline', () => {
	let GridOutline;
	const getElementSettings = jest.fn();
	beforeEach( async () => {
		jest.resetModules();

		global.elementorModules = {
			frontend: {
				handlers: {
					Base: class {
						getElementSettings() {
							return getElementSettings();
						}
					},
				},
			},
		};

		GridOutline = await import( 'elementor/assets/dev/js/frontend/handlers/container/grid-outline' );

		it( 'should return the grid dimensions', () => {
			const gridOutline = new GridOutline();
			getElementSettings.mockReturnValue( 12 );
			expect( gridOutline.getGridDimensions() ).toBe( 12 );
		} );
	} );
} );
