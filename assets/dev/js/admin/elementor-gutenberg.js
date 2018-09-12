//  Import CSS.
// import './style.scss';
// import './editor.scss';

const { __, setLocaleData } = wp.i18n;
const { createElement } = wp.element;
const {
	registerBlockType,
	editable,
} = wp.blocks;
const { InspectorControls } = wp.editor;
const {
	withAPIData,
	ColorPalette,
	SelectControl,
} = wp.components;

const {
	withSelect,
	select
} = wp.data;

// Elementor SVG icon
const elementorIcon = createElement('svg', { width: 20, height: 20, viewBox: "0 0 448 512" },
	createElement('path', { d: 'M425.6 32H22.4C10 32 0 42 0 54.4v403.2C0 470 10 480 22.4 480h403.2c12.4 0 22.4-10 22.4-22.4V54.4C448 42 438 32 425.6 32M164.3 355.5h-39.8v-199h39.8v199zm159.3 0H204.1v-39.8h119.5v39.8zm0-79.6H204.1v-39.8h119.5v39.8zm0-79.7H204.1v-39.8h119.5v39.8z' } )
);

const blockLabel = '';

class ElementorPreviewIFrame extends React.Component {
	render() {
		return <iframe srcDoc={this.props.srcDoc}
		               scrolling="no"
		               frameBorder={0}
		               width="100%"
		               onLoad = { e => setTimeout( () => {
			               const obj = ReactDOM.findDOMNode( this );
			               let previewFrame = document.getElementById( 'elementor-template-' + p.id ),
				               blockContainer =  document.getElementById( 'elementor-template-block-inner' ),
				               containerWidth = blockContainer.offsetWidth,
				               relation = containerWidth / 1170;
			               if ( previewFrame ) {
				               previewFrame.style = 'transform: scale(' + relation + ');';
				               previewFrame.contentWindow.document.body.style = 'user-select: none;';
				               previewFrame.height = previewFrame.contentWindow.document.body.scrollHeight + 50 + 'px';
				               let containerHeight = parseInt( previewFrame.height.replace( 'px' ) ) * relation;
				               blockContainer.style = 'height: ' + ( containerHeight + 50 ) + 'px';
				               //obj.style.height = obj.contentWindow.document.body.scrollHeight + 'px';
			               }
		               }, 50 ) }/>
	}
}

registerBlockType( 'elementor/template', {
	title: __( 'Elementor Template', 'elementor' ),
	icon: elementorIcon,
	category: 'common', //'elementor'
	attributes: {
		selectedTemplate: {
			type: 'number',
			default: 0,
		},
		title: {
			type: 'string',
			default: '',
		}
	},
	// Defines the block within the editor.
	edit: withSelect( ( select, props ) => {
		const { getEntityRecords } = select( 'core' );
		return {
			templates: getEntityRecords( 'postType', 'elementor_library', { per_page: 100 } )
		};
	} )( ( props ) => {

		let onChangeSelectTemplate = value => props.setAttributes( { selectedTemplate: parseInt( value ) } );
		let updateIframeHight = templateID => {
			if ( ! templateID ) {
				return;
			}

			let iframe = document.getElementById( 'elementor-template-' + templateID );
			if ( iframe ) {
				iframe.height = iframe.contentWindow.document.body.scrollHeight + "px";
			}
		};

		if ( ! props.templates ) {
			return __( 'loading', 'elementor' );
		}

		if ( props.templates.length === 0 ) {
			return __( 'No templates Found', 'elementor' );
		}

		let template = props.attributes.selectedTemplate,
			templates = [ { value: 0, label: __( 'Select a Template', 'elementor' ) } ],
			selectedTemplate,
			className = props.className,
			display = __( 'No Template Selected', 'elementor' );

		if ( props.templates.length > 0 ) {
			props.templates.forEach( ( p ) => {

				templates.push( {
					label: p.title.rendered,
					value: p.id
				});

				if ( template === p.id ) {
					props.setAttributes( {
						selectedTemplate: parseInt( p.id ),
						title: p.title.rendered
					} );

					display = (<div id={ 'elementor-template-block-inner' }>
						<p>
							{ __( 'Selected Elementor Template', 'elementor' ) + ':' + props.attributes.title }
							<a
								className={ 'elementor-edit-link button button-primary button-large'}
								target={ '_blank' }
								href={ '/wp-admin/post.php?post=' + p.id + '&action=elementor' }>
								{ __( 'Edit with Elementor', 'elementor' ) }
							</a>
						</p>
						<ElementorPreviewIFrame
							srcDoc={ '/?elementor-block=1&p='+ p.id }
							id={ 'elementor-template-' + p.id }
							className={ 'elementor-block-preview-frame' }/>
					</div>);
				}
			});
		}

		const selectTemplate = <SelectControl
			value={ props.attributes.selectedTemplate }
			onChange={ onChangeSelectTemplate }
			options={ templates } />;


		return (
			<div className={ className }>
				{ selectedTemplate }
				{ display }
			</div>
		);
	}),
	save( props ) {
		return null;
	},
} );