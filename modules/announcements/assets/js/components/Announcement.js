import { AnnouncementBody,AnnouncementFooter } from './';

export default function Announcement( { announcement } ) {
	const { cta, ...rest } = announcement;

	return (
		<div className="announcement-item">
			<AnnouncementBody announcement={ rest }/>
			<AnnouncementFooter buttons={ cta }/>
		</div>
	);
}
