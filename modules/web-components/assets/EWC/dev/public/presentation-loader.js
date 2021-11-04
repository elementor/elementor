import { CodeJar } from 'https://medv.io/codejar/codejar.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js';
import { getAuth,
	onAuthStateChanged,
	signInWithRedirect,
	getRedirectResult,
	GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-auth.js';

const firebaseConfig = {
	apiKey: 'AIzaSyB5-JE7QVrWYNA7gzm1-OJh-6hjUqg3YHM',
	authDomain: 'ewc.lmntor.xyz',
	projectId: 'e-components-bb43a',
	storageBucket: 'e-components-bb43a.appspot.com',
	messagingSenderId: '100236721156',
	appId: '1:100236721156:web:90f981ea11af050d7a8951',
	measurementId: 'G-D6QYQSV6NB',
};

const app = initializeApp( firebaseConfig );
const provider = new GoogleAuthProvider();
const auth = getAuth();

onAuthStateChanged( auth, ( user ) => {
	if ( user ) {
		console.log( 'Status Change' );
		console.log( user );
		loadPage();
	} else {
		getRedirectResult( auth ).then( ( result ) => {
			// This gives you a Google Access Token. You can use it to access Google APIs.
			// const credential = GoogleAuthProvider.credentialFromResult( result );
			console.log( 'Redirect result' );
			console.log( result );

			if ( result.user ) {
				loadPage();
			}
		} ).catch( ( error ) => {
			console.error( error );
			signInWithRedirect( auth, provider );
		} );
	}
} );

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
