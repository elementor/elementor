import { Button } from '@elementor/app-ui';
import { useLastFilterContext } from '../../context/last-filter-context';
import { useNavigate } from '@reach/router';
import { useTracking } from '../../context/tracking-context';

import './header-back-button.scss';

export default function HeaderBackButton( props ) {
	const navigate = useNavigate();
	const { lastFilter } = useLastFilterContext();
	const tracking = useTracking();

	return (
		<div className="e-kit-library__header-back-container">
			<Button
				className="e-kit-library__header-back"
				icon="eicon-chevron-left"
				text={ __( 'Back to Library', 'elementor' ) }
				onClick={ () => {
					tracking.trackKitdemoOverviewBack( props.kitId, props.kitName, () => navigate( wp.url.addQueryArgs( '/kit-library', lastFilter ) ) );
				} }
			/>
		</div>
	);
}

HeaderBackButton.propTypes = {
	pageId: PropTypes.string.isRequired,
	kitName: PropTypes.string.isRequired,
	kitId: PropTypes.string.isRequired,
};
