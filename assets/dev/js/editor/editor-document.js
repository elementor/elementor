import DocumentComponent from './document/component';
import DocumentSaveComponent from './document/save/component';
import DocumentUIComponent from './document/ui/component';
import DocumentElementsComponent from './document/elements/component';
import DocumentRepeaterComponent from './document/repeater/component';
import DocumentHistoryComponent from './document/history/component';
import DocumentDynamicComponent from './document/dynamic/component';
import DocumentGlobalsComponent from './document/globals/component';

import DataGlobalsComponent from './data/globals/component';

elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	$e.components.register( new DocumentComponent() );
	$e.components.register( new DocumentSaveComponent() );
	$e.components.register( new DocumentUIComponent() );
	$e.components.register( new DocumentElementsComponent() );
	$e.components.register( new DocumentRepeaterComponent() );
	$e.components.register( new DocumentHistoryComponent() );
	$e.components.register( new DocumentDynamicComponent() );
	$e.components.register( new DocumentGlobalsComponent() );

	// TODO: Remove, BC Since 2.9.0.
	elementor.saver = $e.components.get( 'document/save' );

	// TODO: Move to elementor:init-data-components
	$e.components.register( new DataGlobalsComponent() );
} );

$e.modules.document = DocumentComponent.getModules();
