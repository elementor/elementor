import { Button, Card, CardActions, CardContent, CardMedia, Link, Typography } from '@elementor/ui';
import PropTypes from 'prop-types';

const ChecklistCardContent = ( props ) => {
	const { description, link, CTA } = props.step;

	return (
		<Card elevation={ 0 } square={ true }>
			<CardMedia
				image="https://elementor.com/cdn-cgi/image/f=auto,w=1100/https://elementor.com/wp-content/uploads/2022/01/Frame-10879527.png"
				sx={ { height: 180 } }
			/>
			<CardContent>
				<Typography variant="body2" color="text.secondary" component="p">
					{ description + ' ' }
					<Link href={ link } target="_blank" rel="noreferrer" underline="hover" color="info.main">Learn more</Link>
				</Typography>
			</CardContent>
			<CardActions>
				<Button size="small" color="secondary" variant="text">{ __( 'Mark as done', 'elementor' ) }</Button>
				<Button size="small" variant="contained">{ CTA }</Button>
			</CardActions>
		</Card>
	);
};

export default ChecklistCardContent;

ChecklistCardContent.propTypes = {
	step: PropTypes.object.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	link: PropTypes.string,
	CTA: PropTypes.string,
};
