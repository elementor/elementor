<?php
namespace Elementor\Modules\Promotions\Widgets;

use Elementor\Widget_Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Pro_Widget_Promotion extends Widget_Base {

	private $widget_data;

	public function hide_on_search() {
		return true;
	}

	public function show_in_panel() {
		return false;
	}

	public function get_name() {
		return $this->widget_data['widget_name'];
	}

	public function get_title() {
		return $this->widget_data['widget_title'];
	}

	public function on_import( $element ) {
		$element['settings']['__should_import'] = true;

		return $element;
	}

	protected function register_controls() {}

	protected function render() {
		if ( $this->is_editor_render() ) {
			$this->render_promotion();
		} else {
			$this->render_empty_content();
		}
	}

	private function is_editor_render(): bool {
		return \Elementor\Plugin::$instance->editor->is_edit_mode();
	}

	private function render_promotion() {
		echo '<div class="e-widget-pro">
				<span class="e-badge"><i class="eicon-lock" aria-hidden="true"></i> Pro</span>
				<p>
				<img src="http://dev.elementor.local/wp-content/plugins/elementor/assets/images/go-pro.svg" loading="lazy">
				This result includes the Elementor Pro {{widget name}} widget that\'s not available in your plan. Upgrade to use all the widgets in this result.</p>
				<div class="e-widget-pro-actions">
					<a href="#" class="e-btn e-btn-txt e-promotion-delete">Delete</a>
					<a href="https://go.elementor.com/go-pro-element-pro/" target="_blank" class="e-btn go-pro elementor-clickable">Upgrade</a>
				</div>
			</div>';
	}

	private function render_empty_content() {
		echo ' ';
	}

	protected function content_template() {}

	public function __construct( $data = [], $args = null ) {
		$this->widget_data = [
			'widget_name' => $args['widget_name'],
			'widget_title' => $args['widget_title'],
		];

		parent::__construct( $data, $args );
	}

	public function render_plain_content( $instance = [] ) {}
}
