import { createRoot } from 'react-dom';
import { Announcements, Overlay } from './components';
import AnnouncementCommands from './e-component';

export default class AnnouncementIndex {
	constructor() {
		this.initAnnouncement();
	}

	async initAnnouncement() {
		const container = document.getElementById( 'e-announcements-root' );
		const Root = createRoot( container );

		const announcements = window.elementorAnnouncementsConfig?.announcements;
		if ( ! announcements || ! container ) {
			return;
		}

		await $e.components.register( new AnnouncementCommands() );

		Root.render(
			<>
				<Overlay />
				<Announcements
					announcements={ announcements }
					unMount={ () => {
						Root.unmount();
						container.remove();
					} }
				/>
			</>
		);
	}
}

new AnnouncementIndex();
