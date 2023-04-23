import { arrayToClassName } from '../../utils/utils';

export default function Heading( props ) {
	const baseClassName = 'eps',
		classes = [
			props.className,
		];

	if ( props.variant ) {
		classes.push( baseClassName + '-' + props.variant );
	}

	const Element = () => React.createElement( props.tag, {
		className: arrayToClassName( classes ),
	}, props.children );

	return <Element />;
}

Heading.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
	tag: PropTypes.oneOf( [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ),
	variant: PropTypes.oneOf( [ 'display-1', 'display-2', 'display-3', 'display-4', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ] ).isRequired,
};

Heading.defaultProps = {
	className: '',
	tag: 'h1',
};
