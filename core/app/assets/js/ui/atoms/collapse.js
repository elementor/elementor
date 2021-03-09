import './collapse.scss';

export default function Collapse( props ) {
	return (
		<div className={ `eps-collapse ${ props.className }` } data-open={ props.isOpen || undefined }>
			<button className="eps-collapse__title" onClick={ () => props.onChange( ( value ) => ! value ) }>
				<span>{ props.title }</span>
				<i className="eicon-chevron-right eps-collapse__icon"/>
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
	children: PropTypes.oneOfType( [
		PropTypes.node,
		PropTypes.arrayOf( PropTypes.node ),
	] ),
};

Collapse.defaultProps = {
	className: '',
	isOpen: false,
};
