import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import { getAndUpdateStep } from '../../utils/functions';
import { STEP, STEP_IDS_TO_COMPLETE_IN_EDITOR, PANEL_ROUTES } from '../../utils/consts';

const { IS_MARKED_COMPLETED, IS_ABSOLUTE_COMPLETED, IS_IMMUTABLE_COMPLETED } = STEP;

const ChecklistCardContent = ( { step, setSteps } ) => {
	const {
		id,
		description,
		learn_more_url: learnMoreUrl,
		learn_more_text: learnMoreText,
		image_src: imageSrc,
		promotion_data: promotionData,
	} = step.config;

	const ctaText = promotionData
			? promotionData?.text || __( 'Upgrade Now', 'elementor' )
			: step.config.cta_text,
		ctaUrl = promotionData ? promotionData.url : step.config.cta_url,
		{
			[ IS_ABSOLUTE_COMPLETED ]: isAbsoluteCompleted,
			[ IS_IMMUTABLE_COMPLETED ]: isImmutableCompleted,
			[ IS_MARKED_COMPLETED ]: isMarkedCompleted,
		} = step,
		shouldShowMarkAsDone = ! isAbsoluteCompleted && ! isImmutableCompleted && ! promotionData;

	const redirectHandler = async () => {
		if ( ! elementor || ! STEP_IDS_TO_COMPLETE_IN_EDITOR.includes( id ) || ! PANEL_ROUTES[ id ] ) {
			return window.open( ctaUrl, promotionData ? '_blank' : '_self' );
		}

		await $e.run( 'panel/global/open' );
		$e.route( PANEL_ROUTES[ id ] );
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
					color={ promotionData ? 'promotion' : 'primary' }
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
