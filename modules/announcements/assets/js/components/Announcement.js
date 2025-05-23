import { AnnouncementBody, AnnouncementFooter } from './';
import PropTypes from 'prop-types';

export default function Announcement( props ) {
	const { announcement, onClose } = props;
	const { cta, ...announcementContent } = announcement;

	return (
		<div className="announcement-item">
			<AnnouncementBody announcement={ announcementContent } />
			<AnnouncementFooter buttons={ cta } onClose={ onClose } />
		</div>
	);
}

Announcement.propTypes = {
	announcement: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
};
