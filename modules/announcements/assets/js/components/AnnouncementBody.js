import PropTypes from 'prop-types';

export default function AnnouncementBody( { announcement } ) {
	const { title, description, media } = announcement;

	return (
		<div className="announcement-body-container">
			<div className={ `announcement-body-media announcement-body-${ media.type }` }>
				{ 'image' === media.type && (
					<img src={ media.src } alt="Announcement" />
				) }
			</div>
			<div className="announcement-body-title">
				{ title }
			</div>
			<div className="announcement-body-description">
				{ description }
			</div>
		</div>
	);
}

AnnouncementBody.propTypes = {
	announcement: PropTypes.object.isRequired,
	title: PropTypes.string,
	description: PropTypes.string,
	media: PropTypes.object,
};
