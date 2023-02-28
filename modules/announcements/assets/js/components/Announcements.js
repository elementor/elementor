import { AnnouncementsHeader, Announcement } from './';
import { appsEventTrackingDispatch } from 'elementor-app/event-track/apps-event-tracking';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

export default function Announcements( props ) {
	const { announcements } = props;
	const announcementTitle = Object.values( announcements )[ 0 ].title;

	// Send event when the popup is presented
	useEffect( () => {
		const timer = setTimeout( () => {
			const eventArgs = {
				event_name: 'element_impression',
				element_type: 'popup',
				eventNonInteraction: 1,
			};
			eventTrackingHandle( 'impression', eventArgs );
		}, 200 );

		return () => clearTimeout( timer );
	}, [] );

	const onCloseHandle = ( eventName ) => {
		const eventArgs = {
			event_name: 'element_click',
			element_type: 'button',
		};
		document.getElementById( 'e-announcements-root' ).remove();
		eventTrackingHandle( eventName, eventArgs );
	};

	const eventTrackingHandle = ( eventName, additionalArgs ) => {
		const eventBaseArgs = {
			event: 'fireEvent',
			eventCategory: 'editor',
			eventAction: 'whats new popup',
			eventLabel: eventName,
			eventLabel2: announcementTitle,
			event_action: eventName,
			event_location: 'popup',
			event_context: 'whats new',
			event_subcontext: announcementTitle,
			element_id: 'e-announcements-root',
		};
		const eventArgs = { ...eventBaseArgs, ...additionalArgs };

		appsEventTrackingDispatch(
			`announcement/${ eventName }`,
			eventArgs,
		);
	};

	return (
		<div className="announcements-container">
			<AnnouncementsHeader onClose={ onCloseHandle } />
			{ Object.values( announcements ).map( ( announcement, index ) => <Announcement key={ `announcement${ index }` } announcement={ announcement } onClose={ onCloseHandle } /> ) }
		</div>
	);
}

Announcements.propTypes = {
	announcements: PropTypes.oneOfType( [ PropTypes.array, PropTypes.object ] ).isRequired,
};
