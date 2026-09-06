const EDITOR_APP_BAR_WRAPPER_ID = 'elementor-editor-wrapper-v2';

export function getAppBarHeight() {
	return document.getElementById( EDITOR_APP_BAR_WRAPPER_ID )?.getBoundingClientRect().height ?? 0;
}
