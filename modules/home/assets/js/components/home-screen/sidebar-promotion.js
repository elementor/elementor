import { Box } from '@elementor/ui';
import SidebarBanner from './promotions/sidebar-banner';
import SidebarDefault from './promotions/sidebar-default';

const SideBarPromotion = ( { sideData } ) => {
	return (
		<>
			<Box sx={ { p: 2, mb: 2, bgcolor: 'warning.light', color: 'warning.contrastText', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' } }>
				<div><strong>DEBUG SideBarPromotion:</strong></div>
				<div>sideData exists: { sideData ? 'true' : 'false' }</div>
				<div>sideData.type: { sideData?.type || 'undefined' }</div>
				<div>sideData.is_enabled: { sideData?.is_enabled || 'undefined' }</div>
				<div>sideData.license: { JSON.stringify( sideData?.license ) || 'undefined' }</div>
				<div>Full sideData: { JSON.stringify( sideData, null, 2 ) }</div>
			</Box>
			{ 'banner' === sideData?.type ? (
				<SidebarBanner { ...sideData.data } />
			) : (
				<SidebarDefault { ...sideData.data } />
			) }
		</>
	);
};

export default SideBarPromotion;

SideBarPromotion.propTypes = {
	sideData: PropTypes.object.isRequired,
};
