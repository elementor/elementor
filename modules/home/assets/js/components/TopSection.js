import { Box, Paper } from '@elementor/ui';
import Typography from '@elementor/ui/Typography';
import Button from '@elementor/ui/Button';
import YoutubeIcon from './icons/youtube-icon';
const TopSection = ({topScreenProps}) => {
	return (
		<Paper justifyContent="space-between" alignItems="flex-start" gap={ 4 } elevation={ 0 } sx={ { display: 'flex', flexDirection: 'row', bgcolor: 'theme.palette.background.default', width: '80%', marginX: 'auto', mt: 6 } }>
			<Box ml={ 4 } my={ 6 }>
				<Box gap={ 1 } sx={ { display: 'flex', flexDirection: 'column', width: '70%', mb: 3 } }>
					<Typography variant="body2">Hi!</Typography>
					<Typography variant="h6">Welcome to Elementor</Typography>
					<Typography variant="body2" >Get introduced to Elementor by watching our "Getting Started" video series. It will guide you through the steps needed to create your website. Then click to create your first page.</Typography>
				</Box>
				<Box>
					<Button variant="contained" size="small" sx={ { mr: 1 } } href={ topScreenProps.ctaUrl } target="_blank">
						<Typography variant="button">Create a Page</Typography>
					</Button>
					<Button variant="outlined" color="secondary" size="small" startIcon={ <YoutubeIcon /> } href={ topScreenProps.videoUrl } target="_blank">
						<Typography variant="button">Watch a quick starter</Typography>
					</Button>
				</Box>
			</Box>
			<Box justifyContent="flex-end" my={ 8 } mr={ 4 }>
				<iframe
					width="560" height="315"
					src={ topScreenProps.embedUrl }
					title="YouTube video player" frameBorder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
					style={ { borderRadius: '5px' } }>
				</iframe>
			</Box>
		</Paper>
	);
};
export default TopSection;
