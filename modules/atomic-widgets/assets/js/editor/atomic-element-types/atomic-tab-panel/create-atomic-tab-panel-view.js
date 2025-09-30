const createAtomicTabPanelView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab-panel' );

	return class AtomicTabPanelView extends AtomicElementBaseView {
		attributes() {
			const tabId = this.model.getSetting( 'tab-id' );

			const attributes = {
				':hidden': `activeTab !== '${ tabId.value }' ? true : false`,
				':style': `activeTab === '${ tabId.value }' ? '' : 'display: none;'`,
			};

			if ( tabId?.value ) {
				attributes[ 'data-tab-id' ] = tabId.value;
				attributes[ 'aria-labelledby' ] = tabId.value;
			}

			return { ...attributes, ...super.attributes() };
		}
	};
};

export default createAtomicTabPanelView;
