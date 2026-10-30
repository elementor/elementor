import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';

type PlayerOptions = { videoId: string, host?: string, playerVars?: { origin?: string }, events?: { onReady?: () => void } };

type CapturedPlayerOptions = { videoId: string, host: string | null, origin: string | null };

const videoCases = [
	{ name: 'youtube-nocookie.com', url: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ', expectedHost: 'https://www.youtube-nocookie.com' },
	{ name: 'youtube.com', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', expectedHost: null },
];

test.describe( 'Lightbox slideshow video @lightbox', () => {
	for ( const { name, url, expectedHost } of videoCases ) {
		test( `Lightbox slideshow plays ${ name } video URLs`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const pageErrors: string[] = [];

			page.on( 'pageerror', ( error ) => pageErrors.push( error.message ) );

			// The lightbox injects the real YouTube API script on click, and it would replace the stubbed `YT`.
			await page.route( /youtube\.com\/(iframe_api|s\/player)/, ( route ) => route.fulfill( { status: 200, contentType: 'application/javascript', body: '' } ) );

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
							w.__ytPlayerOptions.push( {
								videoId: options.videoId,
								host: options.host ?? null,
								origin: options.playerVars?.origin ?? null,
							} );

							const onReady = options.events?.onReady;

							// OnReady runs after the constructor returns, mirroring the real API timing.
							if ( onReady ) {
								queueMicrotask( () => onReady() );
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
				`<a href="https://example.com/gallery-image.jpg" data-elementor-open-lightbox="yes" data-elementor-lightbox-slideshow="video-test" data-elementor-lightbox-video="${ url }">Play video</a>`,
			);

			await editor.publishAndViewPage();

			const getPlayers = () => page.evaluate( () => ( window as unknown as { __ytPlayerOptions: CapturedPlayerOptions[] } ).__ytPlayerOptions );

			// Reset before touching the frontend, to only catch errors caused by the lightbox.
			pageErrors.length = 0;

			await page.locator( 'a[data-elementor-lightbox-slideshow="video-test"]' ).click();

			// Assert.
			const lightbox = page.locator( EditorSelectors.video.lightBoxDialog );

			await expect( lightbox ).toBeVisible();
			await expect( lightbox.locator( '.elementor-video-container' ) ).toBeVisible();

			// The origin is only set together with the custom host, and it is the full origin, not just the hostname.
			const expectedOrigin = expectedHost ? new URL( page.url() ).origin : null;

			await expect.poll( getPlayers ).toEqual( [ { videoId: 'dQw4w9WgXcQ', host: expectedHost, origin: expectedOrigin } ] );

			expect( pageErrors ).toEqual( [] );
		} );
	}
} );
