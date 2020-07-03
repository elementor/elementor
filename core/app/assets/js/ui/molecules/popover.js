export default function Popover( props ) {
	return (
		<ul className={`eps-popover ${ props.className }`}>
			{ (
				props.children.map( ( item ) => {
					return <li className="eps-popover__item" key={ item.text }>{ item }</li>;
				} )
			) }
		</ul>
	);
}

Popover.propTypes = {
	children: PropTypes.any,
	className: PropTypes.string,
};

Popover.defaultProps = {
	className: '',
};
