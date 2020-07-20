import { useRef } from 'react';
import useFile from '../use-file/use-file';
import Button from 'elementor-app/ui/molecules/button';

import './select-file.scss';

export default function SelectFile() {
	const { setFile } = useFile(),
		fileInput = useRef(),
		onFileSelect = ( event ) => {
			setFile( event.target.files[ 0 ] );
		};

	return (
		<div>
			<input ref={ fileInput } onChange={ onFileSelect } type="file" className="e-app-select-file__input" />

			<Button
				onClick={ () => fileInput.current.click() }
				className="e-app-select-file__button"
				text={ __( 'Select File', 'elementor' ) }
				variant="contained"
				color="primary"
				size="sm"
			/>
		</div>
	);
}
