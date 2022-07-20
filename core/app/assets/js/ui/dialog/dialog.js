import { useEffect } from 'react';
import DialogWrapper from './dialog-wrapper';
import DialogContent from './dialog-content';
import DialogTitle from './dialog-title';
import DialogText from './dialog-text';
import DialogActions from './dialog-actions';
import DialogButton from './dialog-button';

import './dialog.scss';

export default function Dialog( props ) {
	const dismissButtonOnClick = () => {
		props.dismissButtonOnClick();
	},
	approveButtonOnClick = () => {
		// if ( 'kit-library' === props.referrer ) {
		// 	elementorCommon.events.eventTracking(
		// 		'kit-library/enable',
		// 		{
		// 			placement: 'kit library',
		// 			event: 'unfiltered file modal enable button',
		// 		},
		// 		{
		// 			source: 'import',
		// 			step: '3',
		// 		},
		// 	)
		// }

		// TODO: Not shooting onDismiss from import-proccess.js
		props.approveButtonOnClick();
	},
	onClose = () => {
		if ( 'kit-library' === props.referrer ) {
			$e.run(
				'kit-library/close',
				{},
				{
					meta: {
						event: 'unfiltered file modal close',
						source: 'import',
						step: '3',
					},
				},
			)
		}
		props.onClose();
	};

	useEffect( () => {
		if ( 'kit-library' === props.referrer ) {
			$e.run(
				'kit-library/unfiltered-file-modal-load',
				{},
				{
					meta: {
						event: 'unfiltered file modal load',
						source: 'import',
						step: '3',
						event_type: 'load',
					},
				},
			)
		}
	}, [] )
	return (
		<DialogWrapper onSubmit={ props.onSubmit } onClose={ onClose }>
			<DialogContent>
				{ props.title && <DialogTitle>{ props.title }</DialogTitle> }
				{ props.text && <DialogText>{ props.text }</DialogText> }
				{ props.children }
			</DialogContent>
			<DialogActions>
				<DialogButton
					key="dismiss"
					text={ props.dismissButtonText }
					onClick={ dismissButtonOnClick }
					url={ props.dismissButtonUrl }
					target={ props.dismissButtonTarget }
					// eslint-disable-next-line jsx-a11y/tabindex-no-positive
					tabIndex="2"
				/>
				<DialogButton
					key="approve"
					text={ props.approveButtonText }
					onClick={ approveButtonOnClick }
					url={ props.approveButtonUrl }
					target={ props.approveButtonTarget }
					color={ props.approveButtonColor }
					elRef={ props.approveButtonRef }
					// eslint-disable-next-line jsx-a11y/tabindex-no-positive
					tabIndex="1"
				/>
			</DialogActions>
		</DialogWrapper>
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
	approveButtonRef: PropTypes.object,
};

Dialog.defaultProps = {};

Dialog.Wrapper = DialogWrapper;
Dialog.Content = DialogContent;
Dialog.Title = DialogTitle;
Dialog.Text = DialogText;
Dialog.Actions = DialogActions;
Dialog.Button = DialogButton;
