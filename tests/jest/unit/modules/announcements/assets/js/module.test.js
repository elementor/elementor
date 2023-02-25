describe( 'modules/announcements/assets/js/index.js', () => {
	let announcement;

	beforeAll( () => {
		document.body.innerHTML = '<div id="e-announcements-root"></div>';

		global.elementorAnnouncementsConfig = {
			announcements: {
				title: 'Title of the announcement',
				description: 'Description of the announcement',
				media: {
					type: 'image',
					src: '',
				},
				cta: {
					label: 'Main CTA',
					variant: 'primary',
					target: '_blank',
					url: 'https://test-url.com',
				},
			},
		};
	} );

	afterAll( () => {
		delete global.elementorAnnouncementsConfig;
	} );

	test( 'Should render react app', async () => {
		// Act.
		announcement = await import( 'elementor/modules/announcements/assets/js/index' );

		// Assert.
		const announcementTitle = document.querySelectorAll( 'div.announcement-body-title' );
		const announcementDescription = document.querySelectorAll( 'div.announcement-body-description' );
		const announcementFooter = document.querySelectorAll( 'div.announcement-footer-container' );

		expect( document.querySelectorAll( 'div.announcement-body-image' ).length ).toEqual( 1 );
		expect( announcementTitle.length ).toEqual( 1 );
		expect( announcementTitle.text().contains( 'Title of the announcement' ) ).toBe( true );
		expect( announcementDescription.length ).toEqual( 1 );
		expect( announcementDescription.text().contains( 'Description of the announcement' ) ).toBe( true );
		expect( announcementFooter.length ).toEqual( 1 );
		expect( announcementFooter.querySelectorAll( '.button-item' ).length ).toEqual( 1 );
	} );
} );
