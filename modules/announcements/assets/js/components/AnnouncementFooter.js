import PropTypes from 'prop-types';

export default function AnnouncementFooter( props ) {
	const { buttons, onClose } = props;

	return (
		<div className="announcement-footer-container">
			{ Object.values( buttons ).map( ( button, index ) => {
				return (
					<a
						key={ `button${ index }` }
						className={ `button-item ${ button.variant }` }
						href={ button.url }
						target={ button.target }
						onClick={ () => onClose( 'cta' ) } >
						{ button.label }
					</a>
				);
			} ) }
		</div>
	);
}

AnnouncementFooter.propTypes = {
	buttons: PropTypes.oneOfType( [
		PropTypes.array,
		PropTypes.object,
	] ),
	onClose: PropTypes.func.isRequired,
};
