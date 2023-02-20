import { AnnouncementBody,AnnouncementFooter } from './';

export default function Announcement( { announcement }) {
	console.log(announcement);
	const {title, description, cta, media} = announcement;
	return (
		<div className="announcement-item">
			<AnnouncementBody/>
			<AnnouncementFooter buttons={cta}/>
		</div>
	);
}
