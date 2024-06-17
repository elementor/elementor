<?php

namespace Elementor;

class Widget_Heading_V2 {
	private $settings = [];
	private $id = '';

	public function __construct( $settings = [] ) {
		$this->settings = $settings;

		if ( isset( $settings['id'] ) ){
			$this->id = $settings['id'];
		}
	}

	public function get_name(): string {
		return 'heading-v2';
	}

	public function get_defaults(): array {
		return [
			'tag' => 'h2',
			'text' => 'Heading',
		];
	}

	public function get_default_args() {
		return [];
	}

	public function get_controls(): array {
		return [];
	}

	public function get_config() {
		return [
			'title' => 'Heading V2',
			'icon' => 'eicon-t-letter',
			'categories' => [ 'basic' ],
			'keywords' => [ 'heading', 'title', 'text' ],
			'controls' => [],
//			'defaults' => $this->get_defaults(),
			'name' => $this->get_name(),
			'show_in_panel' => true,
			'hide_on_search' => false,
			'elType' => 'widget',
			'widgetType' => 'heading-v2',
			'widget_type' => 'heading-v2',
			'html_wrapper_class' => 'elementor-widget-heading-v2',
			'tabs_controls' => [],
		];
	}

	public function get_raw_data( $with_html_content = false ) {
		$data =  [
			'id' => $this->get_id(),
			'elType' => 'widget',
			'settings' => [],
			'elements' => [],
			'isInner' => false,
		];

		if ( $with_html_content ) {
			ob_start();
			$this->render_content();
			$data['elements'] = ob_get_clean();
		}

		return $data;
	}

	public function get_id() {
		return $this->id;
	}

	public function get_data() {
		return [];
	}

	public function render_content(): void {
		$tag = 'h2';
		$text = 'Heading V2';

		echo "<div class=\"elementor-element elementor-element-$this->id elementor-widget elementor-widget-$this->id\" data-widget_type='heading-v2' data-id='$this->id' data-element_type='widget'>
					<$tag>$text</$tag>
				</div>";
	}

	public function get_class_name() {
		return __CLASS__;
	}

	public function get_data_for_save() {
		return [
			'id' => $this->get_name(),
			'settings' => $this->settings,
			'elType' => 'widget',
			'widgetType' => 'heading-v2',
			'widget_type' => 'heading-v2',
			'elements' => [],
			'title' => 'Heading V2',
		];
	}

	public function get_settings() {
		return $this->settings;
	}

	public function is_dynamic() {
		return false;
	}

	public function get_parsed_dynamic_settings() {
		return [];
	}

	public function get_controls_settings(){
		return [];
	}

	public function parse_dynamic_settings() {
		return [];
	}

	public function get_active_settings() {
		return [];
	}

	public function print_element() {
		$this->render_content();
	}

	public function get_unique_selector() {
		return ".elementor-element-$this->id";
	}
	public function print_template() {}

	public function enqueue_scripts() {}

	public function enqueue_styles() {}

}
