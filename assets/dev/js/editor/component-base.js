import { default as ApiComponentBase } from 'elementor-api/modules/component-base';

/**
 * @typedef {import('elementor-panel/pages/editor').default} EditorView
 * @typedef {import('elementor-controls/base-data').default} ControlBaseDataView
 */

export default class ComponentBase extends ApiComponentBase {
	/**
	 * Call the activate of the control's view
	 *
	 * @param {string} controlPath
	 */
	activateControl( controlPath ) {
		if ( ! controlPath ) {
			return;
		}

		const editor = elementor.getPanelView().getCurrentPageView();
		const currentView = editor.content ? editor.content.currentView : editor;

		const controlView = this.getControlViewByPath( currentView, controlPath );
		controlView.activate?.();
	}

	/**
	 * Get the control's view by path
	 *
	 * @param {EditorView} currentView
	 * @param {string}     controlPath
	 *
	 * @return {ControlBaseDataView}
	 */
	getControlViewByPath( currentView, controlPath ) {
		const controls = controlPath.split( '/' );
		let controlView = currentView.getControlViewByName( controls[ 0 ] );

		controls.slice( 1 ).forEach( ( control ) => {
			controlView = controlView.getChildControlView?.( control );
		} );

		return controlView;
	}
}
