import Box from 'elementor-app/ui/atoms/box';
import KitContentList from './kit-content-list/kit-content-list';

export default function KitContent( props ) {
	return (
		<Box>
			<KitContentList type={ props.type } />
		</Box>
	);
}

KitContent.propTypes = {
	classname: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContent.defaultProps = {
	className: '',
};
