import UpdatePanelPage from '../base/update-panel-page';

export class SelectUpdatePanelPage extends UpdatePanelPage {
	getCommand() {
		return 'document/elements/select';
	}

	getId() {
		return 'update-panel-page--document/elements/select';
	}
}

export default SelectUpdatePanelPage;
