import { useState } from 'react';
import KitAlreadyAppliedDialog from './kit-already-applied-dialog';
import ApplyKitDialog from './apply-kit-dialog';

export default function KitDialog( props ) {
	const [ applyAnyway, setApplyAnyway ] = useState( false );

	const kitAlreadyApplied = !! elementorAppConfig[ 'import-export' ].lastImportedSession.session_id;

	if ( kitAlreadyApplied && ! applyAnyway ) {
		return (
			<KitAlreadyAppliedDialog
				id={ props.id }
				dismissButtonOnClick={ () => setApplyAnyway( true ) }
				onClose={ props.onClose }
			/>
		);
	}

	return (
		<ApplyKitDialog
			id={ props.id }
			downloadLink={ props.downloadLinkData.data.download_link }
			nonce={ props.downloadLinkData.meta.nonce }
			onClose={ props.onClose }
		/>
	);
}

KitDialog.propTypes = {
	id: PropTypes.string.isRequired,
	downloadLinkData: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
};
