import { Box, Stack } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import YoutubeIcon from '../icons/youtube-icon';

const TopSection = ( { ctaUrl, videoUrl, embedUrl } ) => {
	return (
		<Stack direction={ { xs: 'column', md: 'row' } } sx={ { backgroundColor: 'background.default', p: { xs: 2, md: 4 }, borderRadius: 1 } }>
			<Box sx={ { display: 'flex', flexDirection: 'column', pr: { xs: 0, md: 10 }, pb: 3, gap: 3 } }>
				<Box>
					<Typography variant="body2">{ __( 'Hi!', 'elementor' ) }</Typography>
					<Typography variant="h6">{ __( 'Welcome to Elementor', 'elementor' ) }</Typography>
					<Typography variant="body2" >{ __( 'Get introduced to Elementor by watching our &ldquo;Getting Started&rdquo; video series. It will guide you through the steps needed to create your website. Then click to create your first page.', 'elementor' ) }</Typography>
				</Box>
				<Box sx={ { display: 'flex', gap: 1 } }>
					<Button variant="contained" size="small" href={ ctaUrl } target="_blank" >{ __( 'Create a Page', 'elementor' ) }</Button>
					<Button variant="outlined" color="secondary" size="small" startIcon={ <YoutubeIcon /> } href={ videoUrl } target="_blank">{ __( 'Watch a quick starter', 'elementor' ) }</Button>
				</Box>
			</Box>
			<Box component="iframe"
				src={ embedUrl }
				title="YouTube video player"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen={ true }
				sx={ { aspectRatio: '16/9', borderRadius: 1, display: 'flex', width: '100%', maxWidth: '365px' } }>
			</Box>
		</Stack>
	);
};

TopSection.propTypes = {
	ctaUrl: PropTypes.string.isRequired,
	videoUrl: PropTypes.string.isRequired,
	embedUrl: PropTypes.string.isRequired,
	topData: PropTypes.object.isRequired,
	createNewPageUrl: PropTypes.string.isRequired,
};

export default TopSection;
