import { Button } from '@elementor/app-ui';
import { useLastFilterContext } from '../../context/last-filter-context';
import { useNavigate } from '@reach/router';

import './header-back-button.scss';

export default function HeaderBackButton( { kitName, pageId } ) {
	const navigate = useNavigate(),
		{ lastFilter } = useLastFilterContext();

	return (
		<div className="e-kit-library__header-back-container">
			<Button
				className="e-kit-library__header-back"
				icon="eicon-chevron-left"
				text={ __( 'Back to Library', 'elementor' ) }
				onClick={ () => {
					$e.run(
						'kit-library/back-to-library',
						{
							source: pageId,
							kit_name: kitName,
						},
						{
							meta: {
								event: 'top bar back to library',
							},
						},
					);
					navigate( wp.url.addQueryArgs( '/kit-library', lastFilter ) )
				} }
			/>
		</div>
	);
}
