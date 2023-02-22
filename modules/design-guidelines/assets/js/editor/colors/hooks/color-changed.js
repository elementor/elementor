export class ColorChanged extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'color-changed';
	}

	getConditions(args) {
		const isKit = 'kit' === elementor.documents.getCurrent().config.type;
		const attribute = args?.container?.model?.attributes?.name;
		const isColor = ['system_color', 'custom_color'].includes(attribute);

		return isKit && isColor;
	}

	apply( args ) {

	}
}

export default ColumnIsPopulated;
