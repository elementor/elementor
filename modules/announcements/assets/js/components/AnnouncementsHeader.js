import PropTypes from 'prop-types';

export default function AnnouncementsHeader( props ) {
	const { onClose } = props;

	return (
		<div className="announcements-heading-container">
			<i className="eicon-elementor" aria-hidden="true" />
			<span className="heading-title">{ __( 'What’s New', 'elementor' ) }</span>
			<button className="close-button" onClick={ () => onClose( 'close' ) }>
				<i className="eicon-close" aria-hidden="true" />
			</button>
		</div>
	);
}

AnnouncementsHeader.propTypes = {
	onClose: PropTypes.func.isRequired,
};
