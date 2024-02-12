import { EditorDrawer } from './editor-drawer';

let isRendered = false;

export const editorOnButtonClicked = () => {
	if ( ! isRendered ) {
		isRendered = true;

		const container = document.createElement( 'div' );

		document.body.append( container );

		ReactDOM.render(
			<EditorDrawer />,
			container,
		);

		return;
	}

	elementor.trigger( 'elementor/editor/panel/whats-new/clicked' );
};
