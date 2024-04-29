import { Box } from '@elementor/ui';
import { WrapperWithLink } from './wrapper-with-link';

export const WhatsNewItemThumbnail = ( { imageSrc, title, link } ) => {
	return (
		<Box
			sx={ {
				pb: 2,
			} }
		>
			<WrapperWithLink link={ link }>
				<img
					src={ imageSrc }
					alt={ title }
					style={ { maxWidth: '100%' } }
				/>
			</WrapperWithLink>
		</Box>
	);
};

WhatsNewItemThumbnail.propTypes = {
	imageSrc: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	link: PropTypes.string,
};
