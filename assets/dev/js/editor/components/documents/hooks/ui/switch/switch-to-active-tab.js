import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

export class SwitchToActiveTab extends $e.modules.hookUI.After {
	static calledOnce = false;

	getCommand() {
		return 'editor/documents/switch';
	}

	getId() {
		return 'switch-to-active-tab';
	}

	getConditions() {
		if ( this.constructor.calledOnce ) {
			return false;
		}

		return true;
	}

	apply() {
		this.constructor.calledOnce = true;

		try {
			const activeTab = getQueryParam( 'active-tab' );

			if ( activeTab ) {
				$e.route( 'panel/global/' + activeTab );
			}
		} catch ( e ) {
			removeQueryParam( 'active-tab' );
		}
	}
}

export default SwitchToActiveTab;
