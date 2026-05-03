import BaseAddSectionView from './base';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export default class AddSectionView extends BaseAddSectionView {
	get id() {
		return 'elementor-add-new-section';
	}

	onCloseButtonClick() {
		EditorOneEventManager.sendCanvasEmptyBoxAction( {
			targetName: 'close',
			containerCreated: false,
		} );
		this.closeSelectPresets();
	}
}
