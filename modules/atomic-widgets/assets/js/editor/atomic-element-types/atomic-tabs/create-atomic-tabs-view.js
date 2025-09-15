import { initialInputControlState as tabPanelId } from '@wordpress/components/src/input-control/reducer/state';

const createAtomicTabsView = () => {
	const AtomicElementBaseView = elementor.modules.elements.views.createAtomicElementBase( 'e-tabs' );

	return class AtomicTabsView extends AtomicElementBaseView {
		attributes() {
			const defaultActiveTab = this.model.getSetting( 'default_active_tab' );

			return defaultActiveTab?.value
				? { 'default-active-tab': defaultActiveTab.value }
				: super.attributes();
		}
	};
};

export default createAtomicTabsView;
