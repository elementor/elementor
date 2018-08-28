import BaseAddSectionView from './base';

class AddSectionView extends BaseAddSectionView {

	id() {
		return 'elementor-add-new-section';
	}

	onCloseButtonClick() {
		this.closeSelectPresets();
	}
}

export default AddSectionView;
