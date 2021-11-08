import { useState } from 'react';

export default function Empty() {
	const [ isRenderPresets, setIsRenderPresets ] = useState( false );

	const onPresetSelected = ( preset, container ) => {
			const options = {
				createForTarget: true,
			};

			// Create new one by selected preset.
			$e.components.get( 'editor' ).defaultUtils().container.createContainerFromPresetEx(
				preset,
				container,
				options,
			);
		},
		renderEmpty = () => {
			return (
				<div className="elementor-first-add">
					<div className="elementor-icon eicon-plus" onClick={() => setIsRenderPresets( true )}/>
					<div className="elementor-icon eicon-folder"/>
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
									<div onClick={() => onPresetSelected( preset, this.props.container )}
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

