<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

use Elementor\Core\Kits\Documents\Tabs\Global_Colors;
use Elementor\Core\Kits\Documents\Tabs\Global_Typography;

/**
 * Elementor image box widget.
 *
 * Elementor widget that displays an image, a headline and a text.
 *
 * @since 1.0.0
 */
class Widget_Image_Box extends Widget_Base {

	/**
	 * Get widget name.
	 *
	 * Retrieve image box widget name.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget name.
	 */
	public function get_name() {
		return 'image-box';
	}

	/**
	 * Get widget title.
	 *
	 * Retrieve image box widget title.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget title.
	 */
	public function get_title() {
		return esc_html__( 'Image Box', 'elementor' );
	}

	/**
	 * Get widget icon.
	 *
	 * Retrieve image box widget icon.
	 *
	 * @since 1.0.0
	 * @access public
	 *
	 * @return string Widget icon.
	 */
	public function get_icon() {
		return 'eicon-image-box';
	}

	/**
	 * Get widget keywords.
	 *
	 * Retrieve the list of keywords the widget belongs to.
	 *
	 * @since 2.1.0
	 * @access public
	 *
	 * @return array Widget keywords.
	 */
	public function get_keywords() {
		return array( 'image', 'photo', 'visual', 'box' );
	}

	protected function is_dynamic_content(): bool {
		return false;
	}

	/**
	 * Get style dependencies.
	 *
	 * Retrieve the list of style dependencies the widget requires.
	 *
	 * @since 3.24.0
	 * @access public
	 *
	 * @return array Widget style dependencies.
	 */
	public function get_style_depends(): array {
		return array( 'widget-image-box' );
	}

	public function has_widget_inner_wrapper(): bool {
		return ! Plugin::$instance->experiments->is_feature_active( 'e_optimized_markup' );
	}

