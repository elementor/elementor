import HookDependency from '../base/dependency';

export class IsPasteEnabled extends HookDependency {
	getCommand() {
		return 'document/elements/paste';
	}

	getId() {
		return 'is-paste-enabled';
	}

	getConditions() {
		return true;
	}

	apply() {
		return elementor.getCurrentElement().isPasteEnabled();
	}
}

export default IsPasteEnabled;
