class FloatingBarsLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		elementor.channels.editor.on( 'section:activated', this.hideAdvancedTab.bind( this ) );
	}

	hideAdvancedTab( sectionName, editor ) {
		const widgetType = editor?.model?.get( 'widgetType' ) || '';

		if ( ! widgetType.startsWith( 'floating-bars' ) ) {
			return;
		}

		const advancedTab = editor?.el.querySelector( '.elementor-tab-control-advanced' ) || false;

		if ( advancedTab ) {
			advancedTab.style.display = 'none';
		}
	}

	onElementorInit() {
		const urlParams = new URLSearchParams( window.location.search );

		if ( 'floating-bars' === urlParams.get( 'floating_element' ) ) {
			elementor.hooks.addFilter( 'elementor/editor/template-library/template/classes', ( classes ) => {
				return classes.replace( 'elementor-template-library-template-floating_button', 'elementor-template-library-template-floating_bar' );
			}, 10, 1 );
		}
	}
}

export default FloatingBarsLibraryModule;
