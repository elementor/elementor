import { useState } from 'react';
import Button from '@elementor/ui/Button';
import Card from '@elementor/ui/Card';
import CardContent from '@elementor/ui/CardContent';
import CardActions from '@elementor/ui/CardActions';
import Typography from '@elementor/ui/Typography';
import ListItemButton from '@elementor/ui/ListItemButton';
import ListItemIcon from '@elementor/ui/ListItemIcon';
import ListItemText from '@elementor/ui/ListItemText';
import Collapse from '@elementor/ui/Collapse';
import ChevronDownIcon from '@elementor/icons/ChevronDownIcon';
import RadioButtonUncheckedIcon from '@elementor/icons/RadioButtonUncheckedIcon';
import CardMedia from '@elementor/ui/CardMedia';
import Link from '@elementor/ui/Link';

function CheckListItem( props ) {
	const { id, title, description, link, CTA } = props.step,
		{ expandedIndex, setExpandedIndex } = props,
		[ expanded, setExpanded ] = useState( false );

	const handleExpandClick = () => {
		setExpanded( ! expanded );
	};

	return (
		<>
			<ListItemButton onClick={ () => {
				setExpandedIndex( id );
				handleExpandClick();
			} } >
				<ListItemIcon> <RadioButtonUncheckedIcon /> </ListItemIcon>
				<ListItemText id={ title } primary={ title } primaryTypographyProps={ { variant: 'body2' } } />
				{ id === expandedIndex && expanded ? <ChevronDownIcon sx={ { transform: 'rotate(180deg)' } } /> : <ChevronDownIcon /> }
			</ListItemButton>
			<Collapse in={ id === expandedIndex && expanded } >
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
			</Collapse>
		</>
	);
}

export default CheckListItem;

CheckListItem.propTypes = {
	step: PropTypes.object.isRequired,
	id: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	CTA: PropTypes.string.isRequired,
	expandedIndex: PropTypes.string.isRequired,
	setExpandedIndex: PropTypes.func.isRequired,
};
