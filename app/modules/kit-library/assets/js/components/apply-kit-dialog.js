import { useCallback } from 'react';
import { useNavigate } from '@reach/router';
import { Dialog } from '@elementor/app-ui';
import { useTracking } from '../context/tracking-context';
import { useReturnTo } from '../context/return-to-context';

export default function ApplyKitDialog( props ) {
	const navigate = useNavigate();
	const tracking = useTracking();
	const returnTo = useReturnTo();

	const startImportProcess = useCallback( ( applyAll = false ) => {
		let url = '';

		if ( elementorCommon?.config?.experimentalFeatures[ 'import-export-customization' ] ) {
			url = `import-customization?referrer=kit-library&id=${ props.id }&file_url=${ encodeURIComponent( props.downloadLink ) }`;
			if ( applyAll ) {
				url += '&action_type=apply-all';
			}
			if ( returnTo ) {
				url += `&return_to=${ encodeURIComponent( returnTo ) }&no_automatic_redirect=true`;
			}
		} else {
			url = '/import/process' +
				`?id=${ props.id }` +
				`&file_url=${ encodeURIComponent( props.downloadLink ) }` +
				`&nonce=${ props.nonce }&referrer=kit-library`;

			if ( applyAll ) {
				url += '&action_type=apply-all';
			}
			if ( returnTo ) {
				url += `&return_to=${ encodeURIComponent( returnTo ) }&no_automatic_redirect=true`;
			}
		}

		tracking.trackKitdemoApplyAllOrCustomize( applyAll, () => navigate( url ) );
	}, [ props.downloadLink, props.nonce, props.id, tracking, navigate, returnTo ] );

	return (
		<Dialog
			// Translators: %s is the kit name.
			title={ __( 'Apply %s?', 'elementor' ).replace( '%s', props.title ) }
			text={ <>
				{ __( 'You can use everything in this kit, or Customize to only include some items.', 'elementor' ) }
				<br /><br />
				{ __( 'By applying the entire kit, you\'ll override any styles, settings or content already on your site.', 'elementor' ) }
			</> }
			approveButtonText={ __( 'Apply All', 'elementor' ) }
			approveButtonColor="primary"
			approveButtonOnClick={ () => startImportProcess( true ) }
			dismissButtonText={ __( 'Customize', 'elementor' ) }
			dismissButtonOnClick={ () => startImportProcess( false ) }
			onClose={ props.onClose }
		/>
	);
}

ApplyKitDialog.propTypes = {
	id: PropTypes.string.isRequired,
	downloadLink: PropTypes.string.isRequired,
	nonce: PropTypes.string.isRequired,
	onClose: PropTypes.func.isRequired,
	title: PropTypes.string,
};

ApplyKitDialog.defaultProps = {
	title: 'Kit',
};