	/**
	 * Register image box widget controls.
	 *
	 * Adds different input fields to allow the user to change and customize the widget settings.
	 *
	 * @since 3.1.0
	 * @access protected
	 */
	protected function register_controls() {
		$this->start_controls_section(
			'section_image',
			array(
				'label' => esc_html__( 'Image Box', 'elementor' ),
			)
		);

		$this->add_control(
			'image',
			array(
				'label' => esc_html__( 'Choose Image', 'elementor' ),
				'type' => Controls_Manager::MEDIA,
				'dynamic' => array(
					'active' => true,
				),
				'default' => array(
					'url' => Utils::get_placeholder_image_src(),
				),
			)
		);

		$this->add_group_control(
			Group_Control_Image_Size::get_type(),
			array(
				'name' => 'thumbnail', // Usage: `{name}_size` and `{name}_custom_dimension`, in this case `thumbnail_size` and `thumbnail_custom_dimension`.
				'default' => 'full',
				'condition' => array(
					'image[url]!' => '',
				),
			)
		);

		$this->add_control(
			'title_text',
			array(
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'dynamic' => array(
					'active' => true,
				),
				'default' => esc_html__( 'This is the heading', 'elementor' ),
				'placeholder' => esc_html__( 'Enter your title', 'elementor' ),
				'label_block' => true,
			)
		);

		$this->add_control(
			'description_text',
			array(
				'label' => esc_html__( 'Description', 'elementor' ),
				'type' => Controls_Manager::TEXTAREA,
				'dynamic' => array(
					'active' => true,
				),
				'default' => esc_html__( 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.', 'elementor' ),
				'placeholder' => esc_html__( 'Enter your description', 'elementor' ),
				'rows' => 10,
			)
		);

		$this->add_control(
			'link',
			array(
				'label' => esc_html__( 'Link', 'elementor' ),
				'type' => Controls_Manager::URL,
				'dynamic' => array(
					'active' => true,
				),
				'separator' => 'before',
			)
		);

		$this->add_control(
			'title_size',
			array(
				'label' => esc_html__( 'Title HTML Tag', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => array(
					'h1' => 'H1',
					'h2' => 'H2',
					'h3' => 'H3',
					'h4' => 'H4',
					'h5' => 'H5',
					'h6' => 'H6',
					'div' => 'div',
					'span' => 'span',
					'p' => 'p',
				),
				'default' => 'h3',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_box',
			array(
				'label' => esc_html__( 'Box', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_responsive_control(
			'position',
			array(
				'label' => esc_html__( 'Image Position', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'default' => 'top',
				'options' => array(
					'left' => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-h-align-left',
					),
					'top' => array(
						'title' => esc_html__( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-h-align-right',
					),
				),
				'prefix_class' => 'elementor-position-',
				'toggle' => false,
				'condition' => array(
					'image[url]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'content_vertical_alignment',
			array(
				'label' => esc_html__( 'Vertical Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'top' => array(
						'title' => esc_html__( 'Top', 'elementor' ),
						'icon' => 'eicon-v-align-top',
					),
					'middle' => array(
						'title' => esc_html__( 'Middle', 'elementor' ),
						'icon' => 'eicon-v-align-middle',
					),
					'bottom' => array(
						'title' => esc_html__( 'Bottom', 'elementor' ),
						'icon' => 'eicon-v-align-bottom',
					),
				),
				'default' => 'top',
				'toggle' => false,
				'prefix_class' => 'elementor-vertical-align-',
				'condition' => array(
					'position!' => 'top',
				),
			)
		);

		$this->add_responsive_control(
			'text_align',
			array(
				'label' => esc_html__( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => array(
					'left' => array(
						'title' => esc_html__( 'Left', 'elementor' ),
						'icon' => 'eicon-text-align-left',
					),
					'center' => array(
						'title' => esc_html__( 'Center', 'elementor' ),
						'icon' => 'eicon-text-align-center',
					),
					'right' => array(
						'title' => esc_html__( 'Right', 'elementor' ),
						'icon' => 'eicon-text-align-right',
					),
					'justify' => array(
						'title' => esc_html__( 'Justified', 'elementor' ),
						'icon' => 'eicon-text-align-justify',
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-wrapper' => 'text-align: {{VALUE}};',
				),
				'separator' => 'after',
			)
		);

		$this->add_responsive_control(
			'image_space',
			array(
				'label' => esc_html__( 'Image Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'default' => array(
					'size' => 15,
				),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}.elementor-position-right .elementor-image-box-img' => 'margin-left: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.elementor-position-left .elementor-image-box-img' => 'margin-right: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}}.elementor-position-top .elementor-image-box-img' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'(mobile){{WRAPPER}} .elementor-image-box-img' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
				'condition' => array(
					'image[url]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'title_bottom_space',
			array(
				'label' => esc_html__( 'Content Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', 'em', 'rem', 'custom' ),
				'range' => array(
					'px' => array(
						'max' => 100,
					),
					'em' => array(
						'min' => 0,
						'max' => 10,
					),
					'rem' => array(
						'min' => 0,
						'max' => 10,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-title' => 'margin-bottom: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_image',
			array(
				'label' => esc_html__( 'Image', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
				'condition' => array(
					'image[url]!' => '',
				),
			)
		);

		$this->add_responsive_control(
			'image_size',
			array(
				'label' => esc_html__( 'Width', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => 30,
					'unit' => '%',
				),
				'tablet_default' => array(
					'unit' => '%',
				),
				'mobile_default' => array(
					'unit' => '%',
				),
				'size_units' => array( 'px', '%', 'em', 'rem', 'vw', 'custom' ),
				'range' => array(
					'%' => array(
						'min' => 5,
						'max' => 100,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-wrapper .elementor-image-box-img' => 'width: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			array(
				'name' => 'image_border',
				'selector' => '{{WRAPPER}} .elementor-image-box-img img',
				'separator' => 'before',
			)
		);

		$this->add_responsive_control(
			'image_border_radius',
			array(
				'label' => esc_html__( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'size_units' => array( 'px', '%', 'em', 'rem', 'custom' ),
				'separator' => 'after',
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-img img' => 'border-radius: {{SIZE}}{{UNIT}};',
				),
			)
		);

		$this->start_controls_tabs( 'image_effects' );

		$this->start_controls_tab(
			'normal',
			array(
				'label' => esc_html__( 'Normal', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name' => 'css_filters',
				'selector' => '{{WRAPPER}} .elementor-image-box-img img',
			)
		);

		$this->add_control(
			'image_opacity',
			array(
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'max' => 1,
						'min' => 0.10,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-img img' => 'opacity: {{SIZE}};',
				),
			)
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'hover',
			array(
				'label' => esc_html__( 'Hover', 'elementor' ),
			)
		);

		$this->add_group_control(
			Group_Control_Css_Filter::get_type(),
			array(
				'name' => 'css_filters_hover',
				'selector' => '{{WRAPPER}}:hover .elementor-image-box-img img',
			)
		);

		$this->add_control(
			'image_opacity_hover',
			array(
				'label' => esc_html__( 'Opacity', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'range' => array(
					'px' => array(
						'max' => 1,
						'min' => 0.10,
						'step' => 0.01,
					),
				),
				'selectors' => array(
					'{{WRAPPER}}:hover .elementor-image-box-img img' => 'opacity: {{SIZE}};',
				),
			)
		);

		$this->add_control(
			'background_hover_transition',
			array(
				'label' => esc_html__( 'Transition Duration', 'elementor' ) . ' (s)',
				'type' => Controls_Manager::SLIDER,
				'default' => array(
					'size' => 0.3,
				),
				'range' => array(
					'px' => array(
						'min' => 0,
						'max' => 3,
						'step' => 0.1,
					),
				),
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-img img' => 'transition-duration: {{SIZE}}s',
				),
			)
		);

		$this->add_control(
			'hover_animation',
			array(
				'label' => esc_html__( 'Hover Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			)
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_content',
			array(
				'label' => esc_html__( 'Content', 'elementor' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'heading_title',
			array(
				'label' => esc_html__( 'Title', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'title_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-title' => 'color: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_PRIMARY,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'title_typography',
				'selector' => '{{WRAPPER}} .elementor-image-box-title',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_PRIMARY,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Stroke::get_type(),
			array(
				'name' => 'title_stroke',
				'selector' => '{{WRAPPER}} .elementor-image-box-title',
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'title_shadow',
				'selector' => '{{WRAPPER}} .elementor-image-box-title',
			)
		);

		$this->add_control(
			'heading_description',
			array(
				'label' => esc_html__( 'Description', 'elementor' ),
				'type' => Controls_Manager::HEADING,
				'separator' => 'before',
			)
		);

		$this->add_control(
			'description_color',
			array(
				'label' => esc_html__( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => array(
					'{{WRAPPER}} .elementor-image-box-description' => 'color: {{VALUE}};',
				),
				'global' => array(
					'default' => Global_Colors::COLOR_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			array(
				'name' => 'description_typography',
				'selector' => '{{WRAPPER}} .elementor-image-box-description',
				'global' => array(
					'default' => Global_Typography::TYPOGRAPHY_TEXT,
				),
			)
		);

		$this->add_group_control(
			Group_Control_Text_Shadow::get_type(),
			array(
				'name' => 'description_shadow',
				'selector' => '{{WRAPPER}} .elementor-image-box-description',
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Render image box widget output on the frontend.
	 *
	 * Written in PHP and used to generate the final HTML.
	 *
	 * @since 1.0.0
	 * @access protected
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();

		$has_image = ! empty( $settings['image']['url'] );
		$has_content = ! Utils::is_empty( $settings['title_text'] ) || ! Utils::is_empty( $settings['description_text'] );

		if ( ! $has_image && ! $has_content ) {
			return;
		}

		$html = '<div class="elementor-image-box-wrapper">';

		if ( ! empty( $settings['link']['url'] ) ) {
			$this->add_link_attributes( 'link', $settings['link'] );
		}

		if ( $has_image ) {

			$image_html = wp_kses_post( Group_Control_Image_Size::get_attachment_image_html( $settings, 'thumbnail', 'image' ) );

			if ( ! empty( $settings['link']['url'] ) ) {
				$image_html = '<a ' . $this->get_render_attribute_string( 'link' ) . ' tabindex="-1">' . $image_html . '</a>';
			}

			$html .= '<figure class="elementor-image-box-img">' . $image_html . '</figure>';
		}

		if ( $has_content ) {
			$html .= '<div class="elementor-image-box-content">';

			if ( ! Utils::is_empty( $settings['title_text'] ) ) {
				$this->add_render_attribute( 'title_text', 'class', 'elementor-image-box-title' );

				$this->add_inline_editing_attributes( 'title_text', 'none' );

				$title_html = $settings['title_text'];

				if ( ! empty( $settings['link']['url'] ) ) {
					$title_html = '<a ' . $this->get_render_attribute_string( 'link' ) . '>' . $title_html . '</a>';
				}

				$html .= sprintf( '<%1$s %2$s>%3$s</%1$s>', Utils::validate_html_tag( $settings['title_size'] ), $this->get_render_attribute_string( 'title_text' ), $title_html );
			}

			if ( ! Utils::is_empty( $settings['description_text'] ) ) {
				$this->add_render_attribute( 'description_text', 'class', 'elementor-image-box-description' );

				$this->add_inline_editing_attributes( 'description_text' );

				$html .= sprintf( '<p %1$s>%2$s</p>', $this->get_render_attribute_string( 'description_text' ), $settings['description_text'] );
			}

			$html .= '</div>';
		}

		$html .= '</div>';

		Utils::print_unescaped_internal_string( $html );
	}

	/**
	 * Render image box widget output in the editor.
	 *
	 * Written as a Backbone JavaScript template and used to generate the live preview.
	 *
	 * @since 2.9.0
	 * @access protected
	 */
	protected function content_template() {
		?>
		<#
		var hasImage = !! settings.image.url;
		var hasContent = !! ( settings.title_text || settings.description_text );

		if ( ! hasImage && ! hasContent ) {
			return;
		}

		var html = '<div class="elementor-image-box-wrapper">';

		if ( hasImage ) {
			var image = {
				id: settings.image.id,
				url: settings.image.url,
				size: settings.thumbnail_size,
				dimension: settings.thumbnail_custom_dimension,
				model: view.getEditModel()
			};

			var image_url = elementor.imagesManager.getImageUrl( image );

			var imageHtml = '<img src="' + _.escape( image_url ) + '" class="elementor-animation-' + _.escape( settings.hover_animation ) + '" />';

			if ( settings.link.url ) {
				imageHtml = '<a href="' + elementor.helpers.sanitizeUrl( settings.link.url ) + '" tabindex="-1">' + imageHtml + '</a>';
			}

			html += '<figure class="elementor-image-box-img">' + imageHtml + '</figure>';
		}

		if ( hasContent ) {
			html += '<div class="elementor-image-box-content">';

			if ( settings.title_text ) {
				var title_html = elementor.helpers.sanitize( settings.title_text ),
					titleSizeTag = elementor.helpers.validateHTMLTag( settings.title_size );

				if ( settings.link.url ) {
					title_html = '<a href="' + elementor.helpers.sanitizeUrl( settings.link.url ) + '">' + title_html + '</a>';
				}

				view.addRenderAttribute( 'title_text', 'class', 'elementor-image-box-title' );

				view.addInlineEditingAttributes( 'title_text', 'none' );

				html += '<' + titleSizeTag  + ' ' + view.getRenderAttributeString( 'title_text' ) + '>' + title_html + '</' + titleSizeTag  + '>';
			}

			if ( settings.description_text ) {
				view.addRenderAttribute( 'description_text', 'class', 'elementor-image-box-description' );

				view.addInlineEditingAttributes( 'description_text' );

				html += '<p ' + view.getRenderAttributeString( 'description_text' ) + '>' + settings.description_text + '</p>';
			}

			html += '</div>';
		}

		html += '</div>';

		print( html );
		#>
		<?php
	}
}
