import { ElementorPreviewIFrame } from './components/preview-frame'

const { __ } = wp.i18n;
const { createElement } = wp.element;
const {
	registerBlockType,
} = wp.blocks;
const { InspectorControls } = wp.editor;
const {
	SelectControl,
} = wp.components;

const {
	withSelect,
} = wp.data;

// Elementor SVG icon
const ElementorIcon = createElement('svg', { width: 20, height: 20, viewBox: "0 0 448 512" },
	createElement('path', {
		d: 'M425.6 32H22.4C10 32 0 42 0 54.4v403.2C0 470 10 480 22.4 480h403.2c12.4 0 22.4-10 22.4-22.4V54.4C448 42 438 32 425.6 32M164.3 355.5h-39.8v-199h39.8v199zm159.3 0H204.1v-39.8h119.5v39.8zm0-79.6H204.1v-39.8h119.5v39.8zm0-79.7H204.1v-39.8h119.5v39.8z'
	} )
);

registerBlockType( 'elementor/template', {
	title: __( 'Elementor Template', 'elementor' ),
	icon: ElementorIcon,
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

		if ( ! props.templates ) {
			return __( 'Loading', 'elementor' );
		}

		if ( props.templates.length === 0 ) {
			return __( 'No templates Found', 'elementor' );
		}

		let template = props.attributes.selectedTemplate,
			templates = [ {
				value: 0,
				label: __( 'Select a Template', 'elementor' )
			} ],
			className = props.className,
			editWithElementor = '',
			display = '';

		const templateSelectControl = (
			<SelectControl
				value={ props.attributes.selectedTemplate }
				onChange={ (value) => props.setAttributes( { selectedTemplate: parseInt( value ) } ) }
				options={ templates } />
		);

		if ( props.templates.length > 0 ) {
			props.templates.forEach( ( p ) => {

				templates.push( {
					label: p.title.rendered,
					value: p.id
				} );

				if ( template === p.id ) {
					props.setAttributes( {
						selectedTemplate: parseInt( p.id ),
						title: p.title.rendered
					} );

					editWithElementor = ( <a
						className={ 'elementor-edit-link button button-primary button-large'}
						target={ '_blank' }
						href={ '/wp-admin/post.php?post=' + p.id + '&action=elementor' }>
						{ __( 'Edit Template with Elementor', 'elementor' ) }
					</a> );

					display = (
						<div id={ 'elementor-template-block-inner-' + p.id  }>
							<ElementorPreviewIFrame
								srcDoc={ '/?elementor-block=1&p='+ p.id }
								id={ 'elementor-template-' + p.id }
								templateId={ p.id }
								className={ 'elementor-block-preview-frame' }/>
						</div>
					);
				}
			});
		}

		if ( '' === display ) {
			display = (
				<div>
					{ __( 'No Template Selected', 'elementor' ) }
					{ templateSelectControl }
				</div>
			);
		}

		const inspectorPanel = (
			<InspectorControls key="inspector">
				{ templateSelectControl }
				{ editWithElementor }
			</InspectorControls>
		);


		return (
			<div className={ className }>
				{ inspectorPanel }
				{ display }
			</div>
		);
	}),

	save( props ) {
		return null;
	}
} );