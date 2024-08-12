import { useState } from 'react';
import PropTypes from 'prop-types';
import {
	Button,
	Card,
	CardContent,
	CardActions,
	Typography,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Collapse,
	CardMedia,
	Link,
} from '@elementor/ui';
import { ChevronDownIcon, RadioButtonUncheckedIcon } from '@elementor/icons';

function CheckListItem( props ) {
	const { title, description, link, CTA } = props.step,
		{ expandedIndex, setExpandedIndex, index } = props,
		[ expanded, setExpanded ] = useState( false );

	const handleExpandClick = () => {
		setExpanded( ! expanded );
	};

	return (
		<>
			<ListItemButton onClick={ () => {
				setExpandedIndex( index );
				handleExpandClick();
			} } >
				<ListItemIcon> <RadioButtonUncheckedIcon /> </ListItemIcon>
				<ListItemText id={ title } primary={ title } primaryTypographyProps={ { variant: 'body2' } } />
				{ index === expandedIndex && expanded ? <ChevronDownIcon sx={ { transform: 'rotate(180deg)' } } /> : <ChevronDownIcon /> }
			</ListItemButton>
			<Collapse in={ index === expandedIndex && expanded } >
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
	title: PropTypes.string.isRequired,
	description: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	CTA: PropTypes.string.isRequired,
	expandedIndex: PropTypes.number.isRequired,
	setExpandedIndex: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
};
