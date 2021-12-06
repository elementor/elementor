import { useRef, useState } from 'react';

export default function Empty( props ) {
	const editorComponent = $e.components.get( 'editor' ),
		addAreaElementRef = useRef(),
		[ isRenderPresets, setIsRenderPresets ] = useState( false ),
		onPresetSelected = ( preset, container ) => {
			const options = {
				createWrapper: false,
			};

			// Create new one by selected preset.
			editorComponent.defaultUtils().container.createContainerFromPreset( preset, container, options );
		},
		editContainer = () => {
			editorComponent.defaultUtils().container.openEditMode( props.container );
		},
		renderEmpty = () => {
			const args = {
				importOptions: {
					target: props.container,
				},
			};

			// Make droppable area., timeout means after the element is rendered, other React hooks causes errors.
			setTimeout( () => {
				const $addAreaElementRef = jQuery( addAreaElementRef.current ),
					defaultDroppableOptions = props.container.view.getDroppableOptions();

				// Make some adjustments to behave like 'AddSectionArea', use default droppable options from container element.
				defaultDroppableOptions.placeholder = false;
				defaultDroppableOptions.items = '> .elementor-add-section-inner';
				defaultDroppableOptions.hasDraggingOnChildClass = 'elementor-dragging-on-child';

				// Make element drop-able.
				$addAreaElementRef.html5Droppable( defaultDroppableOptions );
			} );

			return (
				<div className="elementor-add-section" onClick={editContainer} ref={addAreaElementRef}>
					<div className="elementor-add-section-inner" >
						<div className="e-view elementor-add-new-section">
							<div className="elementor-add-section-area-button elementor-add-section-button"
									onClick={() => setIsRenderPresets( true )} title={__( 'Add new container', 'elementor' )}>
								<i className="eicon-plus"/>
							</div>
							<div className="elementor-add-section-area-button elementor-add-template-button"
									onClick={() => $e.run( 'library/open', args )} title={__( 'Add Template', 'elementor' )}>
								<i className="eicon-folder"/>
							</div>
							<div className="elementor-add-section-drag-title">
								{__( 'Drag widgets here to create nested widget.', 'elementor' )}
							</div>
						</div>
					</div>
				</div>
			);
		},
		renderSelectPreset = () => {
			return (
				<>
					<div className="elementor-add-section-close">
						<i onClick={() => setIsRenderPresets( false )} className="eicon-close" aria-hidden="true"/>
						<span className="elementor-screen-only">{__( 'Close', 'elementor' )}</span>
					</div>
					<div className="e-view e-container-select-preset">
						<div
							className="e-container-select-preset__title">{__( 'Select your Structure', 'elementor' )}</div>
						<div className="e-container-select-preset__list">
							{
								elementor.presetsFactory.getContainerPresets().map( ( preset ) => (
									<div onClick={() => onPresetSelected( preset, props.container )}
										key={preset} className="e-container-preset" data-preset={preset}
										dangerouslySetInnerHTML={{ __html: elementor.presetsFactory.getContainerPreset( preset ) }}/>
								) )
							}
						</div>
					</div>
				</>
			);
		};

	return isRenderPresets ?
		renderSelectPreset() : renderEmpty();
}

Empty.propTypes = {
	container: PropTypes.object.isRequired,
};

