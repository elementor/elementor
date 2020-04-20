<?php
namespace Elementor\Core\Kits\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Core\Kits\Documents\Tabs;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Kit extends PageBase {

	/**
	 * @var Tabs\Lightbox
	 */
	private $lightbox_tab;
	/**
	 * @var Tabs\Colors_And_Typography
	 */
	private $colors_and_typography_tab;
	/**
	 * @var Tabs\Theme_Style
	 */
	private $theme_style_tab;
	/**
	 * @var Tabs\Layout_Settings
	 */
	private $layout_settings_tab;

	public function __construct( array $data = [] ) {
		parent::__construct( $data );

		$this->lightbox_tab = new Tabs\Lightbox( $this );
		$this->colors_and_typography_tab = new Tabs\Colors_And_Typography( $this );
		$this->layout_settings_tab = new Tabs\Layout_Settings( $this );
		$this->theme_style_tab = new Tabs\Theme_Style( $this );
	}

	public static function get_properties() {
		$properties = parent::get_properties();

		$properties['has_elements'] = false;
		$properties['show_in_finder'] = false;
		$properties['show_on_admin_bar'] = false;
		$properties['edit_capability'] = 'edit_theme_options';
		$properties['support_kit'] = true;

		return $properties;
	}

	public function get_name() {
		return 'kit';
	}

	public static function get_title() {
		return __( 'Kit', 'elementor' );
	}

	protected function get_have_a_look_url() {
		return '';
	}

	public static function get_editor_panel_config() {
		$config = parent::get_editor_panel_config();
		$config['default_route'] = 'panel/global/menu';

		return $config;
	}

	public function get_css_wrapper_selector() {
		return 'body.elementor-kit-' . $this->get_main_id();
	}

	/**
	 * @since 2.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->register_document_controls();

		$this->lightbox_tab->register_controls();
		$this->colors_and_typography_tab->register_controls();
		$this->layout_settings_tab->register_controls();
		$this->theme_style_tab->register_controls();
	}

	protected function get_post_statuses() {
		return [
			'draft' => sprintf( '%s (%s)', __( 'Disabled', 'elementor' ), __( 'Draft', 'elementor' ) ),
			'publish' => __( 'Published', 'elementor' ),
		];
	}
}
