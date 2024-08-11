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
		[ expanded, setExpanded ] = React.useState( false );

	const handleExpandClick = () => {
		setExpanded( ! expanded );
	};

	return (
		<>
			<ListItemButton onClick={ () => handleExpandClick( id ) } sx={ {
				'&.MuiButtonBase-root:hover': {
					bgcolor: 'transparent',
				},
			} }>
				<ListItemIcon> <RadioButtonUncheckedIcon /> </ListItemIcon>
				<ListItemText id={ title } primary={ <Typography variant="body2">{ title }</Typography> } />
				{ expanded ? <ChevronDownIcon sx={ { transform: 'rotate(180deg)' } } /> : <ChevronDownIcon /> }
			</ListItemButton>
			<Collapse in={ expanded } >
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
	step: PropTypes.object,
	id: PropTypes.string,
	title: PropTypes.string,
	description: PropTypes.string,
	link: PropTypes.string,
	CTA: PropTypes.string,
};
