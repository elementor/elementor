import EditorBase from './editor-base';

class App extends EditorBase {
	onStart( options ) {
		NProgress.start();
		NProgress.inc( 0.2 );

		super.onStart( options );
	}
}

window.elementor = new App();

if ( -1 === location.href.search( 'ELEMENTOR_TESTS=1' ) ) {
	elementor.start();
}

export default window.elementor;
