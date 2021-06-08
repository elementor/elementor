import { finder } from '@medv/finder';
import Critical from './analyzer-utils/critical';
import ImageOptimizer from './optimizer/image-optimizer';
import csso from 'csso';

class Analyzer {
	constructor( options ) {
		this.options = options;
	}

	getAllStyleSheets( elementorOnly = null ) {
		const matchElementor = /wp-content[\/|\\]plugins[\/|\\]elementor/g;
		const matchAllFrontend = /wp-content/g;
		const matchPath = elementorOnly ? matchElementor : matchAllFrontend;

		return [ ...this.styleSheets ].filter( ( styleSheet ) => {
			return null !== styleSheet.href ?
				styleSheet.href.match( matchPath ) :
				false;
		} );
	}

	getAllCSS() {
		return [ ...this.getAllStyleSheets() ].map( ( styleSheet ) => {
			try {
				return [ ...styleSheet.cssRules ].map( ( rule ) => rule.cssText ).join( '' );
			} catch ( e ) {
				console.error( 'Access to stylesheet %s is denied. Ignoring...', styleSheet.href );
			}
		} )
		.filter( Boolean )
		.join( '\n' );
	}

	getPageHTML() {
		return document.documentElement.outerHTML;
	}

	getGoogleFonts() {
		const fontParseHelper = document.createElement( 'a' );
		const fontStyleSheets = [ ...this.styleSheets ].filter( ( styleSheet ) => {
			return null !== styleSheet.href ?
				styleSheet.href.match( /^https:\/\/fonts\.googleapis\.com/ ) :
				false;
		} );
		const fontFamilies = [];

		fontStyleSheets.forEach( ( styleSheet ) => {
			fontParseHelper.href = styleSheet.href;

			const fontsParams = new URLSearchParams( fontParseHelper.search );
			const fontsArray = fontsParams.get( 'family' ).split( '|' );

			fontFamilies.push(
				fontsArray.map( ( font ) => font.substr( 0, font.indexOf( ':' ) ) )
			);
		} );

		return fontFamilies.flat();
	}

	getWidgets() {
		return this.getElements( 'widgets' ).map( ( widget ) => {
			const widgetID = widget.getAttribute( 'data-id' );

			return {
				id: widgetID,
				type: widget.getAttribute( 'data-type' ),
				images: this.images.filter( ( image ) => {
					return widgetID === image.rootNodeID;
				} ).map( ( image ) => image.rootNodeID ),
			};
		} );
	}

	getImages() {
		const images = [];
		const promises = [];

		this.getElements( 'images' ).forEach( ( el, i ) => {
			images[ i ] = {
				clientWidth: el.clientWidth,
				clientHeight: el.clientHeight,
				parentWidget: el.closest( '.elementor-widget' ).getAttribute( 'data-id' ),
				src: el.src,
			};

			promises[ i ] = new Promise( ( resolve, reject ) => {
				const img = document.createElement( 'img' );
				img.setAttribute( 'src', el.src );

				img.addEventListener( 'load', () => {
					images[ i ].naturalWidth = img.naturalWidth;
					images[ i ].naturalHeight = img.naturalHeight;
					resolve( images[ i ] );
				} );
				img.addEventListener( 'error', ( err ) => reject( err ) );
				img.classList.add( 'analyzer-temp-img' );

				document.body.appendChild( img );
			} );
		} );

		Promise.all( [ ...promises ] ).then( () => {
			[ ...document.querySelectorAll( '.analyzer-temp-img' ) ].forEach( ( img ) => img.remove() );
		} ).catch( ( err ) => {
			console.error( err );
		} );

		return images;
	}

	getBackgroundImages() {
		const elementsToInspect = document.querySelectorAll(
			this.selectors.sections + ', ' + this.selectors.sections + ' *:not(:is(script, img, figure, style))'
		);
		const srcChecker = /url\(\s*?['"]?\s*?(\S+?)\s*?["']?\s*?\)/i;
		const fileExtension = /\S+?\.(?:jpg|jpeg|png)/i;
		const elements = [];
		const promises = [];

		[ ...elementsToInspect ].forEach( ( el ) => {
			const prop = window.getComputedStyle( el, null )
				.getPropertyValue( 'background-image' );
			const urlMatch = srcChecker.exec( prop );
			const match = urlMatch ? fileExtension.exec( urlMatch[ 1 ] ) : false;

			if ( ! match ) {
				return;
			}

			const isSelfRoot = el.classList.contains( 'elementor-element' ) &&
				el.getAttribute( 'data-id' );
			const rootNode = isSelfRoot ? el : el.closest( '.elementor-section' );
			const rootNodeID = rootNode.getAttribute( 'data-id' );
			const rootSelector = '.elementor-element-' + rootNodeID;
			let cssSelector = isSelfRoot ? rootSelector : rootSelector + ' ' + finder( el, {
				root: rootNode,
			} );

			if ( el.classList.contains( 'elementor-carousel-image' ) &&
				! ! el.closest( '.elementor-swiper' ) ) {
				const widgetID = el.closest( '.elementor-widget' ).getAttribute( 'data-id' );
				const slideIndex = el.closest( '.swiper-slide' ).getAttribute( 'data-swiper-slide-index' );
				cssSelector = '.elementor-element-' + widgetID +
					' .elementor-swiper [data-swiper-slide-index=\"' + slideIndex + '\"] .elementor-carousel-image';
			}

			elements.push( {
				backgroundSize: window.getComputedStyle( el, null )
					.getPropertyValue( 'background-size' ),
				cssSelector: isSelfRoot ? rootSelector : cssSelector,
				clientWidth: el.clientWidth,
				clientHeight: el.clientHeight,
				rootNodeID: rootNodeID,
				url: match[ 0 ],
			} );
		} );

		elements.forEach( ( element ) => {
			promises.push( new Promise( ( resolve, reject ) => {
				const img = document.createElement( 'img' );
				img.setAttribute( 'src', element.url );

				img.addEventListener( 'load', () => {
					element.naturalWidth = img.naturalWidth;
					element.naturalHeight = img.naturalHeight;
					resolve( element );
				} );
				img.addEventListener( 'error', ( err ) => reject( err ) );
				img.classList.add( 'analyzer-temp-img' );

				document.body.appendChild( img );
			} ) );
		} );

		Promise.all( [ ...promises ] ).then( () => {
			[ ...document.querySelectorAll( '.analyzer-temp-img' ) ].forEach( ( img ) => img.remove() );
		} ).catch( ( err ) => {
			console.error( err );
		} );

		return elements;
	}

