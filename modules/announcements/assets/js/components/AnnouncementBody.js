import PropTypes from 'prop-types';

export default function AnnouncementBody( props ) {
	const { title, description, media } = props.announcement;

	return (
		<div className="announcement-body-container">
			{ 'image' === media.type && (
			<div className={ `announcement-body-media announcement-body-${ media.type }` }>
				<img src={ media.src } alt="Announcement" />
			</div>
			) }
			<div className="announcement-body-content">
				<div className="announcement-body-title">{ title }</div>
				<div className="announcement-body-description" dangerouslySetInnerHTML={ { __html: description } }></div>
			</div>
		</div>
	);
}

AnnouncementBody.propTypes = {
	announcement: PropTypes.object.isRequired,
};
