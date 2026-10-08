import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';

type PlayerOptions = { videoId: string, host?: string, events?: { onReady?: () => void } };

type CapturedPlayerOptions = { videoId: string, host: string | null };

test.describe( 'Lightbox slideshow video @lightbox', () => {
	test( 'Lightbox slideshow plays youtube-nocookie.com video URLs', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		const pageErrors: string[] = [];

		page.on( 'pageerror', ( error ) => pageErrors.push( error.message ) );

		// Stub the YouTube API before the frontend loads, so the test stays offline and deterministic.
		await page.addInitScript( () => {
			const w = window as unknown as {
				__ytPlayerOptions: CapturedPlayerOptions[];
				YT: {
					loaded: number,
					PlayerState: Record<string, number>,
					Player: new ( element: unknown, options: PlayerOptions ) => void,
				};
			};

			w.__ytPlayerOptions = [];

			w.YT = {
				loaded: 1,
				PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
				Player: class {
					constructor( _element: unknown, options: PlayerOptions ) {
						w.__ytPlayerOptions.push( { videoId: options.videoId, host: options.host ?? null } );

						// OnReady runs after the constructor returns, mirroring the real API timing.
						if ( options.events?.onReady ) {
							queueMicrotask( () => options.events?.onReady() );
						}
					}

					playVideo() { /* Intentionally empty: the stub does not simulate playback. */ }

					destroy() { /* Intentionally empty: the stub owns nothing to release. */ }
				},
			};
		} );

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		// Act.
		await editor.addWidget( { widgetType: 'html' } );
		await editor.setTextareaControlValue( 'type-code',
			'<a href="https://example.com/gallery-image.jpg" data-elementor-open-lightbox="yes" data-elementor-lightbox-slideshow="nocookie-test" data-elementor-lightbox-video="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ">Play video</a>',
		);

		await editor.publishAndViewPage();

		const getPlayers = () => page.evaluate( () => ( window as unknown as { __ytPlayerOptions: CapturedPlayerOptions[] } ).__ytPlayerOptions );

		// Reset before touching the frontend, to only catch errors caused by the lightbox.
		pageErrors.length = 0;

		await page.locator( 'a[data-elementor-lightbox-slideshow="nocookie-test"]' ).click();

		// Assert.
		const lightbox = page.locator( EditorSelectors.video.lightBoxDialog );

		await expect( lightbox ).toBeVisible();
		await expect( lightbox.locator( '.elementor-video-container' ) ).toBeVisible();

		await expect.poll( getPlayers ).toEqual( [ { videoId: 'dQw4w9WgXcQ', host: 'https://www.youtube-nocookie.com' } ] );

		expect( pageErrors ).toEqual( [] );
	} );
} );
