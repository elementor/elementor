export const tests = () => {
	require( './core/common/assets/js/api/modules/command-base.spec.js' );
	require( './core/common/assets/js/api/modules/command-data.spec.js' );

	require( './core/common/assets/js/api/core/components.spec.js' );
	require( './core/common/assets/js/api/core/data.spec.js' );

	require( './core/common/assets/js/api/core/hooks/base.spec.js' );

	require( './core/editor/container/container.spec' );

	require( './core/editor/document/commands/base/command-history.spec' );
	require( './core/editor/document/dynamic/commands/base/disable-enable.spec' );
	require( './core/editor/document/globals/commands/base/disable-enable.spec' );

	require( './core/editor/document/component.spec' );
	require( './core/editor/document/manager.spec' );

	// TODO: Require all components from one file.

	require( './core/editor/document/elements/component.spec' );
	require( './core/editor/document/globals/component.spec' );
	require( './core/editor/document/repeater/component.spec' );
	require( './core/editor/document/dynamic/component.spec' );
	require( './core/editor/document/history/component.spec' );
	require( './core/editor/document/ui/component.spec' );
	require( './core/editor/document/save/component.spec' );

	require( './core/kits/assets/js/component.spec' );

	require( './core/editor/data/globals/component.spec' );
};

// export for external build.
if ( $e?.devTools?.external && ! $e.devTools.external.tests ) {
	$e.devTools.external.tests = tests;
}

export default tests;
