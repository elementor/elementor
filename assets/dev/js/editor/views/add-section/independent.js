import BaseAddSectionView from './base';

export default class AddSectionView extends BaseAddSectionView {
	get id() {
		return 'elementor-add-new-section';
	}

	onCloseButtonClick() {
		this.closeSelectPresets();
	}
}
