import { Box, Stack } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import YoutubeIcon from '../icons/youtube-icon';

const TopSection = ( { ctaUrl, videoUrl, embedUrl } ) => {
	return (
		<Stack direction={ { xs: 'column', md: 'row' } } sx={ { backgroundColor: 'background.default', p: { xs: 2, md: 4 } } }>
			<Box sx={ { display: 'flex', flexDirection: 'column', pr: { xs: 0, md: 10 }, pb: 3, gap: 3 } }>
				<Box>
					<Typography variant="body2">Hi!</Typography>
					<Typography variant="h6">Welcome to Elementor</Typography>
					<Typography variant="body2" >Get introduced to Elementor by watching our &ldquo;Getting Started&rdquo; video series. It will guide you through the steps needed to create your website. Then click to create your first page.</Typography>
				</Box>
				<Box sx={ { display: 'flex', gap: 1 } }>
					<Button variant="contained" size="small" href={ ctaUrl } target="_blank" >Create a Page</Button>
					<Button variant="outlined" color="secondary" size="small" startIcon={ <YoutubeIcon /> } href={ videoUrl } target="_blank">Watch a quick starter</Button>
				</Box>
			</Box>
			<Box component="iframe"
				src={ embedUrl }
				title="YouTube video player"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen={ true }
				sx={ { aspectRatio: '16/9', borderRadius: '4px', display: 'flex', height: '100%', width: '100%', maxWidth: '365px', maxHeigth: '205px' } }>
			</Box>
		</Stack>
	);
};

TopSection.propTypes = {
	ctaUrl: PropTypes.string.isRequired,
	videoUrl: PropTypes.string.isRequired,
	embedUrl: PropTypes.string.isRequired,
};

export default TopSection;
