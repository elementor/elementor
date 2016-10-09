<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Counter extends Widget_Base {

	public function get_name() {
		return 'counter';
	}

	public function get_title() {
		return __( 'Counter', 'elementor' );
	}

	public function get_icon() {
		return 'counter';
	}

	protected function _register_controls() {
		$this->start_controls_section(
			'section_counter',
			[
				'label' => __( 'Counter', 'elementor' ),
			]
		);

		$this->add_control(
			'starting_number',
			[
				'label' => __( 'Starting Number', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 0,
				'default' => 0,
			]
		);

		$this->add_control(
			'ending_number',
			[
				'label' => __( 'Ending Number', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 100,
				'default' => 100,
			]
		);

		$this->add_control(
			'prefix',
			[
				'label' => __( 'Number Prefix', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'placeholder' => 1,
			]
		);

		$this->add_control(
			'suffix',
			[
				'label' => __( 'Number Suffix', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'default' => '',
				'placeholder' => __( 'Plus', 'elementor' ),
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
			]
		);

		$this->add_control(
			'view',
			[
				'label' => __( 'View', 'elementor' ),
				'type' => Controls_Manager::HIDDEN,
				'default' => 'traditional',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_number',
			[
				'label' => __( 'Number', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
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
				'selector' => '{{WRAPPER}} .elementor-counter-number-wrapper',
			]
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_title',
			[
				'label' => __( 'Title', 'elementor' ),
				'tab' => Controls_Manager::TAB_STYLE,
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
				'selector' => '{{WRAPPER}} .elementor-counter-title',
			]
		);

		$this->end_controls_section();
	}

	protected function _content_template() {
		?>
		<div class="elementor-counter">
			<div class="elementor-counter-number-wrapper">
				<#
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
				#>
			</div>
			<# if ( settings.title ) { #>
				<div class="elementor-counter-title">{{{ settings.title }}}</div>
			<# } #>
		</div>
		<?php
	}

	public function render() {
		$settings = $this->get_settings();
		?>
		<div class="elementor-counter">
			<div class="elementor-counter-number-wrapper">
				<?php
				$prefix = $suffix = '';

				if ( $settings['prefix'] ) {
					$prefix = '<span class="elementor-counter-number-prefix">' . $settings['prefix'] . '</span>';
				}

				$duration = '<span class="elementor-counter-number" data-duration="' . $settings['duration'] . '" data-to_value="' . $settings['ending_number'] . '">' . $settings['starting_number'] . '</span>';

				if ( $settings['suffix'] ) {
					$suffix = '<span class="elementor-counter-number-suffix">' . $settings['suffix'] . '</span>';
				}

				echo $prefix . $duration . $suffix;
				?>
			</div>
			<?php if ( $settings['title'] ) : ?>
				<div class="elementor-counter-title"><?php echo $settings['title']; ?></div>
			<?php endif; ?>
		</div>
		<?php
	}
}
