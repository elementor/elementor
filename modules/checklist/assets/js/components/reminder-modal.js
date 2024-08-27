import { ThemeProvider, Button, Card, CardActions, CardContent, Typography } from '@elementor/ui';


const ReminderModal = ( { setOpen } ) => {
	const openChecklist = () => {
		setOpen( false );
	};

	const closeChecklist = (e) => {
		e.stopPropagation();
		setOpen( false );
	}

	return (
		// <ThemeProvider colorScheme="light">
			<Card elevation={ 0 } sx={ { maxWidth: 336 } }>
				<CardContent>
					<Typography variant="subtitle2"
					            // color="primary.contrastText"
					            sx={ { mb: 2 } }>Looking for your Launchpad Checklist?</Typography>
					<Typography variant="body2"
					            // color="text.disabled"
					>
						Click the launch icon to continue setting up your site.
					</Typography>
				</CardContent>
				<CardActions>
					<Button size="small" variant="text" color="secondary"
					    //     sx={ { color: 'text.disabled', '&:hover': {
						// 	backgroundColor: '#F1F2F3',
						// 	color: 'text.disabled'
						// } } }
					        onClick={ ( e ) => { closeChecklist( e ) } }>Not Now</Button>
					<Button size="small" variant="contained"
					        // sx={ { color: 'primary.contrastText' } }
					        onClick={ openChecklist }>Let’s do it </Button>
				</CardActions>
			</Card>
		// </ThemeProvider>
	)
}

export default ReminderModal
