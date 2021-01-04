export class ElementsColorPickerAddSwatches extends $e.modules.hookUI.After {
	getCommand() {
		return 'document/elements/settings';
	}

	getId() {
		return 'elements-color-picker-add-swatches';
	}

	getCoditions( args ) {
		return Object.keys( arg.settings ).some( ( key ) => 'color' === args.container.controls[ key ].type );
	}

	apply( args ) {

	}
}

export default ElementsColorPickerAddSwatches;
