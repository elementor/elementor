import HookUIBefore from 'elementor-api/modules/hooks/ui/before';

export class FooterSaverBeforeSave extends HookUIBefore {
	getCommand() {
		return 'document/save/save';
	}

	getId() {
		return 'footer-saver-before-save';
	}

	apply() {
		NProgress.start();
	}
}

export default FooterSaverBeforeSave;
