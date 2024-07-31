import React, { useState } from 'react';
import {
	styled,
	Button,
	Card,
	CardHeader,
	CardContent,
	CardActions,
	Typography,
	Checkbox,
	IconButton,
	IconButtonProps,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText, Collapse, Stack,
} from '@elementor/ui';

// Check why elementor/icons is not installed
import { ChevronDownIcon, CheckedCircleIcon } from '@elementor/icons';
import CardMedia from '@elementor/ui/CardMedia';

function CheckListItem( props ) {
	const { id, title, imagePath, description, link, CTA } = props.step,
		[ expanded, setExpanded ] = React.useState( false ),
		[ checked, setChecked ] = React.useState( [ 0 ] );

	const handleToggle = ( value ) => () => {
		const currentIndex = checked.indexOf( value );
		const newChecked = [ ...checked ];

		if ( -1 === currentIndex ) {
			newChecked.push( value );
		} else {
			newChecked.splice( currentIndex, 1 );
		}

		setChecked( newChecked );
	};

	const handleExpandClick = () => {
		setExpanded( ! expanded );
	};

	return (
		<>
			<ListItem
				sx={ { margin: 0 } }
				divider={ true }
				key={ id }
				secondaryAction={
					<Stack>
						<IconButton onClick={ () => handleExpandClick( id ) } edge="end" aria-label="comments">
							{ expanded ? <ChevronDownIcon sx={ { transform: 'rotate(180deg)' } } /> : <ChevronDownIcon /> }
						</IconButton>
					</Stack>
				}
				disablePadding
			>
				<ListItemButton role={ 'checkbox' } onClick={ handleToggle( id ) }>
					<ListItemIcon>
						<Checkbox
							icon={ <CheckedCircleIcon /> }
							checkedIcon={ <CheckedCircleIcon color="primary" /> }
							edge="start"
							checked={ checked.indexOf( id ) !== -1 }
							tabIndex={ -1 }
							inputProps={ { 'aria-labelledby': title } }
						/>
					</ListItemIcon>
					<ListItemText id={ title } primary={ title } />
				</ListItemButton>
			</ListItem>
			<Collapse in={ expanded } timeout="auto" unmountOnExit>
				<Card
					sx={ {
						border: 'none',
						boxShadow: 'none',
						backgroundColor: 'transparent',
						borderRadius: 0,
					} }
				>
					<CardMedia
						component="img"
						height="194"
						image={ imagePath }
						alt={ title }
					/>
					<CardContent

					>
						<Typography variant="body2" color="text.secondary" component="p">
							{ description + ' ' }
							<a href={ link } target="_blank" rel="noreferrer">Learn more</a>
						</Typography>
					</CardContent>
					<CardActions >
						<Stack>
							<Button size="small">
								Mark as completed
							</Button>
							<Button size="small" color="primary">
								{ CTA }
							</Button>
						</Stack>
					</CardActions>
				</Card>
			</Collapse>
		</>
	);
}

export default CheckListItem;
