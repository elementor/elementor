import { Button, Card, CardActions, CardContent, CardHeader, Typography } from '@elementor/ui';

const ReminderModal = () => {
	const openChecklist = () => {
		setHasRoot(true)
		$e.run( 'checklist/toggle-popup' );
	};

	const closeChecklist = () => {
		close();
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
					<Button size="small" color="secondary" onClick={ close }>Not Now</Button>
					<Button size="small" variant="contained" sx={{ color:'primary.contrastText' }} onClick={ ()=>{
						openChecklist()} }>Let’s do it </Button>
				</CardActions>
			</Card>
	)
}

export default ReminderModal
