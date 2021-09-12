import UpdateSelectedElementsTypeBase from '../base/update-selected-elements-type-base';

export class SelectUpdateSelectedElementsType extends UpdateSelectedElementsTypeBase {
	getCommand() {
		return 'document/elements/select';
	}

	getId() {
		return 'update-selected-elements-type--document/elements/select';
	}
}

export default SelectUpdateSelectedElementsType;
