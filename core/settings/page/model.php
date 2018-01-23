<?php
namespace Elementor\Core\Settings\Page;

use Elementor\Controls_Manager;
use Elementor\Core\Settings\Base\Model as BaseModel;
use Elementor\Group_Control_Background;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Core\Settings\Manager as SettingsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Model extends BaseModel {

	/**
	 * @var \WP_Post
	 */
	private $post;

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct( array $data = [] ) {
		$this->post = get_post( $data['id'] );

		if ( ! $this->post ) {
			$this->post = new \WP_Post( (object) [] );
		}

		parent::__construct( $data );
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function get_name() {
		return 'page-settings';
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function get_unique_name() {
		return $this->get_name() . '-' . $this->post->ID;
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function get_css_wrapper_selector() {
		return 'body.elementor-page-' . $this->get_id();
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function get_panel_page_settings() {
		return [
			'title' => __( 'Document Settings', 'elementor' ),
		];
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function on_export( $element_data ) {
		if ( ! empty( $element_data['settings']['template'] ) && Manager::TEMPLATE_CANVAS !== $element_data['settings']['template'] ) {
			unset( $element_data['settings']['template'] );
		}

		return $element_data;
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 */
	protected function _register_controls() {
		$controls = Plugin::$instance->documents->get( $this->post->ID )->get_controls();

		foreach ( $controls as $control_id => $args ) {
			$this->add_control( $control_id, $args );
		}
	}
}
