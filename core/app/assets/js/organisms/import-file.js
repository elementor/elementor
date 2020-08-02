import SelectFile from 'elementor-app/molecules/select-file';
import DragDrop from 'elementor-app/ui/atoms/drag-drop';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

export default function ImportFile( props ) {
	const dragDropEvents = {
		onDrop: ( event ) => {
			if ( ! props.isLoading ) {
				props.onFileSelect( event.dataTransfer.files, event );
			}
		},
	};

	return (
		<section className="e-app-import">
			<DragDrop { ...dragDropEvents } isLoading={ props.isLoading }>
				{ ! props.noIcon && <Icon className={ `e-app-import__icon ${ props.icon }` } /> }

				{ props.heading && <Heading variant="display-3">{ props.heading }</Heading> }

				{ props.text && <Text variant="xl">{ props.text }</Text> }

				{ props.secondaryText && <Text variant="xl">{ props.secondaryText }</Text> }

				{ ! props.noButton && <SelectFile isLoading={ props.isLoading } onFileSelect={ props.onFileSelect } text={ props.buttonText } /> }
			</DragDrop>
		</section>
	);
}

ImportFile.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	onFileSelect: PropTypes.func,
	heading: PropTypes.string,
	text: PropTypes.string,
	secondaryText: PropTypes.string,
	buttonText: PropTypes.string,
	icon: PropTypes.string,
	noIcon: PropTypes.bool,
	noButton: PropTypes.bool,
	isLoading: PropTypes.bool,
};

ImportFile.defaultProps = {
	className: '',
	icon: 'eicon-library-upload',
};
