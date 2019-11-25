import HookDependency from '../base/dependency';

export class IsPasteStyleEnabled extends HookDependency {
	command() {
		return 'document/elements/paste-style';
	}

	id() {
		return 'is-paste-style-enabled';
	}

	conditions() {
		return true;
	}

	apply() {
		return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'clipboard' );
	}
}

export default IsPasteStyleEnabled;
