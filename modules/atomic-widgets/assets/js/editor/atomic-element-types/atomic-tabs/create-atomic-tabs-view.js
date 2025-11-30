const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default-active-tab' ).value ?? 0;
			const defaultActiveTabId = `${ this.model.id }-tab-${ defaultActiveTab }`;

			const eSettings = JSON.stringify( { 'default-active-tab': defaultActiveTabId } );
			const attributes = super.attributes();

			return { 'x-data': `eTabs${ this.model.id }`, 'data-e-settings': eSettings, ...attributes };
		}
	};
};

export default createAtomicTabsView;
