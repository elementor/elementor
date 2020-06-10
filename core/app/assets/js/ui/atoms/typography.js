import './typography.scss';

export default function Typography( props ) {
	const TagName = props.tagName;
	return (
		<TagName className={ props.className }>
			{ props.children }
		</TagName>
	);
}

Typography.propTypes = {
	className: PropTypes.string,
	children: PropTypes.string.isRequired,
	tagName: PropTypes.string,
};

Typography.defaultProps = {
	className: '',
	tagName: 'span',
};
