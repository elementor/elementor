import { useState } from 'react';

export default function Empty( props ) {
	const editorComponent = $e.components.get( 'editor' ),
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

			return (
				<div className="elementor-first-add" onClick={() => editContainer()}>
					<div className="elementor-icon eicon-plus" onClick={() => setIsRenderPresets( true )}/>
					<div className="elementor-icon eicon-folder" onClick={() => $e.run( 'library/open', args ) }/>
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

