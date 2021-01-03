export const tests = () => {
	// JS API modules.
	require( './core/common/assets/js/api/modules/command.spec.js' );
	require( './core/common/assets/js/api/modules/command-base.spec.js' );
	require( './core/common/assets/js/api/modules/command-callback.spec.js' );
	require( './core/common/assets/js/api/modules/command-data.spec.js' );
	require( './core/common/assets/js/api/modules/command-internal.spec.js' );

	// JS API core.
	require( './core/common/assets/js/api/core/components.spec.js' );
	require( './core/common/assets/js/api/core/data.spec.js' );

	require( './core/common/assets/js/api/core/hooks/base.spec.js' );

	require( './assets/dev/js/editor/container/container.spec' );

	// JS API editor
	require( './assets/dev/js/editor/base/command-editor.spec' );
	require( './assets/dev/js/editor/base/command-editor-internal.spec' );

	// JS API editor document.
	require( './assets/dev/js/editor/document/base/command-disable-enable.spec' );
	require( './assets/dev/js/editor/document/base/command-history.spec' );
	require( './assets/dev/js/editor/document/base/command-history-debounce.spec' );

	require( './assets/dev/js/editor/document/dynamic/commands/base/disable-enable.spec' );
	require( './assets/dev/js/editor/document/globals/commands/base/disable-enable.spec' );

	require( './assets/dev/js/editor/document/manager.spec' );
	require( './assets/dev/js/editor/document/component.spec' );

	// TODO: Require all components from one file.

	require( './assets/dev/js/editor/document/elements/component.spec' );
	require( './assets/dev/js/editor/document/globals/component.spec' );
	require( './assets/dev/js/editor/document/repeater/component.spec' );
	require( './assets/dev/js/editor/document/dynamic/component.spec' );
	require( './assets/dev/js/editor/document/history/component.spec' );
	require( './assets/dev/js/editor/document/ui/component.spec' );
	require( './assets/dev/js/editor/document/save/component.spec' );

	require( './core/kits/assets/js/manager.spec' );
	require( './core/kits/assets/js/component.spec' );

	require( './assets/dev/js/editor/data/globals/component.spec' );

	require( './modules/dev-tools/assets/js/editor/dev-tools.spec' );
};

// Export for external build.
if ( $e?.devTools?.external && ! $e.devTools.external.tests ) {
	$e.devTools.external.tests = tests;
}

export default tests;
