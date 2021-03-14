import './message.scss';

export default function Message( props ) {
	return (
		<div className={ `e-app-import-export-message ${ props.className }` }>
			<div className="e-app-import-export-message__content">
				{ props.children }
			</div>
		</div>
	);
}

Message.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any.isRequired,
};

Message.defaultProps = {
	className: '',
};
