import { useRef } from 'react';

import Button from 'elementor-app/ui/molecules/button';

import './upload-file.scss';

export default function UploadFile( props ) {
	const fileInput = useRef( null );

	return (
		<div>
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
