import './list.scss';

export default function List( props ) {
	const baseClassName = 'import-export-list',
		classes = [
			baseClassName,
			props.className,
		];

		return (
		<ul className={ classes.filter( ( classItem ) => '' !== classItem ).join( ' ' ) }>
			{ props.children }
		</ul>
	);
}

List.propTypes = {
	className: PropTypes.string,
	divided: PropTypes.any,
	separated: PropTypes.any,
	children: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

List.defaultProps = {
	className: '',
};

List.Item = function ListItem( props ) {
	return (
		<li className={ `import-export-list__item ${ props.className }` }>
			{ props.children }
		</li>
	);
};

List.Item.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

List.Item.defaultProps = {
	className: '',
};
