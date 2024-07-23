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
}

export default FloatingBarsLibraryModule;
