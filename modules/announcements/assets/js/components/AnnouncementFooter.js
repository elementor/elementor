import PropTypes from 'prop-types';

export default function AnnouncementFooter( { buttons } ) {
	return (
		<div className="announcement-footer-container">
			{ buttons.map( ( button, index ) => {
				return (
					<a
						key={ `button${ index }` }
						className={ `button-item ${ button.variant }` }
						href={ button.url }
						target={ button.target }>
						{ button.label }
					</a>
				);
			} ) }
		</div>
	);
}

AnnouncementFooter.propTypes = {
	buttons: PropTypes.oneOfType( [ PropTypes.array, PropTypes.object ] ),
};
