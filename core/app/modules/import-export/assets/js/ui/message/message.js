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
	children: PropTypes.any.isRequired,
};

Message.defaultProps = {
	className: '',
};
