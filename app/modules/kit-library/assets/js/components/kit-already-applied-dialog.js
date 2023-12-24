import { Dialog } from '@elementor/app-ui';

export default function KitAlreadyAppliedDialog( props ) {
	const getRemoveKitUrl = () => {
		const elementorToolsUrl = elementorAppConfig[ 'import-export' ].tools_url;
		const url = new URL( elementorToolsUrl );
		url.searchParams.append( 'referrer_kit', props.id );
		url.hash = 'tab-import-export-kit';

		return url.toString();
	};

	return (
		<Dialog
			title={ __( 'You\'ve already applied a Kit.', 'elementor' ) }
			text={ <>
				{ __( 'Applying two Kits on the same website will mix global styles and colors and hurt your site\'s performance.', 'elementor' ) }
				<br /><br />
				{ __( 'Remove the existing Kit before applying a new one.', 'elementor' ) }
			</> }
			approveButtonText={ __( 'Remove existing Kit', 'elementor' ) }
			approveButtonColor="primary"
			approveButtonOnClick={ () => location.href = getRemoveKitUrl() }
			dismissButtonText={ __( 'Apply anyway', 'elementor' ) }
			dismissButtonOnClick={ props.dismissButtonOnClick }
			onClose={ props.onClose }
		/>
	);
}

KitAlreadyAppliedDialog.propTypes = {
	id: PropTypes.string.isRequired,
	dismissButtonOnClick: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
