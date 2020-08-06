import Dialog from '../ui/dialog/dialog';
import DialogTitle from '../ui/dialog/dialog-title';
import DialogButton from '../ui/dialog/dialog-button';
import DialogText from '../ui/dialog/dialog-text';
import DialogActions from '../ui/dialog/dialog-actions';
import DialogContent from '../ui/dialog/dialog-content';

export default function ErrorDialog( props ) {
	return (
		<Dialog>
			<DialogContent>
				<DialogTitle>{ props.title }</DialogTitle>
				<DialogText>{ props.text }</DialogText>
			</DialogContent>
			<DialogActions>
				<DialogButton text={ props.backButtonText } onClick={ props.backButtonHandler } tabIndex="2"/>
				<DialogButton
					text={ props.learnButtonText }
					url={ props.learnButtonUrl }
					tabIndex="1"
					color="link"
					target="_blank"
				/>
			</DialogActions>
		</Dialog>
	);
}

ErrorDialog.propTypes = {
	title: PropTypes.string,
	text: PropTypes.string,
	learnButtonUrl: PropTypes.string,
	learnButtonText: PropTypes.string,
	backButtonHandler: PropTypes.func,
	backButtonText: PropTypes.string,
};

ErrorDialog.defaultProps = {
	title: __( 'Theme Builder could not be loaded', 'elementor' ),
	text: __( 'We’re sorry, but something went wrong. Click on ‘Learn more’ and follow each of the steps to quickly solve it.', 'elementor' ),
	learnButtonUrl: 'https://go.elementor.com/app-theme-builder-load-issue',
	learnButtonText: __( 'Learn More', 'elementor' ),
	backButtonHandler: () => history.back(),
	backButtonText: __( 'Go Back', 'elementor' ),
};
