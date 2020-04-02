import DocumentComponent from './document/component';
import GlobalsComponent from './data/globals/component';

elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	// TODO: Move to elementor:init-data-components
	$e.components.register( new GlobalsComponent() );

	// 'Document component' Should register all child components ( /document/component ).
	$e.components.register( new DocumentComponent() );

	// TODO: Remove, BC Since 2.9.0.
	elementor.saver = $e.components.get( 'document/save' );
} );

$e.modules.document = DocumentComponent.getModules();
