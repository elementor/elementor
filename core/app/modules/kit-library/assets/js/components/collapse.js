import './collapse.scss';

export default function Collapse( props ) {
	// The state of the collapse managed by the parent component to let the parent control if the collapse is open or closed by default.
	return (
		<div
			className={ `eps-collapse ${ props.className }` }
			data-open={ props.isOpen || undefined /* Set `undefined` when 'isOpen' equals `false` to avoid showing the attr "data-open" */ }
		>
			<button
				className="eps-collapse__title"
				onClick={ () => {
					props.onChange( ( value ) => ! value );
					props.onClick?.( props.isOpen, props.title );
				} }
			>
				<span>{ props.title }</span>
				<i className="eicon-chevron-right eps-collapse__icon" />
			</button>
			<div className="eps-collapse__content">
				{ props.children }
			</div>
		</div>
	);
}

Collapse.propTypes = {
	isOpen: PropTypes.bool,
	onChange: PropTypes.func,
	className: PropTypes.string,
	title: PropTypes.node,
	onClick: PropTypes.func,
	children: PropTypes.oneOfType( [
		PropTypes.node,
		PropTypes.arrayOf( PropTypes.node ),
	] ),
};

Collapse.defaultProps = {
	className: '',
	isOpen: false,
};
