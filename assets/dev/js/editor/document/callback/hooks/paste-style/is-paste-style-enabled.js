import HookDependency from '../base/dependency';

export class IsPasteStyleEnabled extends HookDependency {
	getCommand() {
		return 'document/elements/paste-style';
	}

	getId() {
		return 'is-paste-style-enabled';
	}

	getConditions() {
		return true;
	}

	apply() {
		return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'clipboard' );
	}
}

export default IsPasteStyleEnabled;
