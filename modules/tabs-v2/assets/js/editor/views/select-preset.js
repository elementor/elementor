/* eslint-disable jsx-a11y/click-events-have-key-events */
export default function SelectPreset( props ) {
	const containerHelper = elementor.helpers.container,
		onPresetSelected = ( preset, container ) => {
			const options = {
				createWrapper: false,
			};

			// Create new one by selected preset.
			containerHelper.createContainerFromPreset( preset, container, options );
		};

	return (
		<>
			<div className="elementor-add-section-close">
				<i onClick={ () => props.setIsRenderPresets( false ) } className="eicon-close" aria-hidden="true" />
				<span className="elementor-screen-only">{ __( 'Close', 'elementor' ) }</span>
			</div>
			<div className="e-view e-con-select-preset">
				<div className="e-con-select-preset__title">{ __( 'Select your Structure', 'elementor' ) }</div>
				<div className="e-con-select-preset__list">
					{
						elementor.presetsFactory.getContainerPresets().map( ( preset ) => (
							<div
								onClick={ () => onPresetSelected( preset, props.container ) }
								key={ preset }
								className="e-con-preset"
								data-preset={ preset }
								dangerouslySetInnerHTML={ { __html: elementor.presetsFactory.generateContainerPreset( preset ) } }
								role="button"
								tabIndex="0"
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
