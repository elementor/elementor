import dropCSS from 'dropCSS';
import csso from 'csso';

const styleSheets = document.styleSheets;
const HTML = document.documentElement.outerHTML;

const elementorStyleSheets = [ ...styleSheets ].filter( ( styleSheet ) => {
	if ( null !== styleSheet.href ) {
		return styleSheet.href.match( /wp-content[\/|\\]plugins[\/|\\]elementor/g );
	}
	return false;
} );

const frontendStyleSheets = [ ...styleSheets ].filter( ( styleSheet ) => {
	if ( null !== styleSheet.href ) {
		return styleSheet.href.match( /wp-content/g );
	}
	return false;
} );
const googleFonts = [ ...styleSheets ].filter( ( styleSheet ) => {
	if ( null !== styleSheet.href ) {
		return styleSheet.href.match( /^https:\/\/fonts\.googleapis\.com/ );
	}
	return false;
} );

for ( let i = 0; i < styleSheets.length; i++ ) {
	let styleSheet = styleSheets[ i ];
}

const allCSS = [ ...frontendStyleSheets ]
	.map( ( styleSheet ) => {
		try {
			return [ ...styleSheet.cssRules ]
				.map( ( rule ) => rule.cssText )
				.join( '' );
		} catch ( e ) {
			console.log( 'Access to stylesheet %s is denied. Ignoring...', styleSheet.href );
		}
	} )
	.filter( Boolean )
	.join( '\n' );

const selectors = {
	documents: '[data-elementor-id]',
	sections: '.elementor-section',
	elements: '.elementor-element',
	images: '.elementor-element img',
};

const elements = {
	elementorElements: document.querySelectorAll( selectors.elements ),
	elementorDocuments: document.querySelectorAll( selectors.documents ),
	elementorImages: document.querySelectorAll( selectors.images ),
	elementorSections: document.querySelectorAll( selectors.sections ),
};

const getGoogleFonts = () => {
	const fonts = document.createElement( 'a' );
	fonts.href = googleFonts[ 0 ].href;
	const fontsParams = new URLSearchParams( fonts.search );
	const fontsArray = fontsParams.get( 'family' ).split( '|' );
	const fontFamilies = [];
	fontsArray.forEach( ( font, index ) => {
		fontFamilies[ index ] = font.substr( 0, font.indexOf( ':' ) );
	} );

	return fontFamilies;
};

const isCriticalFont = ( fontName ) => {
	let itIs = false;
	document.querySelectorAll( selectors.elements + '.critical, ' + selectors.elements + '.critical *:not(:is(script, img, figure, style))' )
		.forEach( ( element ) => {
			if ( itIs ) {
				return;
			}

			if ( '' >= element.textContent ) {
				return;
			}

			const fontFamily = window.getComputedStyle( element ).getPropertyValue( 'font-family' );

			if ( fontFamily.includes( fontName ) ) {
				itIs = true;
			}
		} );

	console.log( fontName, itIs );
	return itIs;
};

const getCriticalFonts = () => {
	const criticalFonts = [];
	const fontFamilies = getGoogleFonts();

	[ ...fontFamilies ].forEach( ( font ) => {
		if ( isCriticalFont( font ) ) {
			criticalFonts.push( font );
		}
	} );
	return criticalFonts.flat();
};

window.addEventListener( 'DOMContentLoaded', () => {
	const criticalSections = [ ...elements.elementorSections ].filter( ( element ) => {
		return 1350 > element.getBoundingClientRect().top ? element : false;
	} );

	let criticalElements = [];

	criticalSections.forEach( ( section ) => {
		const childElements = section.querySelectorAll( selectors.elements );
		criticalElements = criticalElements.concat( [ ...childElements ].filter( ( element ) => {
			return 1350 > element.getBoundingClientRect().top ? element : false;
		} ) );
	} );

	criticalElements.forEach( ( element ) => {
		element.classList.add( 'critical' );
	} );

	criticalSections.forEach( ( element ) => {
		element.classList.add( 'critical' );
	} );

	const usedCSS = dropCSS( {
		html: HTML,
		css: allCSS,
	} );

	[ ...elements.elementorSections ].forEach( ( section ) => {
		if ( ! section.classList.contains( 'critical' ) ) {
			section.remove();
		} else {
			[ ...section.querySelectorAll( selectors.elements + ':not(.critical)' ) ].forEach( ( element ) => {
				element.remove();
			} );
		}
	} );

	const criticalHTML = document.documentElement.outerHTML;

	const criticalCSS = dropCSS( {
		html: criticalHTML,
		css: usedCSS.css,
	} );

	// console.log( csso.minify( criticalCSS.css ).css );

	const pageData = {
		images: '',
		criticalCSS: csso.minify( criticalCSS.css ).css,
		fonts: getGoogleFonts(),
		criticalFonts: getCriticalFonts(),
	};

	document.documentElement.innerHTML = HTML;

	[ ...styleSheets ].forEach( ( styleSheet ) => {
		styleSheet.disabled = true;
	} );

	const criticalStyleElement = document.createElement( 'style' );

	criticalStyleElement.innerText = pageData.criticalCSS;

	document.head.append( criticalStyleElement );
// console.log( getElementorImages() );
// console.log( elementorStyleSheets );
// console.log( getElementsUsingFont( 'Roboto' ) );
	console.log( pageData );
// console.log( criticalSections );
// console.log( criticalElements );
// console.log( styleSheets );
} );
