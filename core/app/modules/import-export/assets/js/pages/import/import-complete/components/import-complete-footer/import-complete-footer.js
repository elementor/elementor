import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';

import useImportActions from '../../../hooks/use-import-actions';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function ImportCompleteFooter( { seeItLiveUrl, referrer } ) {
	const { closeApp } = useImportActions(),
		eventTracking = ( command ) => {
			if ( 'kit-library' === referrer ) {
				appsEventTrackingDispatch(
					command,
					{
						source: 'kit is live',
						element_location: 'app_wizard_footer',
					},
				);
			}
		};

	return (
		<ActionsFooter>
			{
				seeItLiveUrl &&
				<Button
					text={ __( 'See it live', 'elementor' ) }
					variant="contained"
					onClick={ () => {
						eventTracking( 'kit-library/see-it-live' );

						window.open( seeItLiveUrl, '_blank' );
					} }
				/>
			}

			<Button
				text={ __( 'Close', 'elementor' ) }
				variant="contained"
				color="primary"
				onClick={ () => {
					eventTracking( 'kit-library/close' );

					closeApp();
				} }
			/>
		</ActionsFooter>
	);
}

ImportCompleteFooter.propTypes = {
	seeItLiveUrl: PropTypes.string,
};
