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

	public function get_categories() {
		return [ 'pro' ];
	}

	public function get_icon() {
		return 'eicon-wordpress';
	}

	public function get_keywords() {
		return [ 'pro', 'widget' ];
	}

	public function get_help_url() {
		return '';
	}

	protected function register_controls() {}

	protected function render() {
		echo 'Promotion Widget';
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
