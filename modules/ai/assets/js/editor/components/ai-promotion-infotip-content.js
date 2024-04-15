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
		<Card sx={ { width: 300 } } elevation={ 0 }>
			<CardHeader subheader="ELEMENTOR AI" />
			<CardContent sx={ { pt: 1 } }>
				<Typography variant="subtitle2" color="text.secondary" sx={ { pb: 0.5 } }>
					{ props.header }
				</Typography>
				<Typography variant="body2" color="text.secondary">
					{ props.contentText }
				</Typography>
			</CardContent>
			<CardActions disableSpacing sx={ { justifyContent: 'flex-end', gap: 1 } } >
				<Button
					onClick={ () => props.onClose() } color="secondary">{ __( 'Not Now', 'elementor' ) }</Button>
				<Button onClick={ () => props.onClick() } variant="contained">{ __( 'Try it now', 'elementor' ) }</Button>
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
