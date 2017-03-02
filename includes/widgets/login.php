<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) { exit; } // Exit if accessed directly

class Widget_Login extends Widget_Base {

	public function get_name() {
		return 'login';
	}

	public function get_title() {
		return __( 'Login', 'elementor' );
	}

	public function get_icon() {
		return 'eicon-person';
	}

	public function get_categories() {
		return [ 'general-elements' ];
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_fields_content',
			[
				'label' => __( 'Fields', 'elementor' ),
			]
		);

		$this->add_control(
			'show_labels',
			[
				'label' => __( 'Labels', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
			]
		);

		$this->add_control(
			'input_size',
			[
				'label' => __( 'Input Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'xs' => __( 'Extra Small', 'elementor' ),
					'sm' => __( 'Small', 'elementor' ),
					'md' => __( 'Medium', 'elementor' ),
					'lg' => __( 'Large', 'elementor' ),
					'xl' => __( 'Extra Large', 'elementor' ),
				],
				'default' => 'sm',
			]
		);

		$this->add_control(
			'custom_labels',
			[
				'label' => __( 'Custom Labels', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'label_off' => __( 'No', 'elementor' ),
				'label_on' => __( 'Yes', 'elementor' ),
				'condition' => [
					'show_labels' => 'yes',
				],
			]
		);

		$this->add_control(
			'user_label',
			[
				'label' => __( 'User Label', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'User', 'elementor' ),
				'condition' => [
					'show_labels' => 'yes',
					'custom_labels' => 'yes',
				],
			]
		);

		$this->add_control(
			'user_placeholder',
			[
				'label' => __( 'User Placeholder', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'User', 'elementor' ),
				'condition' => [
					'show_labels' => 'yes',
					'custom_labels' => 'yes',
				],
			]
		);

		$this->add_control(
			'password_label',
			[
				'label' => __( 'Password Label', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'Password', 'elementor' ),
				'condition' => [
					'show_labels' => 'yes',
					'custom_labels' => 'yes',
				],
			]
		);

		$this->add_control(
			'password_placeholder',
			[
				'label' => __( 'Password Placeholder', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'Password', 'elementor' ),
				'condition' => [
					'show_labels' => 'yes',
					'custom_labels' => 'yes',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_button_content',
			[
				'label' => __( 'Submit Button', 'elementor' ),
			]
		);

		$this->add_control(
			'button_text',
			[
				'label' => __( 'Submit Text', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => __( 'Submit', 'elementor' ),
			]
		);

		$this->add_control(
			'button_size',
			[
				'label' => __( 'Submit Size', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'options' => [
					'xs' => __( 'Extra Small', 'elementor' ),
					'sm' => __( 'Small', 'elementor' ),
					'md' => __( 'Medium', 'elementor' ),
					'lg' => __( 'Large', 'elementor' ),
					'xl' => __( 'Extra Large', 'elementor' ),
				],
				'default' => 'sm',
			]
		);

		$this->add_responsive_control(
			'align',
			[
				'label' => __( 'Alignment', 'elementor' ),
				'type' => Controls_Manager::CHOOSE,
				'options' => [
					'start' => [
						'title' => __( 'Left', 'elementor' ),
						'icon' => 'fa fa-align-left',
					],
					'center' => [
						'title' => __( 'Center', 'elementor' ),
						'icon' => 'fa fa-align-center',
					],
					'end' => [
						'title' => __( 'Right', 'elementor' ),
						'icon' => 'fa fa-align-right',
					],
					'stretch' => [
						'title' => __( 'Justified', 'elementor' ),
						'icon' => 'fa fa-align-justify',
					],
				],
				'prefix_class' => 'elementor%s-button-align-',
				'default' => '',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_login_content',
			[
				'label' => __( 'Additional Options', 'elementor' ),
			]
		);

		$this->add_control(
			'show_lost_password',
			[
				'label' => __( 'Lost your password Link', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
			]
		);

		if ( get_option( 'users_can_register' ) ) {
			$this->add_control(
				'show_register',
				[
					'label' => __( 'Register Link', 'elementor' ),
					'type' => Controls_Manager::SWITCHER,
					'default' => 'yes',
					'label_off' => __( 'Hide', 'elementor' ),
					'label_on' => __( 'Show', 'elementor' ),
				]
			);
		}

		$this->add_control(
			'show_remember_me',
			[
				'label' => __( 'Remember me Checkbox', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
			]
		);

		$this->add_control(
			'show_logged_in_message',
			[
				'label' => __( 'Logged in Message', 'elementor' ),
				'type' => Controls_Manager::SWITCHER,
				'default' => 'yes',
				'label_off' => __( 'Hide', 'elementor' ),
				'label_on' => __( 'Show', 'elementor' ),
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			[
				'label' => __( 'Form', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'row_gap',
			[
				'label' => __( 'Rows Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 10,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 60,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group' => 'margin-bottom: {{SIZE}}{{UNIT}};',
					'{{WRAPPER}} .elementor-form-fields-wrapper' => 'margin-bottom: -{{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'links_color',
			[
				'label' => __( 'Links Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group > a' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
			]
		);

		$this->add_control(
			'links_hover_color',
			[
				'label' => __( 'Links Hover Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group > a:hover' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_4,
				],
			]
		);

		$this->add_control(
			'links_gap',
			[
				'label' => __( 'Links Gap', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 5,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 60,
					],
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-login-separator' => 'margin: 0 {{SIZE}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style_labels',
			[
				'label' => __( 'Labels', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'label_spacing',
			[
				'label' => __( 'Spacing', 'elementor' ),
				'type' => Controls_Manager::SLIDER,
				'default' => [
					'size' => 0,
				],
				'range' => [
					'px' => [
						'min' => 0,
						'max' => 60,
					],
				],
				'selectors' => [
					'body {{WRAPPER}} .elementor-field-group > label' => 'padding-bottom: {{SIZE}}{{UNIT}};',
					// for the label position = above option
				],
				'condition' => [
					'show_labels!' => '',
				],
			]
		);

		$this->add_control(
			'label_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group > label, {{WRAPPER}} .elementor-field-subgroup label' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
				'condition' => [
					'show_labels!' => '',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'label_typography',
				'selector' => '{{WRAPPER}} .elementor-field-group > label',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
				'condition' => [
					'show_labels!' => '',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_field_style',
			[
				'label' => __( 'Fields', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->add_control(
			'field_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group .elementor-field' => 'color: {{VALUE}};',
				],
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_3,
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'field_typography',
				'selector' => '{{WRAPPER}} .elementor-field-group .elementor-field, {{WRAPPER}} .elementor-field-subgroup label',
				'scheme' => Scheme_Typography::TYPOGRAPHY_3,
			]
		);

		$this->add_control(
			'field_background_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '#ffffff',
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group .elementor-field:not(.elementor-select-wrapper)' => 'background-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-field-group .elementor-select-wrapper select' => 'background-color: {{VALUE}};',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'field_border_color',
			[
				'label' => __( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group .elementor-field:not(.elementor-select-wrapper)' => 'border-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-field-group .elementor-select-wrapper select' => 'border-color: {{VALUE}};',
					'{{WRAPPER}} .elementor-field-group .elementor-select-wrapper::before' => 'color: {{VALUE}};',
				],
				'separator' => 'before',
			]
		);

		$this->add_control(
			'field_border_width',
			[
				'label' => __( 'Border Width', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'placeholder' => '1',
				'size_units' => [ 'px' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group .elementor-field:not(.elementor-select-wrapper)' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					'{{WRAPPER}} .elementor-field-group .elementor-select-wrapper select' => 'border-width: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'field_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-field-group .elementor-field:not(.elementor-select-wrapper)' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
					'{{WRAPPER}} .elementor-field-group .elementor-select-wrapper select' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_button_style',
			[
				'label' => __( 'Button', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
			]
		);

		$this->start_controls_tabs( 'tabs_button_style' );

		$this->start_controls_tab(
			'tab_button_normal',
			[
				'label' => __( 'Normal', 'elementor' ),
			]
		);

		$this->add_control(
			'button_text_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'default' => '',
				'selectors' => [
					'{{WRAPPER}} .elementor-button' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'button_typography',
				'label' => __( 'Typography', 'elementor' ),
				'scheme' => Scheme_Typography::TYPOGRAPHY_4,
				'selector' => '{{WRAPPER}} .elementor-button',
			]
		);

		$this->add_control(
			'button_background_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_4,
				],
				'selectors' => [
					'{{WRAPPER}} .elementor-button' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(), [
				'name' => 'button_border',
				'label' => __( 'Border', 'elementor' ),
				'placeholder' => '1px',
				'default' => '1px',
				'selector' => '{{WRAPPER}} .elementor-button',
			]
		);

		$this->add_control(
			'button_border_radius',
			[
				'label' => __( 'Border Radius', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-button' => 'border-radius: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'button_text_padding',
			[
				'label' => __( 'Text Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'selectors' => [
					'{{WRAPPER}} .elementor-button' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->end_controls_tab();

		$this->start_controls_tab(
			'tab_button_hover',
			[
				'label' => __( 'Hover', 'elementor' ),
			]
		);

		$this->add_control(
			'button_hover_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-button:hover' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'button_background_hover_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-button:hover' => 'background-color: {{VALUE}};',
				],
			]
		);

		$this->add_control(
			'button_hover_border_color',
			[
				'label' => __( 'Border Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'selectors' => [
					'{{WRAPPER}} .elementor-button:hover' => 'border-color: {{VALUE}};',
				],
				'condition' => [
					'button_border_border!' => '',
				],
			]
		);

		$this->add_control(
			'button_hover_animation',
			[
				'label' => __( 'Animation', 'elementor' ),
				'type' => Controls_Manager::HOVER_ANIMATION,
			]
		);

		$this->end_controls_tab();

		$this->end_controls_tabs();

		$this->end_controls_section();
	}

	private function make_radio_checkbox_field( $item, $item_index, $type ) {
		$options = preg_split( "/\\r\\n|\\r|\\n/", $item['field_options'] );
		$html = '';
		if ( $options ) {
			$html .= '<div class="elementor-field-subgroup ' . esc_attr( $item['css_classes'] ) . ' ' . $item['inline_list'] . '">';
			foreach ( $options as $key => $option ) {
				$html .= '<span class="elementor-field-option"><input type="' . $type . '"
							value="' . esc_attr( $option ) . '"
							id="' . $this->get_attribute_id( $item_index ) . '-' . $key . '"
							name="' . $this->get_attribute_name( $item_index ) . ( ( 'checkbox' === $type && count( $options ) > 1 ) ? '[]"' : '"' ) .
					( ( $item['required'] && 'radio' === $type ) ? ' required aria-required="true"' : '' ) . '>
							<label for="' . $this->get_attribute_id( $item_index ) . '-' . $key . '">' . $option . '</label></span>';
			}
			$html .= '</div>';
		}

		return $html;
	}

	private function form_fields_render_attributes() {
		$settings = $this->get_settings();

		if ( ! empty( $settings['button_size'] ) ) {
			$this->add_render_attribute( 'button', 'class', 'elementor-size-' . $settings['button_size'] );
		}

		if ( $settings['button_hover_animation'] ) {
			$this->add_render_attribute( 'button', 'class', 'elementor-animation-' . $settings['button_hover_animation'] );
		}

		$this->add_render_attribute(
			[
				'wrapper' => [
					'class' => [
						'elementor-form-fields-wrapper',
					],
				],
				'field-group' => [
					'class' => [
						'elementor-field-type-text',
						'elementor-field-group',
						'elementor-column',
						'elementor-col-100',
					],
				],
				'submit-group' => [
					'class' => [
						'elementor-field-group',
						'elementor-column',
						'elementor-field-type-submit',
						'elementor-col-100',
					],
				],

				'button' => [
					'class' => [
						'elementor-button',
					],
					'name' => 'wp-submit',
				],
				'user_label' => [
					'for' => 'user',
				],
				'user_input' => [
					'type' => 'text',
					'name' => 'log',
					'id' => 'user',
					'placeholder' => $settings['user_placeholder'],
					'class' => [
						'elementor-field',
						'elementor-field-textual',
						'elementor-size-' . $settings['input_size'],
					],
				],
				'password_input' => [
					'type' => 'password',
					'name' => 'pwd',
					'id' => 'password',
					'placeholder' => $settings['password_placeholder'],
					'class' => [
						'elementor-field',
						'elementor-field-textual',
						'elementor-size-' . $settings['input_size'],
					],
				],
				//TODO: add unique ID
				'label_user' => [
					'for' => 'user',
					'class' => 'elementor-field-label',
				],

				'label_password' => [
					'for' => 'password',
					'class' => 'elementor-field-label',
				],
			]
		);

		if ( ! $settings['show_labels'] ) {
			$this->add_render_attribute( 'label', 'class', 'elementor-screen-only' );
		}
		$this->add_render_attribute( 'field-group', 'class', 'elementor-field-required' )
			->add_render_attribute( 'input', 'required', true )
			->add_render_attribute( 'input', 'aria-required', 'true' );

	}

	protected function render() {
		$current_url = remove_query_arg( 'fake_arg' );
		$settings = $this->get_settings();

		if ( is_user_logged_in() && ! Plugin::$instance->editor->is_edit_mode() ) {
			if ( 'yes' === $settings['show_logged_in_message'] ) {
				$current_user = wp_get_current_user();
				echo '<div class="elementor-login">' .
					sprintf( __( 'You are Logged in as %1$s (<a href="%2$s">Logout</a>)', 'elementor' ), $current_user->display_name, wp_logout_url( $current_url ) ) .
					'</div>';
			}

			return;
		}

		$this->form_fields_render_attributes();
		?>
		<form class="elementor-login" method="post" action="<?php echo wp_login_url(); ?>">
			<input type="hidden" name="redirect_to" value="<?php echo $current_url;?>">
			<div <?php echo $this->get_render_attribute_string( 'wrapper' ); ?>>
				<div <?php echo $this->get_render_attribute_string( 'field-group' ); ?>>
					<?php
					if ( $settings['show_labels'] ) {
						echo '<label ' . $this->get_render_attribute_string( 'user_label' ) . '>' . $settings['user_label'] . '</label>';
					}

					echo '<input size="1" ' . $this->get_render_attribute_string( 'user_input' ) . '>';

					?>
				</div>
				<div <?php echo $this->get_render_attribute_string( 'field-group' ); ?>>
					<?php
					if ( $settings['show_labels'] ) :
						echo '<label ' . $this->get_render_attribute_string( 'password_label' ) . '>' . $settings['password_label'] . '</label>';
					endif;

					echo '<input size="1" ' . $this->get_render_attribute_string( 'password_input' ) . '>';
					?>
				</div>

				<?php if ( 'yes' === $settings['show_remember_me'] ) : ?>
					<div class="elementor-field-type-checkbox elementor-field-group elementor-column elementor-col-100">
						<label for="elementor-login-remember-me">
							<input type="checkbox" id="elementor-login-remember-me" name="rememberme" value="forever">
							<?php echo __( 'Remember Me', 'elementor' ); ?>
						</label>
					</div>
				<?php endif; ?>
				
				<div <?php echo $this->get_render_attribute_string( 'submit-group' ); ?>>
					<button type="submit" <?php echo $this->get_render_attribute_string( 'button' ); ?>>
							<?php if ( ! empty( $settings['button_text'] ) ) : ?>
								<span class="elementor-button-text"><?php echo $settings['button_text']; ?></span>
							<?php endif; ?>
					</button>
				</div>

				<?php
				$show_lost_password = 'yes' === $settings['show_lost_password'];
				$show_register = get_option( 'users_can_register' ) && 'yes' === $settings['show_register'];

				if ( $show_lost_password || $show_register ) : ?>
					<div class="elementor-field-group elementor-column elementor-col-100">
						<?php if ( $show_lost_password ) : ?>
							<a class="elementor-lost-password" href="<?php echo wp_lostpassword_url( $current_url ); ?>">
								<?php echo __( 'Lost your password?', 'elementor' ); ?>
							</a>
						<?php endif; ?>

						<?php if ( $show_register ) : ?>
							<?php if ( $show_lost_password ) : ?>
								<span class="elementor-login-separator"> | </span>
							<?php endif; ?>
							<a class="elementor-register" href="<?php echo wp_registration_url(); ?>">
								<?php echo __( 'Register', 'elementor' ); ?>
							</a>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		</form>
		<?php
	}

	protected function _content_template() {
		$current_url = remove_query_arg( 'fake_arg' );
		?>
		<div class="elementor-login">
			<div class="elementor-form-fields-wrapper">
				<#
					fieldGroupClasses = 'elementor-field-group elementor-column elementor-col-100 elementor-field-type-text';
				#>
				<div class="{{ fieldGroupClasses }}">
					<# if ( settings.show_labels ) { #>
						<label class="elementor-field-label" for="user" >{{{ settings.user_label }}}</label>
						<# } #>
							<input size="1" type="text" id="user" placeholder="{{ settings.user_placeholder }}" class="elementor-field elementor-field-textual elementor-size-{{ settings.input_size }}" />
				</div>
				<div class="{{ fieldGroupClasses }}">
					<# if ( settings.show_labels ) { #>
						<label class="elementor-field-label" for="password" >{{{ settings.password_label }}}</label>
						<# } #>
							<input size="1" type="password" id="password" placeholder="{{ settings.password_placeholder }}" class="elementor-field elementor-field-textual elementor-size-{{ settings.input_size }}" />
				</div>

				<# if ( settings.show_remember_me ) { #>
					<div class="elementor-field-type-checkbox elementor-field-group elementor-column elementor-col-100">
						<label for="elementor-login-remember-me">
							<input type="checkbox" id="elementor-login-remember-me" name="rememberme" value="forever">
							<?php echo __( 'Remember Me', 'elementor' ); ?>
						</label>
					</div>
				<# } #>

				<div class="elementor-field-group elementor-column elementor-field-type-submit elementor-col-100">
					<button type="submit" class="elementor-button elementor-size-{{ settings.button_size }}">
						<# if ( settings.button_text ) { #>
							<span class="elementor-button-text">{{ settings.button_text }}</span>
						<# } #>
					</button>
				</div>

				<# if ( settings.show_lost_password || settings.show_register ) { #>
					<div class="elementor-field-group elementor-column elementor-col-100">
						<# if ( settings.show_lost_password ) { #>
							<a class="elementor-lost-password" href="<?php echo wp_lostpassword_url( $current_url ); ?>">
								<?php echo __( 'Lost your password?', 'elementor' ); ?>
							</a>
						<# } #>

						<?php if ( get_option( 'users_can_register' ) ) { ?>
							<# if ( settings.show_register ) { #>
								<# if ( settings.show_lost_password ) { #>
									<span class="elementor-login-separator"> | </span>
								<# } #>
								<a class="elementor-register" href="<?php echo wp_registration_url(); ?>">
									<?php echo __( 'Register', 'elementor' ); ?>
								</a>
							<# } #>
						<?php } ?>
					</div>
				<# } #>
			</div>
		</div>
		<?php
	}

	public function render_plain_content() {
	}

}
