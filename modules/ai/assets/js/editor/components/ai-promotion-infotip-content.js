import {
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

const AiPromotionInfotipContent = ( props ) => {
	return (
		<Card sx={ { maxWidth: 345, width: 300 } }>
			<CardHeader subheader="ELEMENTOR UI" />
			<CardContent>
				<Typography variant="subtitle2" color="text.secondary">
					{ props.header }
				</Typography>
				<Typography color="text.secondary">
					{ props.contentText }
				</Typography>
			</CardContent>
			<CardActions disableSpacing sx={ { justifyContent: 'flex-end', gap: 1 } } >
				<Button
					onClick={ () => {
						props.onClose();
					} } color="secondary">{ __( 'Not Now', 'elementor' ) }</Button>
				<Button onClick={ () => {
					props.onClick();
				} } variant="contained">{ __( 'Try it now', 'elementor' ) }</Button>
			</CardActions>
		</Card> );
};
AiPromotionInfotipContent.propTypes = {
	header: PropTypes.string,
	contentText: PropTypes.string,
	onClick: PropTypes.func,
	onClose: PropTypes.func,
};

export default AiPromotionInfotipContent;
