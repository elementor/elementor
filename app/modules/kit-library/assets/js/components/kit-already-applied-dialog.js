import { Dialog } from '@elementor/app-ui';
import { useTracking } from '../context/tracking-context';
import useQueryParams from 'elementor-app/hooks/use-query-params';

export default function KitAlreadyAppliedDialog( props ) {
	const tracking = useTracking();
	const { return_to: returnToParam, no_automatic_redirect: noAutomaticRedirectParam } = useQueryParams().getAll();

	const getRemoveKitUrl = () => {
		const elementorToolsUrl = elementorAppConfig[ 'import-export' ].tools_url;
		const url = new URL( elementorToolsUrl );
		url.searchParams.append( 'referrer_kit', props.id );
		url.searchParams.append( 'scroll_to_revert', '1' );
		if ( returnToParam ) {
			url.searchParams.append( 'return_to', returnToParam );
		}
		if ( noAutomaticRedirectParam ) {
			url.searchParams.append( 'no_automatic_redirect', noAutomaticRedirectParam );
		}
		url.hash = 'tab-import-export-kit';

		return url.toString();
	};

	return (
		<Dialog
			title={ __( 'You\'ve already applied a Website Templates.', 'elementor' ) }
			text={ <>
				{ __( 'Applying two Website Templates on the same website will mix global styles and colors and hurt your site\'s performance.', 'elementor' ) }
				<br /><br />
				{ __( 'Remove the existing Website Template before applying a new one.', 'elementor' ) }
			</> }
			approveButtonText={ __( 'Remove existing', 'elementor' ) }
			approveButtonColor="primary"
			approveButtonOnClick={ () => tracking.trackKitdemoApplyRemoveExisting( true, () => {
				location.href = getRemoveKitUrl();
			} ) }
			dismissButtonText={ __( 'Apply anyway', 'elementor' ) }
			dismissButtonOnClick={ () => tracking.trackKitdemoApplyRemoveExisting( false, props.dismissButtonOnClick ) }
			onClose={ props.onClose }
		/>
	);
}

KitAlreadyAppliedDialog.propTypes = {
	id: PropTypes.string.isRequired,
	dismissButtonOnClick: PropTypes.func.isRequired,
	onClose: PropTypes.func.isRequired,
};
