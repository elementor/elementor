import SelectFile from '../../shared/select-file/select-file';
import DragDrop from 'elementor-app/ui/atoms/drag-drop';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

export default function ImportFile( props ) {
	const dragDropEvents = {
		onDrop: ( event ) => {
			props.onFileSelect( event );
		},
	};

	return (
		<section className="e-app-import">
			<DragDrop { ...dragDropEvents }>
				{ ! props.noIcon && <Icon className={ `e-app-import__icon ${ props.icon }` } /> }

				{ props.heading && <Heading variant="display-3">{ props.heading }</Heading> }

				{ props.text && <Text variant="xl">{ props.text }</Text> }

				{ props.secondaryText && <Text variant="xl">{ props.secondaryText }</Text> }

				{ ! props.noButton && <SelectFile onFileSelect={ props.onFileSelect } text={ props.buttonText } /> }
			</DragDrop>
		</section>
	);
}

ImportFile.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	onDrop: PropTypes.func,
	onDragOver: PropTypes.func,
	onDragLeave: PropTypes.func,
	onFileSelect: PropTypes.func,
	heading: PropTypes.string,
	text: PropTypes.string,
	secondaryText: PropTypes.string,
	buttonText: PropTypes.string,
	icon: PropTypes.string,
	noIcon: PropTypes.bool,
	noButton: PropTypes.bool,
};

ImportFile.defaultProps = {
	className: '',
	icon: 'eicon-library-upload',
};

