import Button from 'elementor-app/ui/molecules/button';
import DialogContent from './dialog-content';
import DialogTitle from './dialog-title';
import DialogText from './dialog-text';
import DialogActions from './dialog-actions';
import DialogButton from './dialog-button';

import './dialog.scss';

export default function Dialog( props ) {
	let WrapperTag = 'div';

	if ( props.onSubmit ) {
		WrapperTag = 'form';
	}

	return (
		<section className="eps-modal__overlay">
			{
				props.onClose &&
				<Button
					onClick={ props.onClose }
					text={ __( 'Close', 'elementor' ) }
					hideText={ true }
					icon="eicon-close"
					className="eps-dialog__x"
				/>
			}
			<WrapperTag className="eps-modal eps-dialog" onSubmit={ props.onSubmit }>
				<DialogContent>
					{ props.title && <DialogTitle>{ props.title }</DialogTitle> }
					{ props.text && <DialogText>{ props.text }</DialogText> }
					{ props.children }
				</DialogContent>
				<DialogActions>
					<DialogButton
						key="dismiss"
						text={ props.dismissButtonText }
						onClick={ props.dismissButtonOnClick }
						url={ props.dismissButtonUrl }
						target={ props.dismissButtonTarget }
						tabIndex="2"
					/>
					<DialogButton
						key="approve"
						text={ props.approveButtonText }
						onClick={ props.approveButtonOnClick }
						url={ props.approveButtonUrl }
						target={ props.approveButtonTarget }
						color={ props.approveButtonColor }
						tabIndex="1"
					/>
				</DialogActions>
			</WrapperTag>
		</section>
	);
}

Dialog.propTypes = {
	title: PropTypes.any,
	text: PropTypes.any,
	children: PropTypes.any,
	onSubmit: PropTypes.func,
	onClose: PropTypes.func,
	dismissButtonText: PropTypes.string.isRequired,
	dismissButtonOnClick: PropTypes.func,
	dismissButtonUrl: PropTypes.string,
	dismissButtonTarget: PropTypes.string,
	approveButtonText: PropTypes.string.isRequired,
	approveButtonOnClick: PropTypes.func,
	approveButtonUrl: PropTypes.string,
	approveButtonColor: PropTypes.string,
	approveButtonTarget: PropTypes.string,
};

Dialog.defaultProps = {};
