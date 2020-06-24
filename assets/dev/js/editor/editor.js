import EditorBase from './editor-base';

		NProgress.start();
export class Editor extends EditorBase {
	onStart( options ) {
		NProgress.inc( 0.2 );

		super.onStart( options );
	}

	onPreviewLoaded() {
		NProgress.done();

		super.onPreviewLoaded();
	}
}

window.elementor = new Editor();

elementor.start();
