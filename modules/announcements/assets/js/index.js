import { createRoot } from 'react-dom/client';
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

		const Root = createRoot( container );
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
			</>,
		);
	}
}

new AnnouncementIndex();
