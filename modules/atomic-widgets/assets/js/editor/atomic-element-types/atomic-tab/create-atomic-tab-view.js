const createAtomicTabView = () => {
	const atomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tab' );

	return class AtomicTabView extends atomicElementBaseView {
		attributes() {
			const tabPanelId = this.model.getSetting( 'tab_panel_id' );

			return {
				'aria-controls': tabPanelId?.value,
				...super.attributes(),
			};
		}
	};
};

export default createAtomicTabView;
