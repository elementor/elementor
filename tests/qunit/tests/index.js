export const tests = () => {
	require( './modules/web-cli/assets/js/index' );

	require( './assets/dev/js/editor/container/container.spec' );

	// JS API editor
	require( './assets/dev/js/editor/command-bases/command-container-base.spec' );
	require( './assets/dev/js/editor/command-bases/command-container-internal-base.spec' );

	// JS API editor document.
	require( './assets/dev/js/editor/document/command-bases/command-history-base.spec' );
	require( './assets/dev/js/editor/document/command-bases/command-history-debounce-base.spec' );
	require( './assets/dev/js/editor/document/command-bases/command-disable-enable.spec' );

	require( './assets/dev/js/editor/document/dynamic/commands/base/disable-enable.spec' );
	require( './assets/dev/js/editor/document/globals/commands/base/disable-enable.spec' );

	// JS API editor document components & commands.
	require( './assets/dev/js/editor/document/component.spec' );

	// JS API editor globals data.
	require( './assets/dev/js/editor/data/globals/component.spec' );

	// Kits.
	require( './core/kits/assets/js/manager.spec' );

	// JS API kits components & commands.
	require( './core/kits/assets/js/component.spec' );

	// Modules.
	require( './modules/dev-tools/assets/js/editor/dev-tools.spec' );
};

// Export for external build.
if ( $e?.devTools?.external && ! $e.devTools.external.tests ) {
	$e.devTools.external.tests = tests;
}

export default tests;
