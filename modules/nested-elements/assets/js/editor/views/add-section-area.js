/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useRef } from 'react';

export default function AddSectionArea( props ) {
	const addAreaElementRef = useRef(),
		containerHelper = elementor.helpers.container;

	// Make droppable area.
	useEffect( () => {
		const $addAreaElementRef = jQuery( addAreaElementRef.current ),
			defaultDroppableOptions = props.container.view.getDroppableOptions();

		// Make some adjustments to behave like 'AddSectionArea', use default droppable options from container element.
		defaultDroppableOptions.placeholder = false;
		defaultDroppableOptions.items = '> .elementor-add-section-inner';
		defaultDroppableOptions.hasDraggingOnChildClass = 'elementor-dragging-on-child';

		// Make element drop-able.
		$addAreaElementRef.html5Droppable( defaultDroppableOptions );

		// Cleanup.
		return () => {
			$addAreaElementRef.html5Droppable( 'destroy' );
		};
	}, [] );

	return (
		<div
			className="elementor-add-section"
			onClick={ () => containerHelper.openEditMode( props.container ) }
			ref={ addAreaElementRef }
			role="button"
			tabIndex="0"
		>
			<div className="elementor-add-section-inner">
				<div className="e-view elementor-add-new-section">
					<button
						type="button"
						className="elementor-add-section-area-button elementor-add-section-button"
						title={ __( 'Add new container', 'elementor' ) }
						aria-label={ __( 'Add new container', 'elementor' ) }
						onClick={ () => props.setIsRenderPresets( true ) }
					>
						<i className="eicon-plus" aria-hidden="true" />
					</button>
					<div className="elementor-add-section-drag-title">
						{ __( 'Drag widget here', 'elementor' ) }
					</div>
				</div>
			</div>
		</div>
	);
}

AddSectionArea.propTypes = {
	container: PropTypes.object.isRequired,
	setIsRenderPresets: PropTypes.func.isRequired,
};
