import './message.scss';

export default function Message( props ) {
	return (
		<div className={ `import-export-message ${ props.className }` }>
			<div className="import-export-message__content">
				{ props.children }
			</div>
		</div>
	);
}

Message.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [ PropTypes.object, PropTypes.arrayOf( PropTypes.object ) ] ).isRequired,
};

Message.defaultProps = {
	className: '',
};
