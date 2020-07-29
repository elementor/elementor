import { useState } from 'react';

import Utils from 'elementor-app/utils/utils.js';

import './drag-drop.scss';

export default function DragDrop( props ) {
	const [ isDragOver, setIsDragOver ] = useState( false ),
		getClassName = () => {
			const baseClassName = 'e-app-drag-drop',
				classes = [ baseClassName, props.className ];

			if ( isDragOver ) {
				classes.push( baseClassName + '--drag-over' );
			}

			return Utils.arrayToClassName( classes );
		},
		onDragDropActions = ( event ) => {
			event.preventDefault();
			event.stopPropagation();
		},
		dragDropEvents = {
			onDrop: ( event ) => {
				onDragDropActions( event );

				setIsDragOver( false );

				if ( props.onDrop ) {
					props.onDrop( event );
				}
			},
			onDragOver: ( event ) => {
				onDragDropActions( event );

				setIsDragOver( true );

				if ( props.onDragOver ) {
					props.onDragOver( event );
				}
			},
			onDragLeave: ( event ) => {
				onDragDropActions( event );

				setIsDragOver( false );

				if ( props.onDragLeave ) {
					props.onDragLeave( event );
				}
			},
		};

	return (
		<div { ...dragDropEvents } className={ getClassName() }>
			{ props.children }
		</div>
	);
}

DragDrop.propTypes = {
	className: PropTypes.string,
	children: PropTypes.any,
	onDrop: PropTypes.func,
	onDragOver: PropTypes.func,
	onDragLeave: PropTypes.func,
};

DragDrop.defaultProps = {
	className: '',
};

