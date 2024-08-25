import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const ChecklistCardContent = ( props ) => {
	const {
			id,
			description,
			learn_more_url: learnMoreUrl,
			learn_more_text: learnMoreText,
			image_src: imageSrc,
			is_locked: isLocked,
			promotion_url: promotionUrl,
			cta_text: cteText,
			cta_url: ctaUrl,
		} = props.step.config,
		ctaText = isLocked ? __( 'Upgrade Now', 'elementor-pro' ) : cteText,
		ctaLink = isLocked ? promotionUrl : ctaUrl,
		isCompleted = props.step.is_completed,
		isMarkedCompleted = props.step.is_marked_completed;

	const redirectHandler = ( url ) => {
		window.open( url, isLocked ? '_blank' : '' );
	};

	const toggleMarkDone = () => {
		if ( isCompleted ) {
			return;
		}

		// TODO: Implement call to DB
		return isCompleted;
	};

	return (
		<Card elevation={ 0 } square={ true } className={ `e-checklist-item-content checklist-step-${ id }` }>
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

				{ ( ! isCompleted || isMarkedCompleted ) && ! isLocked
					? <Button
						size="small"
						color="secondary"
						variant="text"
						className="mark-as-done"
						disabled={ isCompleted }
						onClick={ toggleMarkDone }
					>
						{ isMarkedCompleted ? __( 'Mark as undone', 'elementor' ) : __( 'Mark as done', 'elementor' ) }
					</Button>
					: null
				}

				<Button
					color={ isLocked ? 'promotion' : 'primary' }
					size="small"
					variant="contained"
					className="cta-button"
					onClick={ () => redirectHandler( ctaLink ) }
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
};
