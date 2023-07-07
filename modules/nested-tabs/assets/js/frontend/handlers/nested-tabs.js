import NestedTabsOld from './nested-tabs-old';

export default class NestedTabs extends NestedTabsOld {
	__construct( settings ) {
		super.__construct( settings );
		this.isHtmlExperimentActive = elementorFrontendConfig.experimentalFeatures[ 'nested-elements-html' ];
	}
}
