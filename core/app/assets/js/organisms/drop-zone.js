import UploadFile from 'elementor-app/molecules/upload-file';
import DragDrop from 'elementor-app/ui/atoms/drag-drop';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './drop-zone.scss';

export default function DropZone( props ) {
	const dragDropEvents = {
		onDrop: ( event ) => {
			if ( ! props.isLoading ) {
				props.onFileSelect( event.dataTransfer.files, event );
			}
		},
	};

	return (
		<section className="e-app-drop-zone">
			<DragDrop { ...dragDropEvents } isLoading={ props.isLoading }>
				{ props.icon && <Icon className={ `e-app-drop-zone__icon ${ props.icon }` } /> }

				{ props.heading && <Heading variant="display-3">{ props.heading }</Heading> }

				{ props.text && <Text variant="xl">{ props.text }</Text> }

				{ props.secondaryText && <Text variant="xl">{ props.secondaryText }</Text> }

				{ props.showButton && <UploadFile isLoading={ props.isLoading } onFileSelect={ props.onFileSelect } text={ props.buttonText } /> }
			</DragDrop>
		</section>
	);
}

DropZone.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	onFileSelect: PropTypes.func,
	heading: PropTypes.string,
	text: PropTypes.string,
	secondaryText: PropTypes.string,
	buttonText: PropTypes.string,
	icon: PropTypes.string,
	showButton: PropTypes.bool,
	showIcon: PropTypes.bool,
	isLoading: PropTypes.bool,
};

DropZone.defaultProps = {
	className: '',
	icon: 'eicon-library-upload',
	showButton: true,
	showIcon: true,
};
