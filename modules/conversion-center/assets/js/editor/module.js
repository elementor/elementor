import Component from './component';

class LinksPageLibraryModule extends elementorModules.editor.utils.Module {
	onElementorLoaded() {
		this.component = $e.components.register( new Component( { manager: this } ) );
	}
}

export default LinksPageLibraryModule;
