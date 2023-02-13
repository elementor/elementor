import Component from './component';

class LandingPageLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );
	}
}

export default LandingPageLibraryModule;
