import Utils from 'elementor-app/utils/utils.js';

export default function ListItem( props ) {
	const baseClassName = 'eps-list__item',
		classes = [ baseClassName, props.className ];

	let style;

	if ( props.padding ) {
		style = {
			'--eps-list-item-padding': Utils.stringToRemValues( props.padding ),
		};

		classes.push( baseClassName + '--padding' );
	}

	return (
		<li style={ style } className={ Utils.arrayToClassName( classes ) }>
			{ props.children }
		</li>
	);
}

ListItem.propTypes = {
	className: PropTypes.string,
	padding: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

ListItem.defaultProps = {
	className: '',
};
