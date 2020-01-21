/* global ElementorConfig */
import editorBase from './editor-base';

const App = editorBase.extend( {
	onStart() {
		NProgress.start();
		NProgress.inc( 0.2 );

		editorBase.prototype.onStart.apply( this, arguments );
	},
} );

window.elementor = new App();

if ( -1 === location.href.search( 'ELEMENTOR_TESTS=1' ) ) {
	elementor.start();
}

export default window.elementor;
