import PresetsComponent from './component';

elementorCommon.elements.$window.on( 'elementor:init-components', () => {
	$e.components.register( new PresetsComponent() );
} );
