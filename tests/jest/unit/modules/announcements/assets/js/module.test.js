import { freeMock, setupMock } from 'elementor/tests/jest/unit/modules/web-cli/assets/js/core/mock/api';

describe( 'modules/announcements/assets/js/index.js', () => {
	beforeAll( async () => {
		await setupMock();
		global.$e.modules.editor = {
			CommandContainerBase: ( await import( 'elementor-editor/command-bases/command-container-base' ) ).default,
		};

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
		delete global.$e;

		freeMock();
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
