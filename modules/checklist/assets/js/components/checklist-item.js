import React, { useState } from 'react';
import {
	Button,
	Card,
	CardContent,
	CardActions,
	Typography,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Collapse
} from '@elementor/ui';

import { ChevronDownIcon, CheckedCircleIcon } from '@elementor/icons';
import RadioButtonUncheckedIcon from "@elementor/icons/RadioButtonUncheckedIcon";
import CardMedia from '@elementor/ui/CardMedia';
// import image from '../media/step-3.png';

function CheckListItem( props ) {
	const { id, title, imagePath, description, link, CTA } = props.step,
		[ expanded, setExpanded ] = React.useState( false );

	const handleExpandClick = () => {
		setExpanded( ! expanded );
	};

	return (
		<>
			<ListItemButton onClick={ () => handleExpandClick( id ) } sx={{
				"&.MuiButtonBase-root:hover": {
					bgcolor: "transparent"
				}
			}}>
				<ListItemIcon> <RadioButtonUncheckedIcon/> </ListItemIcon>
				<ListItemText id={ title } primary={ <Typography variant="body2">{title}</Typography> } />
				{ expanded ? <ChevronDownIcon sx={ { transform: 'rotate(180deg)'} } /> : <ChevronDownIcon /> }
			</ListItemButton>
			<Collapse in={ expanded } >
				<Card elevation={ 0 } square="true" sx={ { pt:1 } }>
					<CardMedia
						image="https://drive.google.com/drive/folders/10Z85-M37gKVcyiQ8Td2hOI0z2DJ-G1OS"
						sx={ { height: 190 } }
					/>
					<CardContent>
						<Typography variant="body2" color="text.secondary" component="p">
							{ description + ' ' }
							<a href={ link } target="_blank" rel="noreferrer">Learn more</a>
						</Typography>
					</CardContent>
					<CardActions>
						<Button color="secondary">Mark as completed</Button>
						<Button variant="contained">{ CTA }</Button>
					</CardActions>
				</Card>
			</Collapse>
		</>
	);
}

export default CheckListItem;
