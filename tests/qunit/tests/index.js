export const tests = () => {
	// WEB CLI.
	require( './modules/web-cli/assets/js/index' );

	// Editor.
	require( './assets/dev/js/editor/utils/helpers.spec' );
	require( './assets/dev/js/editor/container/container.spec' );

	// WEB CLI editor
	require( './assets/dev/js/editor/command-bases/command-container-base.spec' );
	require( './assets/dev/js/editor/command-bases/command-container-internal-base.spec' );

	// WEB CLI editor document.
	require( './assets/dev/js/editor/document/command-bases/command-history-base.spec' );
	require( './assets/dev/js/editor/document/command-bases/command-history-debounce-base.spec' );
	require( './assets/dev/js/editor/document/command-bases/command-disable-enable.spec' );

	require( './assets/dev/js/editor/document/dynamic/commands/base/disable-enable.spec' );
	require( './assets/dev/js/editor/document/globals/commands/base/disable-enable.spec' );

	// WEB CLI editor preview component & commands.
	require( './assets/dev/js/editor/components/preview/component.spec' );

	// WEB CLI editor document components & commands.
	require( './assets/dev/js/editor/document/component.spec' );

	// WEB CLI editor globals data.
	require( './assets/dev/js/editor/data/globals/component.spec' );

	// Kits.
	require( './core/kits/assets/js/manager.spec' );

	// WEB CLI kits components & commands.
	require( './core/kits/assets/js/component.spec' );
};

// Export for external build.
if ( $e?.devTools?.external && ! $e.devTools.external.tests ) {
	$e.devTools.external.tests = tests;
}

export default tests;
