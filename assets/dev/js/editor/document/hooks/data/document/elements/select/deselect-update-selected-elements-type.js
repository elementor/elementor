import UpdateSelectedElementsTypeBase from '../base/update-selected-elements-type-base';

export class DeselectUpdateSelectedElementsType extends UpdateSelectedElementsTypeBase {
	getCommand() {
		return 'document/elements/deselect';
	}

	getId() {
		return 'update-selected-elements-type--document/elements/deselect';
	}
}

export default DeselectUpdateSelectedElementsType;
