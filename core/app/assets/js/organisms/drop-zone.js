import { arrayToClassName, isOneOf } from 'elementor-app/utils/utils.js';

import UploadFile from 'elementor-app/molecules/upload-file';
import DragDrop from 'elementor-app/ui/atoms/drag-drop';
import Icon from 'elementor-app/ui/atoms/icon';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './drop-zone.scss';

export default function DropZone( props ) {
	const classes = [ 'e-app-drop-zone', props.className ],
		dragDropEvents = {
		onDrop: ( event ) => {
			if ( ! props.isLoading ) {
				const file = event.dataTransfer.files[ 0 ];

				if ( file && isOneOf( file.type, props.filetypes ) ) {
					props.onFileSelect( file, event );
				} else {
					props.onError();
				}
			}
		},
	};

	return (
		<section className={ arrayToClassName( classes ) }>
			<DragDrop { ...dragDropEvents } isLoading={ props.isLoading }>
				{ props.icon && <Icon className={ `e-app-drop-zone__icon ${ props.icon }` } /> }

				{ props.heading && <Heading variant="display-3">{ props.heading }</Heading> }

				{ props.text && <Text variant="xl" className="e-app-drop-zone__text">{ props.text }</Text> }

				{ props.secondaryText && <Text variant="xl" className="e-app-drop-zone__secondary-text">{ props.secondaryText }</Text> }

				{ props.showButton &&
					<UploadFile
						isLoading={ props.isLoading }
						onFileSelect={ props.onFileSelect }
						onError={ props.onError }
						text={ props.buttonText }
						filetypes={ props.filetypes }
					/> }
			</DragDrop>
		</section>
	);
}

DropZone.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	onFileSelect: PropTypes.func.isRequired,
	heading: PropTypes.string,
	text: PropTypes.string,
	secondaryText: PropTypes.string,
	buttonText: PropTypes.string,
	icon: PropTypes.string,
	showButton: PropTypes.bool,
	showIcon: PropTypes.bool,
	isLoading: PropTypes.bool,
	filetypes: PropTypes.array.isRequired,
	onError: PropTypes.func,
};

DropZone.defaultProps = {
	className: '',
	icon: 'eicon-library-upload',
	showButton: true,
	showIcon: true,
	onError: () => {},
};
