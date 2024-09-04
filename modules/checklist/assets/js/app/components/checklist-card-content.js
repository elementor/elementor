import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { getAndUpdateStep } from '../../utils/functions';
import { STEP } from '../../utils/consts';

const { IS_MARKED_COMPLETED, IS_ABSOLUTE_COMPLETED, IS_IMMUTABLE_COMPLETED } = STEP;

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
		{
			[ IS_ABSOLUTE_COMPLETED ]: isAbsoluteCompleted,
			[ IS_IMMUTABLE_COMPLETED ]: isImmutableCompleted,
			[ IS_MARKED_COMPLETED ]: isMarkedCompleted,
		} = step,
		shouldShowMarkAsDone = ! isAbsoluteCompleted && ! isImmutableCompleted && ! isLocked;

	const redirectHandler = () => {
		window.open( ctaUrl, isLocked ? '_blank' : '_self' );
	};

	const toggleMarkAsDone = async () => {
		const currState = isMarkedCompleted;

		try {
			updateStepsState( IS_MARKED_COMPLETED, ! currState );

			await $e.data.update( `checklist/steps`, {
				id,
				[ IS_MARKED_COMPLETED ]: ! currState,
			}, { id } );
		} catch ( e ) {
			updateStepsState( IS_MARKED_COMPLETED, currState );
		}
	};

	const updateStepsState = ( key, value ) => {
		setSteps( ( steps ) => steps.map( ( iteratedStep ) => getAndUpdateStep( step.config.id, iteratedStep, key, value ) ) );
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
