import ActionsFooter from '../../../../../shared/actions-footer/actions-footer';
import Button from 'elementor-app/ui/molecules/button';
import useAction from 'elementor-app/hooks/use-action';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';

export default function ImportCompleteFooter( { seeItLiveUrl, referrer } ) {
	const action = useAction(),
		eventTracking = ( command, eventType = 'click' ) => {
			if ( 'kit-library' === referrer ) {
				appsEventTrackingDispatch(
					command,
					{
						page_source: 'kit is live',
						element_location: 'app_wizard_footer',
						event_type: eventType,
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
					action.backToDashboard();
				} }
			/>
		</ActionsFooter>
	);
}

ImportCompleteFooter.propTypes = {
	seeItLiveUrl: PropTypes.string,
	referrer: PropTypes.string,
};
