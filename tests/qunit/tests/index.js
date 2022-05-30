export const tests = () => {
	require( './modules/web-cli/assets/js/index' );

	require( './assets/dev/js/editor/container/container.spec' );

	require( './assets/dev/js/editor/document/commands/base/command-history.spec' );
	require( './assets/dev/js/editor/document/dynamic/commands/base/disable-enable.spec' );
	require( './assets/dev/js/editor/document/globals/commands/base/disable-enable.spec' );

	require( './assets/dev/js/editor/document/component.spec' );

	require( './assets/dev/js/editor/utils/helpers.spec' );

	require( './assets/dev/js/editor/data/globals/component.spec' );

	require( './core/kits/assets/js/manager.spec' );
	require( './core/kits/assets/js/component.spec' );

	require( './modules/dev-tools/assets/js/editor/dev-tools.spec' );
};

// Export for external build.
if ( $e?.devTools?.external && ! $e.devTools.external.tests ) {
	$e.devTools.external.tests = tests;
}

export default tests;
