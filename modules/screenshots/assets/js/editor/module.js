import Component from './component';

export default class Module extends elementorModules.editor.utils.Module {
	onElementorInitComponents() {
		$e.components.register( new Component() );
	}
}
