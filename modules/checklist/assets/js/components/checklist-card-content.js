import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const ChecklistCardContent = ( { step } ) => {
	const {
		id,
		description,
		learn_more_url: learnMoreUrl,
		learn_more_text: learnMoreText,
		image_src: imageSrc,
		is_locked: isLocked,
		promotion_url: promotionUrl,
		cta_url: ctaUrl,
	} = step.config;

	const ctaText = isLocked ? __( 'Upgrade Now', 'elementor-pro' ) : step.config.cta_text,
		ctaLink = isLocked ? promotionUrl : ctaUrl;

	const redirectHandler = () => {
		window.open( ctaLink, isLocked ? '_blank' : '' );
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

				<Button
					color={ isLocked ? 'promotion' : 'primary' }
					size="small"
					variant="contained"
					className="cta-button"
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
};
