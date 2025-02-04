import { Box, Paper } from '@elementor/ui';
import Link from '@elementor/ui/Link';

const SidebarBanner = ( { image, link } ) => {
	return (
		<Paper elevation={ 0 } sx={ { overflow: 'hidden' } }>
			<Link
				target="_blank"
				href={ link }
				sx={
					{
						display: 'block',
						width: '100%',
						height: '100%',
						boxShadow: 'none',
						outline: 'none',
						'&:focus': {
							outline: 'none',
							boxShadow: 'none',
						},
						'&:active': {
							outline: 'none',
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
