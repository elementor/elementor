import { useEffect } from 'react';
import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Message from '../../ui/message/message';
import ImportFailedDialog from '../import-failed-dialog/import-failed-dialog';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './file-process.scss';

export default function FileProcess( props ) {
	useEffect( () => {
		props.onLoad();
	}, [] );

	useEffect( () => {
		if ( 'success' === props.status ) {
			props.onSuccess();
		}
	}, [ props.status ] );

	return (
		<Message className={ arrayToClassName( [ 'e-app-import-export-file-process', props.className ] ) }>
			<Icon className="e-app-import-export-file-process__icon eicon-loading eicon-animation-spin" />

			<Heading variant="display-3" className="e-app-import-export-file-process__title">
				{ __( 'Processing your file...', 'elementor' ) }
			</Heading>

			<Text variant="xl" className="e-app-import-export-file-process__text">
				{ __( 'This usually takes a few moments.', 'elementor' ) }
				<br />
				{ __( 'Don\'t close this window until your import is finished.', 'elementor' ) }
			</Text>

			{ 'error' === props.status && <ImportFailedDialog onRetry={ props.onRetry } /> }
		</Message>
	);
}

FileProcess.propTypes = {
	className: PropTypes.string,
	status: PropTypes.oneOf( [ 'initial', 'success', 'error' ] ),
	onLoad: PropTypes.func.isRequired,
	onSuccess: PropTypes.func.isRequired,
	onRetry: PropTypes.func.isRequired,
};

FileProcess.defaultProps = {
	className: '',
};
