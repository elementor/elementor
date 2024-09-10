import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@elementor/ui';

const SuccessMessage = () => {
	const hideChecklist = () => {
		$e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				show_launchpad_checklist: '',
			},
			options: {
				external: true,
			},
		} );
	};

	return (
		<Card elevation={ 0 } square={ true } className="all_done">
			<CardMedia
				image="https://assets.elementor.com/checklist/v1/images/checklist-step-7.jpg"
				sx={ { height: 180 } }
			/>
			<CardContent sx={ { textAlign: 'center' } }>
				<Typography variant="h6" color="text.primary">You&apos;re on your way!</Typography>
				<Typography variant="body2" color="text.secondary" component="p">
					With these steps, you&apos;ve got a great base for a robust website. Enjoy your web creation journey!
				</Typography>
			</CardContent>
			<CardActions sx={ { justifyContent: 'center' } }>
				<Button
					color="primary"
					size="small"
					variant="contained"
					onClick={ hideChecklist }
				>
					Got it
				</Button>
			</CardActions>
		</Card>
	);
};

export default SuccessMessage;
