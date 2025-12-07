import { Box, Paper } from '@elementor/ui';
import Link from '@elementor/ui/Link';
import { trackPromoClick, getHomeScreenPath } from '../../../utils/promo-tracking';

const SidebarBanner = ( { image, link } ) => {
	const handleClick = () => {
		trackPromoClick( 'Sidebar Banner', link, getHomeScreenPath( 'sidebar' ) );
	};

	return (
		<Paper elevation={ 0 } sx={ { overflow: 'hidden' } }>
			<Link
				target="_blank"
				href={ link }
				onClick={ handleClick }
				sx={
					{
						lineHeight: 0,
						display: 'block',
						width: '100%',
						height: '100%',
						boxShadow: 'none',
						'&:focus': {
							boxShadow: 'none',
						},
						'&:active': {
							boxShadow: 'none',
						},
					}
				}
			>
				<Box component={ 'img' } src={ image } sx={
					{
						width: '100%',
						height: '100%',
					}
				}></Box>
			</Link>
		</Paper>
	);
};

export default SidebarBanner;

SidebarBanner.propTypes = {
	image: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
};
