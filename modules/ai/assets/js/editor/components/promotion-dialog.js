import { Button, DialogActions, Paper, Stack, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import useIntroduction from '../hooks/use-introduction';

const PromotionDialog = ( props ) => {
// 	Const { isViewed, markAsViewed } = useIntroduction( props.introductionKey );
// 	if ( ! isViewed ) {
// 		return null;
// 	}

	return (
		<Paper
			sx={ {
				marginBlock: 4,
			} }
			spacing={ 2 }>
			<Stack
				direction="column">
				<Typography
					variant="subtitle1"
					sx={ { mb: 2 } }
				>
					{ __( 'ELEMENTOR AI' ) }
				</Typography>
				<Typography variant="subtitle2" color="text.secondary">
					{ __( props.header ) }
				</Typography>
				<Typography color="text.secondary">
					{ __( props.contentText ) }
				</Typography>
				<DialogActions>
					<Button
						onClick={ () => {
							// MarkAsViewed();
							props.onClose();
						} } color="secondary">{ __( 'Not Now' ) }</Button>
					<Button onClick={ () => {
						// MarkAsViewed();
						props.onClick();
					} } variant="contained">{ __( 'Try it now' ) }</Button>
				</DialogActions>
			</Stack>
		</Paper>
	);
};
PromotionDialog.propTypes = {
	header: PropTypes.string,
	contentText: PropTypes.string,
	onClick: PropTypes.func,
	onClose: PropTypes.func,
	introductionKey: PropTypes.string,
};

export default PromotionDialog;
