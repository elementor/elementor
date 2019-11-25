import HookDependency from '../base/dependency';

export class IsPasteEnabled extends HookDependency {
	hook() {
		return 'document/elements/paste';
	}

	id() {
		return 'is-paste-enabled';
	}

	conditions() {
		return true;
	}

	apply() {
		return elementor.getCurrentElement().isPasteEnabled();
	}
}

export default IsPasteEnabled;
