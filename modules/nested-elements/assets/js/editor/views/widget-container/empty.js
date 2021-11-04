// TODO: Avoid import this to the module, the helper should exported on the component level.
// Why? if i got the component then probably i'll be required for the utils.
import ContainerHelper from 'elementor-editor-utils/container-helper';

export default class Empty extends React.Component {
	constructor( props ) {
		super( props );

		this.state = {
			isRenderPresets: false,
		};
	}

	onClickItemPlus() {
		this.setState( { isRenderPresets: true } );
	}

	onClickCloseStructure() {
		this.setState( { isRenderPresets: false } );
	}

	onPresetSelected( preset, container ) {
		// Create new one by selected preset.
		ContainerHelper.createContainerFromPresetEx(
			preset,
			container,
			{
				createForTarget: true,
			}
		);
	}

	renderEmpty() {
		return ( <div className="elementor-first-add">
			<div className="elementor-icon eicon-plus" onClick={() => this.onClickItemPlus()}/>
			<div className="elementor-icon eicon-folder"/>
		</div> );
	}

	renderSelectPreset() {
		return (
			<>
				<div className="elementor-add-section-close">
					<i onClick={() => this.onClickCloseStructure()} className="eicon-close" aria-hidden="true"/>
					<span className="elementor-screen-only">{__( 'Close', 'elementor' )}</span>
				</div>
				<div className="e-view e-container-select-preset">
					<div className="e-container-select-preset__title">{__( 'Select your Structure', 'elementor' )}</div>
					<div className="e-container-select-preset__list">
						{
							elementor.presetsFactory.getDefaultPresets().map( ( preset ) => (
								<div onClick={() => this.onPresetSelected( preset, this.props.container )}
									key={preset} className="e-container-preset" data-preset={preset}
									dangerouslySetInnerHTML={{ __html: elementor.presetsFactory.getContainerPreset( preset ) }}/>
							) )
						}
					</div>
				</div>
			</>
		);
	}

	render() {
		return this.state.isRenderPresets ?
			this.renderSelectPreset() : this.renderEmpty();
	}
}

