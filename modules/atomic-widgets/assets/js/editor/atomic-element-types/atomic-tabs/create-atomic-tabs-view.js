const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default_active_tab' );

			return {
				'default-active-tab': defaultActiveTab?.value,
				...super.attributes(),
			};
		}
	};
};

export default createAtomicTabsView;
