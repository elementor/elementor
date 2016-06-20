<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Counter extends Widget_Base {

	public function get_id() {
		return 'counter';
	}

	public function get_title() {
		return __( 'Counter', 'elementor' );
	}

	public function get_icon() {
		return 'counter';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_counter',
			[
				'label' => __( 'Counter', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'starting_number',
			[
				'label' => __( 'Starting Number', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'default' => 0,
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'ending_number',
			[
				'label' => __( 'Ending Number', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 100,
				'default' => 100,
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'prefix',
			[
				'label' => __( 'Number Prefix', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'placeholder' => 1,
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'suffix',
			[
				'label' => __( 'Number Suffix', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'placeholder' => __( 'Plus', 'elementor' ),
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'duration',
			[
				'label' => __( 'Animation Duration', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'default' => 2000,
				'min' => 100,
				'step' => 100,
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'label_block' => true,
				'default' => __( 'Cool Number', 'elementor' ),
				'placeholder' => __( 'Cool Number', 'elementor' ),
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
				'section' => 'section_counter',
			]
		);

		$this->add_control(
			'section_number',
			[
				'label' => __( 'Number', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'number_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_1,
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_number',
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-number-wrapper' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography_number',
				'scheme' => Scheme_Typography::TYPOGRAPHY_1,
				'tab' => self::TAB_STYLE,
				'section' => 'section_number',
				'selector' => '{{WRAPPER}} .elementor-counter-number-wrapper',
			]
		);

		$this->add_control(
			'section_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'type' => Controls_Manager::SECTION,
				'tab' => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'title_color',
			[
				'label' => __( 'Text Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'scheme' => [
					'type' => Scheme_Color::get_type(),
					'value' => Scheme_Color::COLOR_2,
				],
				'tab' => self::TAB_STYLE,
				'section' => 'section_title',
				'selectors' => [
					'{{WRAPPER}} .elementor-counter-title' => 'color: {{VALUE}};',
				],
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'typography_title',
				'scheme' => Scheme_Typography::TYPOGRAPHY_2,
				'tab' => self::TAB_STYLE,
				'section' => 'section_title',
				'selector' => '{{WRAPPER}} .elementor-counter-title',
			]
		);
	}

	protected function content_template() {
		?>
		<div class="elementor-counter">
			<div class="elementor-counter-number-wrapper">
				<%
				var prefix = '',
					suffix = '';

				if ( settings.prefix ) {
					prefix = '<span class="elementor-counter-number-prefix">' + settings.prefix + '</span>';
				}

				var duration = '<span class="elementor-counter-number" data-duration="' + settings.duration + '" data-to_value="' + settings.ending_number + '">' + settings.starting_number + '</span>';

				if ( settings.suffix ) {
					suffix = '<span class="elementor-counter-number-suffix">' + settings.suffix + '</span>';
				}

				print( prefix + duration + suffix );
				%>
			</div>
			<% if ( settings.title ) { %>
				<div class="elementor-counter-title"><%= settings.title %></div>
			<% } %>
		</div>
		<?php
	}

	public function render( $instance = [] ) {
		?>
		<div class="elementor-counter">
			<div class="elementor-counter-number-wrapper">
				<?php
				$prefix = $suffix = '';

				if ( $instance['prefix'] ) {
					$prefix = '<span class="elementor-counter-number-prefix">' . $instance['prefix'] . '</span>';
				}

				$duration = '<span class="elementor-counter-number" data-duration="' . $instance['duration'] . '" data-to_value="' . $instance['ending_number'] . '">' . $instance['starting_number'] . '</span>';

				if ( $instance['suffix'] ) {
					$suffix = '<span class="elementor-counter-number-suffix">' . $instance['suffix'] . '</span>';
				}

				echo $prefix . $duration . $suffix;
				?>
			</div>
			<?php if ( $instance['title'] ) : ?>
				<div class="elementor-counter-title"><?php echo $instance['title']; ?></div>
			<?php endif; ?>
		</div>
		<?php
	}
}
