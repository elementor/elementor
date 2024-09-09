import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@elementor/ui';
import PropTypes from "prop-types";
import ChecklistCardContent from "./checklist-card-content";

const SuccessMessage = ( props ) => {
	const {
		id,
		description,
		title,
		image_src: imageSrc,
		cta_text: ctaText,
	} = props.step.config;

	const redirectHandler = () => {
		$e.run( 'document/elements/settings', {
			container: elementor.settings.editorPreferences.getEditedView().getContainer(),
			settings: {
				show_launchpad_checklist: '',
			},
			options: {
				external: true,
			},
		} )
	};

	return (
		<Card elevation={ 0 } square={ true } data-step-id={ id }>
			<CardMedia
				image={ imageSrc }
				sx={ { height: 180 } }
			/>
			<CardContent sx={ { textAlign: 'center' } }>
				<Typography variant="h6" color="text.primary">{ title }</Typography>
				<Typography variant="body2" color="text.secondary" component="p">
					{ description + ' ' }
				</Typography>
			</CardContent>
			<CardActions sx={ { justifyContent: 'center' } }>
				<Button
					color="primary"
					size="small"
					variant="contained"
					onClick={ redirectHandler }
				>
					{ ctaText }
				</Button>
			</CardActions>
		</Card>
	);
};

export default SuccessMessage;

SuccessMessage.propTypes = {
	step: PropTypes.object.isRequired,
};