	getElements( selector ) {
		return [ ...document.querySelectorAll( this.selectors[ selector ] ) ];
	}

	init() {
		this.selectors = {
			documents: '[data-elementor-id]',
			sections: '.elementor-section',
			elements: '.elementor-element',
			widgets: '.elementor-widget',
			images: '.elementor-element img',
		};
		this.styleSheets = document.styleSheets;
		this.frontendStyleSheets = this.getAllStyleSheets();
		this.HTML = document.documentElement.outerHTML;
		this.CSS = this.getAllCSS();
	}

	run( task ) {
		this.fonts = { google: this.getGoogleFonts() };
		this.images = ( this.getImages() );
		this.backgroundImages = ( this.getBackgroundImages() );
		this.widgets = ( this.getWidgets() );

		this.critical = new Critical( this );
		this.critical.init();

		this.critical.images.forEach( ( isCritical, i ) => this.images[ i ].critical = isCritical );
		this.critical.backgroundImages.forEach( ( isCritical, i ) => this.backgroundImages[ i ].critical = isCritical );

		this.imageOptimizer = new ImageOptimizer();

		return Promise.all( [
			this.imageOptimizer.optimizeImages( this.images, true ),
			this.imageOptimizer.optimizeImages( this.backgroundImages, true ),
		] );
	}

	getData() {
		return {
			widgets: this.widgets,
			images: this.images,
			backgroundImages: this.backgroundImages,
			css: csso.minify( this.critical.getUsedCss( this.critical.nonCriticalHtml ) ).css,
			fonts: this.fonts,
			criticalCSS: this.critical.css,
			criticalFonts: this.critical.fonts,
		};
	}
}

const optimizeImages = function( analyzer ) {
	return Promise.all( [
		analyzer.imageOptimizer.optimizeImages( analyzer.images ),
		analyzer.imageOptimizer.optimizeImages( analyzer.backgroundImages ),
	] );
};

const sendData = function( data ) {
	jQuery.ajax( {
		type: 'post',
		dataType: 'json',
		url: analyzerAjax.ajaxurl,
		data: {
			action: 'save_analyzer_data_report',
			post_id: post_id,
			nonce: nonce,
			page_data: JSON.stringify( data ),
			analyzer: 1,
		},
		success: function( response ) {
			sendMessage( 'Analyzer data sent successfully.' );
			sendMessage( response );
		},
		error: function( response ) {
			if ( 400 === response.status || response.error.length ) {
				sendMessage( 'Failed to send Analyzer data.' );
			}
		},
	} );
};

const sendMessage = ( message, target = false ) => {
	window.parent.postMessage( message, target || '*' );
	// console.log( message );
};

window.addEventListener( 'DOMContentLoaded', () =>
	setTimeout( () => {
		sendMessage( 'Starting Page Analyzer.' );

		const analyzer = new Analyzer();

		analyzer.init();

		sendMessage( 'Analyzing the page...' );

		analyzer.run().then( () => {
			sendMessage( 'Page Analyzed.' );
			sendMessage( 'Creating Report...' );

			const data = analyzer.getData();

			sendMessage( data, );
			sendMessage( 'Sending Report to the server...' );

			sendData( data );
		} ).then( () => sendMessage( 'Report Sent.', '*' ) ).then( () => {
			sendMessage( 'Optimizing Images...' );
			optimizeImages( analyzer ).then( () => {
				const optimizedImages = {};
				optimizedImages.images = analyzer.images.map( ( image ) => {
					delete image.placeholder.data;
					return image;
				} );
				optimizedImages.backgroundImages = analyzer.backgroundImages.map( ( image ) => {
					delete image.placeholder.data;
					return image;
				} );

				sendMessage( 'Images Optimized.' );
				sendMessage( optimizedImages, );

				sendMessage( 'Sending Optimized Images to the server...' );
				sendData( {
					optimizedImages: optimizedImages,
				} );
			} );
		} );
	}, 500 )
);
