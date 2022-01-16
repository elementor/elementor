import { useRef } from 'react';

import Button from 'elementor-app/ui/molecules/button';

import { arrayToClassName, isOneOf } from 'elementor-app/utils/utils.js';

import './upload-file.scss';

export default function UploadFile( props ) {
	const fileInput = useRef( null ),
		baseClassName = 'e-app-upload-file',
		classes = [ baseClassName, props.className ];

	return (
		<div className={ arrayToClassName( classes ) }>
			<input
				ref={ fileInput }
				type="file"
				accept={ props.filetypes.map( ( type ) => '.' + type ).join( ', ' ) }
				className="e-app-upload-file__input"
				onChange={ ( event ) => {
					const file = event.target.files[ 0 ];

					if ( file && isOneOf( file.type, props.filetypes ) ) {
						props.onFileSelect( file, event );
					} else {
						fileInput.current.value = '';

						props.onError();
					}
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
	filetypes: PropTypes.array.isRequired,
	onError: PropTypes.func,
};

UploadFile.defaultProps = {
	className: '',
	text: __( 'Select File', 'elementor' ),
	onError: () => {},
};
