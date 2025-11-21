import SidebarBanner from './promotions/sidebar-banner';
import SidebarDefault from './promotions/sidebar-default';

const SideBarPromotion = ( { sideData } ) => {
	if ( 'banner' === sideData.type ) {
		return ( <SidebarBanner { ...sideData.data } /> );
	}

	return ( <SidebarDefault { ...sideData.data } /> );
};

export default SideBarPromotion;

SideBarPromotion.propTypes = {
	sideData: PropTypes.object.isRequired,
};
