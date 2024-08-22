import { getQueryParam, removeQueryParam } from 'elementor-editor-utils/query-params';

export class RemoveActiveTabQueryParamBack extends $e.modules.hookUI.After {
	getCommand() {
		return 'panel/global/back';
	}

	getId() {
		return 'remove-active-tab-query-param-back';
	}

	apply() {
		const activeTab = getQueryParam( 'active-tab' );

		if ( activeTab ) {
			removeQueryParam( 'active-tab' );
		}
	}
}

export default RemoveActiveTabQueryParamBack;
