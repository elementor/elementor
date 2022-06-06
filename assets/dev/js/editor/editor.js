import EditorBase from './editor-base';

export class Editor extends EditorBase {
	onStart( options ) {
		NProgress.start();
		NProgress.inc( 0.2 );

		super.onStart( options );
	}

	onPreviewLoaded() {
		NProgress.done();

		super.onPreviewLoaded();
	}
}

window.elementor = new Editor();
