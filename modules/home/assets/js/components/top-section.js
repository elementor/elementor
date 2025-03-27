import { Box, Paper, Stack } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import YoutubeIcon from '../icons/youtube-icon';

const TopSection = ( { ...props } ) => {
	const { topData, buttonCtaUrl } = props;

	if ( ! topData ) {
		return null;
	}

	const {
		title,
		description,
		button_cta_text: buttonCtaTitle,
		button_create_page_title: buttonCreatePageTitle,
		youtube_embed_id: youtubeEmbeddedId,
		button_watch_url: buttonWatchURL,
		button_watch_title: buttonWatchTitle,
	} = topData;

	const ctaButtonTitle = buttonCtaTitle ?? buttonCreatePageTitle;

	return (
		<Paper elevation={ 0 } sx={ { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', py: { xs: 3, md: 3 }, px: { xs: 3, md: 4 }, gap: { xs: 2, sm: 3, lg: 22 } } }>
			<Stack gap={ 3 } justifyContent="center">
				<Box>
					<Typography variant="h6">{ title }</Typography>
					<Typography variant="body2" color="secondary">{ description }</Typography>
				</Box>
				<Box sx={ { display: 'flex', gap: 1 } }>
					<Button data-testid="e-create-button" variant="contained" size="small" href={ buttonCtaUrl } target="_blank">{ ctaButtonTitle }</Button>
					<Button variant="outlined" color="secondary" size="small" startIcon={ <YoutubeIcon /> } href={ buttonWatchURL } target="_blank">{ buttonWatchTitle }</Button>
				</Box>
			</Stack>
			<Box component="iframe"
				src={ `https://www.youtube.com/embed/${ youtubeEmbeddedId }` }
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
	topData: PropTypes.object.isRequired,
	buttonCtaUrl: PropTypes.string.isRequired,
};

export default TopSection;
