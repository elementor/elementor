import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

import useImportActions from '../../../hooks/use-import-actions';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import { isKitLibraryReferrer } from 'elementor/core/app/modules/import-export/assets/js/context/shared-context/shared-context-provider';

export default function ImportCompleteFooter( { seeItLiveUrl, referrer } ) {
	const { closeApp } = useImportActions(),
		eventTracking = ( command, event ) => {
			appsEventTrackingDispatch(
				`kit-library/${ command }`,
				{
					event,
					source: 'kit is live',
				},
			);
		}
	return (
		<ActionsFooter>
			{
				seeItLiveUrl &&
				<Button
					text={ __( 'See it live', 'elementor' ) }
					variant="contained"
					onClick={ () => {
						if ( 'kit-library' === referrer ) {
							eventTracking( 'see-it-live', 'see it live button' );
						}
						window.open( seeItLiveUrl, '_blank' );
					} }
				/>
			}

			<Button
				text={ __( 'Close', 'elementor' ) }
				variant="contained"
				color="primary"
				onClick={ () => {
					if ( 'kit-library' === referrer ) {
						eventTracking( 'close', 'close button' );
					}
					closeApp();
				} }
			/>
		</ActionsFooter>
	);
}

ImportCompleteFooter.propTypes = {
	seeItLiveUrl: PropTypes.string,
};
