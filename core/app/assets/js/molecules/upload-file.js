import { useRef } from 'react';

import Button from 'elementor-app/ui/molecules/button';

import Utils from 'elementor-app/utils/utils.js';

import './upload-file.scss';

export default function UploadFile( props ) {
	const fileInput = useRef( null ),
		baseClassName = 'e-app-upload-file',
		classes = [ baseClassName, props.className ];

	return (
		<div className={ Utils.arrayToClassName( classes ) }>
			<input
				ref={ fileInput }
				type="file"
				className="e-app-upload-file__input"
				onChange={ ( event ) => {
					props.onFileSelect( event.target.files, event );
				} }
			/>

			<Button
				className="e-app-upload-file__button"
				text={ props.text }
				variant="contained"
				color="primary"
				size="lg"
				hideText={ props.isLoading }
				icon={ props.isLoading ? 'eicon-loading eicon-animation-spin' : '' }
				onClick={ () => {
					if ( ! props.isLoading ) {
						fileInput.current.click();
					}
				} }
			/>
		</div>
	);
}

UploadFile.propTypes = {
	className: PropTypes.string,
	text: PropTypes.string,
	onFileSelect: PropTypes.func,
	isLoading: PropTypes.bool,
};

UploadFile.defaultProps = {
	className: '',
	text: __( 'Select File', 'elementor' ),
};
