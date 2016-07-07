<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Widget_Countdown extends Widget_Base {

	public function get_id() {
		return 'countdown';
	}

	public function get_title() {
		return __( 'Countdown', 'elementor' );
	}

	public function get_icon() {
		return 'coding';
	}

	protected function _register_controls() {
		$this->add_control(
			'section_date',
			[
				'label' => __( 'Date', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'day',
			[
				'label' => __( 'Day', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 1,
				'max' => 31,
				'section' => 'section_date',
			]
		);

		$this->add_control(
			'month',
			[
				'label' => __( 'Month', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => 1,
				'max' => 12,
				'section' => 'section_date',
			]
		);

		$this->add_control(
			'year',
			[
				'label' => __( 'Year', 'elementor' ),
				'type' => Controls_Manager::NUMBER,
				'min' => date( 'Y' ),
				'section' => 'section_date',
			]
		);

		$this->add_control(
			'time',
			[
				'label' => __( 'Time', 'elementor' ),
				'type' => Controls_Manager::TIME,
				'section' => 'section_date',
			]
		);

		$this->add_control(
			'section_options',
			[
				'label' => __( 'Additional Options', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'show_weeks',
			[
				'label' => __( 'Show Weeks', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_options',
				'default' => 'yes',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'show_days',
			[
				'label' => __( 'Show Days', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_options',
				'default' => 'yes',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'show_hours',
			[
				'label' => __( 'Show Hours', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_options',
				'default' => 'yes',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'show_minutes',
			[
				'label' => __( 'Show Minutes', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_options',
				'default' => 'yes',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'show_seconds',
			[
				'label' => __( 'Show Seconds', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'section' => 'section_options',
				'default' => 'yes',
				'options' => [
					'yes' => __( 'Yes', 'elementor' ),
					'no' => __( 'No', 'elementor' ),
				],
			]
		);

		$this->add_control(
			'section_labels',
			[
				'label' => __( 'Change Labels', 'elementor' ),
				'type' => Controls_Manager::SECTION,
			]
		);

		$this->add_control(
			'weeks_label',
			[
				'label' => __( 'Change Weeks', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_labels',
			]
		);

		$this->add_control(
			'days_label',
			[
				'label' => __( 'Change Days', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_labels',
			]
		);

		$this->add_control(
			'hours_label',
			[
				'label' => __( 'Change Hours', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_labels',
			]
		);

		$this->add_control(
			'minutes_label',
			[
				'label' => __( 'Change Minutes', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_labels',
			]
		);

		$this->add_control(
			'seconds_label',
			[
				'label' => __( 'Change Seconds', 'elementor' ),
				'type' => Controls_Manager::TEXT,
				'section' => 'section_labels',
			]
		);

		// Style Tab - Counter
		$this->add_control(
			'section_style_counter',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Counter', 'elementor' ),
				'tab'   => self::TAB_STYLE,
			]
		);

		$this->add_group_control(
			Group_Control_Border::get_type(),
			[
				'name' => 'counter_border',
				'label' => __( 'Border', 'elementor' ),
				'tab' => self::TAB_STYLE,
				'placeholder' => '1px',
				'default' => '1px',
				'section' => 'section_style_counter',
				'selector' => '{{WRAPPER}} .elementor-countdown div',
			]
		);

		$this->add_control(
			'counter_padding',
			[
				'label' => __( 'Padding', 'elementor' ),
				'type' => Controls_Manager::DIMENSIONS,
				'size_units' => [ 'px', 'em', '%' ],
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_counter',
				'selectors' => [
					'{{WRAPPER}} .elementor-countdown div' => 'padding: {{TOP}}{{UNIT}} {{RIGHT}}{{UNIT}} {{BOTTOM}}{{UNIT}} {{LEFT}}{{UNIT}};',
				],
			]
		);

		$this->add_control(
			'counter_background_color',
			[
				'label' => __( 'Background Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-countdown div' => 'background-color: {{VALUE}};',
				],
				'section' => 'section_style_counter',
			]
		);

		// Number
		$this->add_control(
			'section_style_number',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Number', 'elementor' ),
				'tab'   => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'number_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-countdown .elementor-countdown-duration' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_number',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'number_typography',
				'selector' => '{{WRAPPER}} .elementor-countdown .elementor-countdown-duration',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_number',
			]
		);

		// Text
		$this->add_control(
			'section_style_text',
			[
				'type'  => Controls_Manager::SECTION,
				'label' => __( 'Text', 'elementor' ),
				'tab'   => self::TAB_STYLE,
			]
		);

		$this->add_control(
			'text_color',
			[
				'label' => __( 'Color', 'elementor' ),
				'type' => Controls_Manager::COLOR,
				'tab' => self::TAB_STYLE,
				'selectors' => [
					'{{WRAPPER}} .elementor-countdown .elementor-countdown-text' => 'color: {{VALUE}};',
				],
				'section' => 'section_style_text',
			]
		);

		$this->add_group_control(
			Group_Control_Typography::get_type(),
			[
				'name' => 'text_typography',
				'selector' => '{{WRAPPER}} .elementor-countdown .elementor-countdown-text',
				'tab' => self::TAB_STYLE,
				'section' => 'section_style_text',
			]
		);

	}

	protected function render( $instance = [] ) {
		$date = $instance['year'] . '/' . $instance['month'] . '/' . $instance['day'];
		$time = $instance['time']['hours'] . ':' . $instance['time']['minutes'];

		$new_date = new \DateTime( $date . ' ' . $time );

		$data = ' data-show-weeks=' . $instance['show_weeks'];
		$data .= ' data-show-days=' . $instance['show_days'];
		$data .= ' data-show-hours=' . $instance['show_hours'];
		$data .= ' data-show-minutes=' . $instance['show_minutes'];
		$data .= ' data-show-seconds=' . $instance['show_seconds'];

		$data .= ( ! empty( $instance['weeks_label'] ) ) ? ' data-weeks-label=' . $instance['weeks_label'] : '';
		$data .= ( ! empty( $instance['days_label'] ) ) ? ' data-days-label=' . $instance['days_label'] : '';
		$data .= ( ! empty( $instance['hours_label'] ) ) ? ' data-hours-label=' . $instance['hours_label'] : '';
		$data .= ( ! empty( $instance['minutes_label'] ) ) ? ' data-minutes-label=' . $instance['minutes_label'] : '';
		$data .= ( ! empty( $instance['seconds_label'] ) ) ? ' data-seconds-label=' . $instance['seconds_label'] : '';
		?>
		<div class="elementor-countdown" data-deadline="<?php echo $new_date->format( 'Y-m-d H:i:s' ); ?>" <?php echo $data; ?>></div>
	    <?php
	}

	protected function content_template() {}
}
