import ReactUtils from 'elementor-utils/react';
import { Announcements, Overlay } from './components';
import AnnouncementCommands from './e-component';

export default class AnnouncementIndex {
	constructor() {
		this.initAnnouncement();
	}

	async initAnnouncement() {
		const container = document.getElementById( 'e-announcements-root' );
		const announcements = window.elementorAnnouncementsConfig?.announcements;
		if ( ! announcements || ! container ) {
			return;
		}

		await $e.components.register( new AnnouncementCommands() );

		const { unmount } = ReactUtils.render( (
			<>
				<Overlay />
				<Announcements
					announcements={ announcements }
					unMount={ () => {
						unmount();
						container.remove();
					} }
				/>
			</>
		), container );
	}
}

new AnnouncementIndex();
