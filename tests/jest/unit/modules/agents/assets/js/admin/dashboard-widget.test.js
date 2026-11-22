describe( 'dashboard-widget', () => {
	let dispatchEvent;

	beforeAll( () => {
		dispatchEvent = jest.fn();
		window.elementorCommon = { eventsManager: { dispatchEvent } };

		require( 'elementor/modules/agents/assets/js/admin/dashboard-widget' );
	} );

	beforeEach( () => {
		dispatchEvent.mockClear();
		document.body.innerHTML = '<a id="cta" data-agent-ready-cta="strong"><span id="label">View report</span></a><a id="other">Other</a>';
	} );

	afterAll( () => {
		delete window.elementorCommon;
	} );

	it( 'should track the state when the cta is clicked through a child element', () => {
		// Act
		document.getElementById( 'label' ).click();

		// Assert
		expect( dispatchEvent ).toHaveBeenCalledWith(
			'agent_readiness_dashboard_cta_clicked',
			expect.objectContaining( { interaction_result: 'strong' } ),
			expect.anything(),
		);
	} );

	it( 'should ignore clicks outside the cta', () => {
		// Act
		document.getElementById( 'other' ).click();

		// Assert
		expect( dispatchEvent ).not.toHaveBeenCalled();
	} );
} );
