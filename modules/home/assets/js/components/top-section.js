import { Box, Paper } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import StyledYoutubeIcon from '../icons/youtube-icon';

const TopSection = ( { ctaUrl, videoUrl, embedUrl } ) => {
	return (
		<Paper elevation={ 0 } sx={ { display: 'flex', flexDirection: { xs: 'column', md: 'row' }, bgcolor: 'theme.palette.background.default', p: 4 } }>
			<Box sx={ { pr: { xs: 0, md: 3 } } }>
				<Box sx={ { display: 'flex', flexDirection: 'column', maxWidth: '600px', pb: 2 } }>
					<Typography variant="body2">Hi!</Typography>
					<Typography variant="h6">Welcome to Elementor</Typography>
					<Typography variant="body2" >Get introduced to Elementor by watching our &ldquo;Getting Started&rdquo; video series. It will guide you through the steps needed to create your website. Then click to create your first page.</Typography>
				</Box>
				<Box>
					<Button variant="contained" size="small" href={ ctaUrl } target="_blank" sx={ { mr: 1, mb: 1 } }>
						<Typography variant="button">Create a Page</Typography>
					</Button>
					<Button variant="outlined" color="secondary" size="small" startIcon={ <StyledYoutubeIcon /> } href={ videoUrl } target="_blank" sx={ { mb: 1 } }>
						<Typography variant="button">Watch a quick starter</Typography>
					</Button>
				</Box>
			</Box>
			<Box sx={ { aspectRatio: '16/9' } }>
				<iframe
					src={ embedUrl }
					title="YouTube video player"
					frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen={ true }
					style={ { borderRadius: '4px', height: '100%', width: '100%', display: 'flex'} }>
				</iframe>
			</Box>
		</Paper>
	);
};

TopSection.propTypes = {
	ctaUrl: PropTypes.string.isRequired,
	videoUrl: PropTypes.string.isRequired,
	embedUrl: PropTypes.string.isRequired,
};

export default TopSection;
