import { useState } from 'react';

import KitAlreadyAppliedDialog from './kit-already-applied-dialog';
import ApplyKitDialog from './apply-kit-dialog';

export default function KitDialog( props ) {
	const [ applyAnyway, setApplyAnyway ] = useState( false );

	if ( elementorAppConfig[ 'import-export' ].importSessions.length && ! applyAnyway ) {
		return (
			<KitAlreadyAppliedDialog
				kitId={ props.kitId }
				dismissButtonOnClick={ () => setApplyAnyway( true ) }
				onClose={ props.onClose }
			/>
		);
	}
	return (
		<ApplyKitDialog
			downloadLink={ props.downloadLinkData.data.download_link }
			nonce={ props.downloadLinkData.meta.nonce }
			onClose={ props.onClose }
		/>
	);
}

KitDialog.propTypes = {
	kitId: PropTypes.string.isRequired,
	downloadLinkData: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
};
