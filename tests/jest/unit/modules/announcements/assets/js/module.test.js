describe( 'modules/announcements/assets/js/index.js', () => {
	beforeAll( () => {
		document.body.innerHTML = '<div id="e-announcements-root"></div>';

		global.elementorAnnouncementsConfig = {
			announcements: [ {
				title: 'Title of the announcement',
				description: 'Description of the announcement',
				media: {
					type: 'image',
					src: '',
				},
				cta: [ {
					label: 'Main CTA',
					variant: 'primary',
					target: '_blank',
					url: 'https://test-url.com',
				} ],
			} ],
		};
	} );

	afterAll( () => {
		delete global.elementorAnnouncementsConfig;
	} );

	test( 'Should render react app', async () => {
		// Act.
		await import( 'elementor/modules/announcements/assets/js/index' );

		// Assert.
		expect( document.querySelectorAll( 'div.announcement-body-image' ).length ).toEqual( 1 );
		expect( document.querySelectorAll( 'div.announcement-body-title' ).length ).toEqual( 1 );
		expect( document.querySelectorAll( 'div.announcement-body-description' ).length ).toEqual( 1 );
		expect( document.querySelectorAll( 'div.announcement-footer-container' ).length ).toEqual( 1 );
		expect( document.querySelectorAll( 'div.announcement-footer-container a.button-item' ).length ).toEqual( 1 );
	} );
} );
