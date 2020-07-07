export default function DragDrop( props ) {
	const onDrop = ( event ) => {
			event.preventDefault();
			console.log( 'onDrop' );
		},
		onDragOver = ( event ) => {
			event.preventDefault();
			console.log( 'onDragOver' );
		};

	return (
		<div
			className={ `e-app-drag-drop ${ props.className }` }
			onDrop={ onDrop }
			onDragOver={ onDragOver }
			>
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

