import { AnnouncementsHeader,Announcement } from './';

export default function Announcements({announcments}) {
	return (
		<div className="announcements-container">
			<AnnouncementsHeader/>
			{announcments.map( (announcment,index) =>  <Announcement key={`announcment${index}`} announcement={announcment}/>)}
		</div>
	);
}
