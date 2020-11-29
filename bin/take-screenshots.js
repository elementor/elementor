/* global require */

function autoScroll( page ) {
	return page.evaluate( () => {
		return new Promise( ( resolve, reject ) => {
			let totalHeight = 0;
			const distance = 100,
				timer = setInterval( () => {
					const scrollHeight = document.body.scrollHeight;
					window.scrollBy( 0, distance );
					totalHeight += distance;

					if ( totalHeight >= scrollHeight ) {
						clearInterval( timer );
						resolve();
					}
				}, 100 );
		} );
	} );
}

function normalize( page ) {
	return page.evaluate( () => {
		return new Promise( ( resolve, reject ) => {
			const addOverlay = ( selector, title ) => {
				jQuery( selector ).each( ( index, el ) => {
					const $el = jQuery( el );
					$el.before( '<div style="' +
						'position: absolute;' +
						'width: ' + $el.width() + 'px;' +
						'height: ' + $el.height() + 'px;' +
						'background: #e0d5d5;' +
						'z-index: 1;' +
						'"><span style="' +
						'position: absolute;' +
						'top: 50%;' +
						'left: 50%;' +
						'transform: translate(-50%);' +
						'">' + title + '</span></div>' );
				} );
			};

			addOverlay( '.elementor-video-iframe', 'Video' );
			addOverlay( '.elementor-widget-google_maps', 'Google Map' );
			addOverlay( '.elementor-widget-image-carousel', 'Image Carousel' );
			addOverlay( '.elementor-soundcloud-wrapper', 'Soundcloud' );

			jQuery( '.elementor-slick-slider' ).hide( 0 );

			jQuery( '.elementor-counter-number' ).each( ( index, el ) => {
				el.dataset.duration = 0;
				jQuery( el ).html( el.dataset.toValue );
			} );

			jQuery( '.elementor-countdown-seconds' ).html( '59' );
			jQuery( '.elementor-background-video-container' ).remove();
			resolve();
		} );
	} );
}

const puppeteer = require( 'puppeteer' ),
	argv = require( 'minimist' )( process.argv.slice( 2 ) );

( async () => {
	const browser = await puppeteer.launch();

	const page = await browser.newPage();

	page.on( 'console', ( msg ) => {
		for ( let i = 0; i < msg.args.length; ++i ) {
			console.log( `${ i }: ${ msg.args[ i ] }` );
		}
	} );

	if ( 'mobile' === argv.device ) {
		await page.setViewport( {
			width: 767,
			height: 575,
			isMobile: true,
			hasTouch: true,
		} );
	} else if ( 'tablet' === argv.device ) {
		await page.setViewport( {
			width: 1024,
			height: 768,
			isMobile: true,
			hasTouch: true,
		} );
	} else {
		await page.setViewport( {
			width: 1366,
			height: 768,
		} );
	}

	await page.goto( argv.url );

	// Remove animations
	await page.evaluate( 'document.body.innerHTML = document.body.innerHTML' );

	await normalize( page );

	// Run events that run only on scroll.
	await autoScroll( page );

	await page.waitFor( 2000 ); /* animations  */

	const bodyHandle = await page.$( 'body' );
	const { width, height } = await bodyHandle.boundingBox();
	await bodyHandle.dispose();

	await page.screenshot( {
		path: argv.targetPath + '/sample_page_' + argv.templateID + '.png',
		clip: {
			x: 0,
			y: 0,
			width,
			height,
		},
	} );

	await browser.close();
} )();
