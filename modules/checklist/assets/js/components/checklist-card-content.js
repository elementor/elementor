import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const ChecklistCardContent = ( props ) => {
	const { description, link, CTA, id, imagePath } = props.step;

	return (
		<Card elevation={ 0 } square={ true } className={ `e-checklist-item-content checklist-step-${ id }` }>
			<CardMedia
				image={ imagePath }
				sx={ { height: 180 } }
			/>
			<CardContent>
				<Typography variant="body2" color="text.secondary" component="p">
					{ description + ' ' }
					<Link href={ link } target="_blank" rel="noreferrer" underline="hover" color="info.main">Learn more</Link>
				</Typography>
			</CardContent>
			<CardActions>
				<Button size="small" color="secondary" variant="text" className="mark-as-done">{ __( 'Mark as done', 'elementor' ) }</Button>
				<Button size="small" variant="contained" className="cta-button">{ CTA }</Button>
			</CardActions>
		</Card>
	);
};

export default ChecklistCardContent;

ChecklistCardContent.propTypes = {
	step: PropTypes.object.isRequired,
};
