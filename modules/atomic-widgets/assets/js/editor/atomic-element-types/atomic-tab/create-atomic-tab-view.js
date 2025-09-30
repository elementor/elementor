const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const tabPanelId = this.model.getSetting( 'tab-panel-id' );

			const attributes = {
				':tabindex': `activeTab === '${ this.model.id }' ? '0' : '-1'`,
				':aria-selected': `activeTab === '${ this.model.id }' ? 'true' : 'false'`,
				'x-on:click': `activeTab='${ this.model.id }'`,
			};

			if ( tabPanelId?.value ) {
				attributes[ 'aria-controls' ] = tabPanelId.value;
			}

			return { ...attributes, ...super.attributes() };
		}
	};
};

export default createAtomicTabView;
