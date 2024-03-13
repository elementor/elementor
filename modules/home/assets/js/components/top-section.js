import { Box, Paper, Stack } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import YoutubeIcon from '../icons/youtube-icon';

const TopSection = ( props ) => {
	return (
		<Paper elevation={ 0 } sx={ { display: 'flex', flexDirection: { xs: 'column', md: 'row' }, p: { xs: 2, md: 4 }, gap: 3 } }>
			<Stack gap={ 3 }>
				<Box>
					<Typography variant="body2">{ __( 'Hi!', 'elementor' ) }</Typography>
					<Typography variant="h6">{ __( 'Welcome to Elementor', 'elementor' ) }</Typography>
					<Typography variant="body2" >{ __( 'Get introduced to Elementor by watching our &ldquo;Getting Started&rdquo; video series. It will guide you through the steps needed to create your website. Then click to create your first page.', 'elementor' ) }</Typography>
				</Box>
				<Box sx={ { display: 'flex', gap: 1 } }>
					<Button variant="contained" size="small" href={ props.createNewPageUrl } target="_blank">{ __( 'Create a Page', 'elementor' ) }</Button>
					<Button variant="outlined" color="secondary" size="small" startIcon={ <YoutubeIcon /> } href={ props.videoUrl } target="_blank">{ __( 'Watch a quick starter', 'elementor' ) }</Button>
				</Box>
			</Stack>
			<Box component="iframe"
				src={ props.embedUrl }
				title="YouTube video player"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowFullScreen={ true }
				sx={ { aspectRatio: '16/9', borderRadius: 1, display: 'flex', width: '100%', maxWidth: '365px' } }>
			</Box>
		</Paper>
	);
};

TopSection.propTypes = {
	videoUrl: PropTypes.string.isRequired,
	embedUrl: PropTypes.string.isRequired,
	topData: PropTypes.object.isRequired,
	createNewPageUrl: PropTypes.string.isRequired,
};

export default TopSection;
