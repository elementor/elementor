import { Dialog } from '@elementor/app-ui';

export default function KitAlreadyAppliedDialog( props ) {
	const approveButtonOnClick = () => {
		location.href = elementorAppConfig.admin_url + 'admin.php?page=elementor-tools#tab-import-export-kit';

		const appliedKits = elementorAppConfig[ 'import-export' ].importSessions;

		sessionStorage.setItem( 'elementor-kit-referrer-id', props.kitId );
		sessionStorage.setItem( 'elementor-kit-to-remove-name', appliedKits[ appliedKits.length - 1 ].title );
	};

	return (
		<Dialog
			title={ __( 'You\'ve already applied a Kit ', 'elementor' ) }
			text={ <>
				{ __( 'Applying two Kits on the same website will mix global styles and colors and hurt your site\'s performance.', 'elementor' ) }
				<br /><br />
				{ __( 'Remove existing Kit before applying a new one.', 'elementor' ) }
			</> }
			approveButtonText={ __( 'Remove existing Kit', 'elementor' ) }
			approveButtonColor="primary" // TODO check if needed
			approveButtonOnClick={ approveButtonOnClick }
			dismissButtonText={ __( 'Apply Anyway', 'elementor' ) }
			dismissButtonOnClick={ props.dismissButtonOnClick }
			onClose={ props.onClose }
		/>
	);
}

KitAlreadyAppliedDialog.propTypes = {
	kitId: PropTypes.string.isRequired,
	dismissButtonOnClick: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
