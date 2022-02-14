import { CodeJar } from 'https://medv.io/codejar/codejar.js';

loadPage();

function loadPage() {
	import( '/slider.js' )
		.then( ( module ) => {
			document.body.innerHTML = module.slider.strings[ 0 ];
		} ).then( () => {
		showPresentation();
		highlightCode();
	} );
}

function showPresentation() {
	const $presentation = document.getElementById( 'presentation' );
	$presentation.style.display = 'block';

	const slider = new Splide( '.splide', {
		drag: false,
		keyboard: false,
	} );

	slider.mount( window.splide.Extensions );

	$presentation.style.opacity = '1';
}

function highlightCode() {
	const pre = document.getElementsByTagName( 'pre' );

	for ( let i = 0; i < pre.length; i++ ) {
		const el = pre[ i ];
		const markup = el.querySelector( 'textarea.markup' );
		const code = markup ? markup.value : el.innerHTML;
		const resultElementID = el.getAttribute( 'data-result-element-id' );

		const jar = CodeJar( el, Prism.highlightElement );
		jar.updateCode( code );

		if ( resultElementID ) {
			const resultElement = document.getElementById( resultElementID );
			if ( resultElement ) {
				resultElement.innerHTML = jar.toString();
				jar.onUpdate( code => resultElement.innerHTML = code );
			}
		}
	}
}
