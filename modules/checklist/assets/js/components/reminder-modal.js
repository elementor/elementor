import { Button, Card, CardActions, CardContent, Typography } from '@elementor/ui';

const ReminderModal = ( { setOpen } ) => {
	const openChecklist = () => {
		setOpen( false );
	};

	const closeChecklist = () => {
		setOpen( false );
	}

	return (
			<Card elevation={ 0 } sx={ { maxWidth: 336, backgroundColor:'common.white'} }>
				<CardContent>
					<Typography variant="subtitle2" color="primary.contrastText" sx={{mb: 2}}>Looking for your Launchpad Checklist?</Typography>
					<Typography variant="body2" color="secondary.contrastText">
						Click the launch icon to continue setting up your site.
					</Typography>
				</CardContent>
				<CardActions>
					<Button size="small" color="secondary" onClick={ closeChecklist }>Not Now</Button>
					<Button size="small" variant="contained" sx={{ color:'primary.contrastText' }} onClick={ openChecklist }>Let’s do it </Button>
				</CardActions>
			</Card>
	)
}

export default ReminderModal
