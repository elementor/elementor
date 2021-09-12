import UpdatePanelPage from '../base/update-panel-page';

export class DeselectUpdatePanelPage extends UpdatePanelPage {
	getCommand() {
		return 'document/elements/deselect';
	}

	getId() {
		return 'update-panel-page--document/elements/deselect';
	}
}

export default DeselectUpdatePanelPage;
