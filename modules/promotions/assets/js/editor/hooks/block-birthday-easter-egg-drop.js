export const BIRTHDAY_EASTER_EGG_WIDGET_NAME = 'e-birthday-easter-egg';

export default class BlockBirthdayEasterEggDrop extends $e.modules.hookData.Dependency {
	getCommand() {
		return 'preview/drop';
	}

	getId() {
		return 'block-birthday-easter-egg-drop';
	}

	getConditions( args ) {
		return BIRTHDAY_EASTER_EGG_WIDGET_NAME === args.model?.widgetType;
	}

	apply() {
		return false;
	}
}
