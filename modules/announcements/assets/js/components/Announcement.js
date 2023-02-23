import { AnnouncementBody, AnnouncementFooter } from './';
import PropTypes from 'prop-types';

export default function Announcement( { announcement } ) {
	const { cta, ...rest } = announcement;

	return (
		<div className="announcement-item">
			<AnnouncementBody announcement={ rest } />
			<AnnouncementFooter buttons={ cta } />
		</div>
	);
}

Announcement.propTypes = {
	announcement: PropTypes.object.isRequired,
};
