import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';

const ChecklistCardContent = ( { step, setSteps } ) => {
	const {
		id,
		description,
		learn_more_url: learnMoreUrl,
		learn_more_text: learnMoreText,
		image_src: imageSrc,
		is_locked: isLocked,
		promotion_url: promotionUrl,
	} = step.config;

	const ctaText = isLocked ? __( 'Upgrade Now', 'elementor-pro' ) : step.config.cta_text,
		ctaUrl = isLocked ? promotionUrl : step.config.cta_url,
		{ is_absolute_completed: isAbsoluteCompleted, is_immutable_completed: isImmutableCompleted, is_marked_completed: isMarkedCompleted } = step,
		shouldShowMarkAsDone = ! isAbsoluteCompleted && ! isImmutableCompleted && ! isLocked;

	const redirectHandler = () => {
		window.open( ctaUrl, isLocked ? '_blank' : '' );
	};

	const toggleMarkAsDone = async () => {
		const currState = isMarkedCompleted;

		try {
			setSteps( ( steps ) => steps.map( ( iteratedStep ) => updateStepProperty( iteratedStep, 'is_marked_completed', ! currState ) ) );

			await fetch( `${ elementorCommon.config.urls.rest }elementor/v1/checklist/steps/${ id }`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': elementorWebCliConfig.nonce,
				},
				body: JSON.stringify( {
					id,
					is_marked_completed: ! currState,
				} ),
			} );
		} catch ( e ) {
			setSteps( ( steps ) => steps.map( ( iteratedStep ) => updateStepProperty( iteratedStep, 'is_marked_completed', currState ) ) );
		}
	};

	const updateStepProperty = ( iteratedStep, key, value ) => {
		if ( iteratedStep.config.id !== step.config.id ) {
			return iteratedStep;
		}

		return { ...iteratedStep, [ key ]: value };
	};

	return (
		<Card elevation={ 0 } square={ true } data-step-id={ id }>
			<CardMedia
				image={ imageSrc }
				sx={ { height: 180 } }
			/>
			<CardContent>
				<Typography variant="body2" color="text.secondary" component="p">
					{ description + ' ' }
					<Link href={ learnMoreUrl } target="_blank" rel="noreferrer" underline="hover" color="info.main"> { learnMoreText } </Link>
				</Typography>
			</CardContent>
			<CardActions>

				{ shouldShowMarkAsDone
					? <Button
							size="small"
							color="secondary"
							variant="text"
							onClick={ toggleMarkAsDone }
					>
						{ isMarkedCompleted ? __( 'Unmark as done', 'elementor' ) : __( 'Mark as done', 'elementor' ) }
					</Button>
					: null
				}

				<Button
					color={ isLocked ? 'promotion' : 'primary' }
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

export default ChecklistCardContent;

ChecklistCardContent.propTypes = {
	step: PropTypes.object.isRequired,
	setSteps: PropTypes.func.isRequired,
};
