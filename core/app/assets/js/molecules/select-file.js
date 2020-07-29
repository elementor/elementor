import { useRef } from 'react';

import Button from 'elementor-app/ui/molecules/button';

import './select-file.scss';

export default function SelectFile( props ) {
	const fileInput = useRef( null );

	return (
		<div>
			<input
				ref={ fileInput }
				type="file"
				className="e-app-select-file__input"
				onChange={ ( event ) => {
					props.onFileSelect( event.target.files, event );
				} }
			/>

			<Button
				className="e-app-select-file__button"
				text={ props.text }
				variant="contained"
				color="primary"
				size="sm"
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

SelectFile.propTypes = {
	className: PropTypes.string,
	text: PropTypes.string,
	onFileSelect: PropTypes.func,
	isLoading: PropTypes.bool,
};

SelectFile.defaultProps = {
	className: '',
	text: __( 'Select File', 'elementor' ),
};
