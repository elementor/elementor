<?php
namespace Elementor\Core\Kits\Documents;

use Elementor\Core\DocumentTypes\PageBase;
use Elementor\Core\Kits\Documents\Tabs;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Kit extends PageBase {

	/**
	 * @var Tabs\Tab_Base[]
	 */
	private $tabs;

	public function __construct( array $data = [] ) {
		parent::__construct( $data );

		$this->tabs = [
			'site_identity' => new Tabs\Site_Identity( $this ),
			'lightbox' => new Tabs\Lightbox( $this ),
			'colors_and_typography' => new Tabs\Colors_And_Typography( $this ),
			'layout_settings' => new Tabs\Layout_Settings( $this ),
			//'theme_style' => new Tabs\Theme_Style( $this ),
		];
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

	public function save( $data ) {
		$saved = parent::save( $data );

		if ( $saved ) {
			foreach ( $this->tabs as $tab ) {
				$tab->on_save( $data );
			}
		}

		return $saved;
	}

	/**
	 * @since 2.0.0
	 * @access protected
	 */
	protected function _register_controls() {
		$this->register_document_controls();

		foreach ( $this->tabs as $tab ) {
			$tab->register_controls();
		}
	}

	protected function get_post_statuses() {
		return [
			'draft' => sprintf( '%s (%s)', __( 'Disabled', 'elementor' ), __( 'Draft', 'elementor' ) ),
			'publish' => __( 'Published', 'elementor' ),
		];
	}
}
