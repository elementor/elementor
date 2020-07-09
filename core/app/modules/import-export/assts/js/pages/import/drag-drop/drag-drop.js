import { useState, useRef } from 'react';

export default function DragDrop( props ) {
	const onDrop = ( event ) => {
			//event.preventDefault();
			//console.log( 'onDrop' );
		},
		onDragOver = ( event ) => {
			//event.preventDefault();
			//console.log( 'onDragOver' );
		},
		onFileSelect = ( event ) => {
			console.log( event.target.files[0] );
		},
		fileInput = useRef();

	return (
		<div
			className={ `e-app-drag-drop ${ props.className }` }
			onDrop={ onDrop }
			onDragOver={ onDragOver }
			>
			<input type="file" name="file" ref={ fileInput } onChange={ onFileSelect } />
			<button onClick={ () => { fileInput.current.click(); } }>click</button>
			{ props.children }
		</div>
	);
}

DragDrop.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

DragDrop.defaultProps = {
	className: '',
};

