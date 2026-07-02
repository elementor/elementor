/* eslint-disable jsx-a11y/click-events-have-key-events */
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export default function SelectPreset( props ) {
	const containerHelper = elementor.helpers.container,
		onPresetSelected = ( preset, container ) => {
			const options = {
				createWrapper: false,
			};

			EditorOneEventManager.sendCanvasEmptyBoxAction( {
				targetName: 'add_container',
				metadata: {
					container_type: 'flexbox',
					structure_type: preset,
				},
				containerCreated: true,
			} );

			containerHelper.createContainerFromPreset( preset, container, options );
		};

	const handleClose = () => {
		EditorOneEventManager.sendCanvasEmptyBoxAction( {
			targetName: 'close',
			containerCreated: false,
		} );
		props.setIsRenderPresets( false );
	};

	return (
		<>
			<button
				type="button"
				className="elementor-add-section-close"
				aria-label={ __( 'Close', 'elementor' ) }
				onClick={ handleClose }
			>
				<i className="eicon-close" aria-hidden="true" />
			</button>
			<div className="e-view e-con-select-preset">
				<div className="e-con-select-preset__title">{ __( 'Select your Structure', 'elementor' ) }</div>
				<div className="e-con-select-preset__list">
					{
						elementor.presetsFactory.getContainerPresets().map( ( preset ) => (
							<button
								type="button"
								className="e-con-preset"
								data-preset={ preset }
								key={ preset }
								onClick={ () => onPresetSelected( preset, props.container ) }
								dangerouslySetInnerHTML={ { __html: elementor.presetsFactory.generateContainerPreset( preset ) } }
							/>
						) )
					}
				</div>
			</div>
		</>
	);
}

SelectPreset.propTypes = {
	container: PropTypes.object.isRequired,
	setIsRenderPresets: PropTypes.func.isRequired,
};
