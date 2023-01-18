import { useState } from 'react';
import KitAlreadyAppliedDialog from "./kit-already-applied-dialog";
import Kit from "../models/kit";
import ApplyKitDialog from "./apply-kit-dialog";

export default function KitDialog( props ) {
	const { applyAnyway, setApplyAnyway } = useState( false );

	if ( elementorAppConfig[ 'import-export' ].importSessions.length && ! applyAnyway ) {
		return (
			<KitAlreadyAppliedDialog
				kitId={ props.kit.id }
				setDownloadLinkData={ props.setDownloadLinkData }
				setApplyAnyway={ setApplyAnyway }
			/>
		);
	}
	return (
		<ApplyKitDialog
			downloadLink={ props.downloadLinkData.data.download_link }
			nonce={ props.downloadLinkData.meta.nonce }
			onClose={ () => props.setDownloadLinkData( null ) }
		/>
	);
}

KitDialog.propTypes = {
	downloadLinkData: PropTypes.object.isRequired,
	setDownloadLinkData: PropTypes.func.isRequired,
	kit: PropTypes.instanceOf( Kit ).isRequired,
};
