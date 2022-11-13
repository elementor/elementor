import { useRef } from 'react';

import Button from 'elementor-app/ui/molecules/button';

import { arrayToClassName, isOneOf } from 'elementor-app/utils/utils.js';

import './upload-file.scss';

export default function UploadFile( props ) {
	const fileInput = useRef( null ),
		baseClassName = 'e-app-upload-file',
		classes = [ baseClassName, props.className ];

		// For 'wp-media' type.
		let frame;

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
						props.onFileSelect( file, event, 'browse' );
					} else {
						fileInput.current.value = '';

						props.onError( {
							id: 'file_not_allowed',
							message: __( 'This file type is not allowed', 'elementor' ),
						} );
					}
				} }
			/>

			<Button
				className="e-app-upload-file__button"
				text={ props.text }
				variant={ props.variant }
				color={ props.color }
				size="lg"
				hideText={ props.isLoading }
				icon={ props.isLoading ? 'eicon-loading eicon-animation-spin' : '' }
				onClick={ () => {
					if ( props.onFileChoose ) {
						props.onFileChoose();
					}
					if ( ! props.isLoading ) {
						if ( props.onButtonClick ) {
							props.onButtonClick();
						}

						if ( 'file-explorer' === props.type ) {
							fileInput.current.click();
						} else if ( 'wp-media' === props.type ) {
							if ( frame ) {
								frame.open();
								return;
							}

							// Initialize the WP Media frame.
							frame = wp.media( {
								multiple: false,
								library: {
									type: [ 'image', 'image/svg+xml' ],
								},
							} );

							frame.on( 'select', () => {
								if ( props.onWpMediaSelect ) {
									props.onWpMediaSelect( frame );
								}
							} );

							frame.open();
						}
					}
				} }
			/>
		</div>
	);
}

UploadFile.propTypes = {
	className: PropTypes.string,
	type: PropTypes.string,
	onWpMediaSelect: PropTypes.func,
	text: PropTypes.string,
	onFileSelect: PropTypes.func,
	isLoading: PropTypes.bool,
	filetypes: PropTypes.array.isRequired,
	onError: PropTypes.func,
	variant: PropTypes.string,
	color: PropTypes.string,
	onButtonClick: PropTypes.func,
	onFileChoose: PropTypes.func,
};

UploadFile.defaultProps = {
	className: '',
	type: 'file-explorer',
	text: __( 'Select File', 'elementor' ),
	onError: () => {},
	variant: 'contained',
	color: 'primary',
};
