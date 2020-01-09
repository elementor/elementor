<?php
namespace Elementor\Core\Kits;

use Elementor\Core\Documents_Manager;
use Elementor\Core\Files\CSS\Post;
use Elementor\Core\Kits\Documents\Kit;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Manager {

	const OPTION_ACTIVE = 'elementor_active_kit';

	public function get_active_id() {
		$id = get_option( self::OPTION_ACTIVE );

		if ( ! $id ) {
			$id = $this->create_default();
			update_option( self::OPTION_ACTIVE, $id );
		}
		return $id;
	}

	public function get_active_kit() {
		$id = $this->get_active_id();

		return Plugin::$instance->documents->get( $id );
	}

	private function create_default() {
		$kit = Plugin::$instance->documents->create( 'kit', [
			'post_title' => __( 'Default Kit', 'elementor' ),
			'post_status' => 'publish',
		] );

		return $kit->get_id();
	}

	/**
	 * @param Documents_Manager $documents_manager
	 */
	public function register_document( $documents_manager ) {
		$documents_manager->register_document_type( 'kit', Kit::get_class_full_name() );
	}

	public function localize_settings( $settings ) {
		$settings = array_replace_recursive( $settings, [
			'kit_id' => $this->get_active_id(),
			'i18n' => [
				'global_settings' => __( 'Global Settings', 'elementor' ),
				'global_styles' => __( 'Global Styles', 'elementor' ),
				'theme_templates' => __( 'Theme Templates', 'elementor' ),
				'site_settings' => __( 'Site Settings', 'elementor' ),
			],
		] );

		return $settings;
	}

	public function frontend_before_enqueue_styles() {
		$kit = $this->get_kit_for_frontend();

		if ( $kit ) {
			$css = Post::create( $kit->get_main_id() );
			$css->enqueue();
		}
	}

	public function render_panel_html() {
		require __DIR__ . '/views/panel.php';
	}

	public function get_kit_for_frontend() {
		$kit = false;

		$preview_id = $this->get_kit_preview_id();

		if ( $preview_id ) {
			$kit = Plugin::$instance->documents->get( $preview_id );
		} else {
			$active_kit = $this->get_active_kit();

			if ( 'publish' === $active_kit->get_main_post()->post_status ) {
				$kit = $active_kit;
			}
		}

		return $kit;
	}

	public function get_kit_preview_id() {
		return empty( $_GET['kit_preview_id' ] ) ? false : $_GET['kit_preview_id'];
	}

	public function __construct() {
		add_action( 'elementor/documents/register', [ $this, 'register_document' ] );
		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_settings' ] );
		add_filter( 'elementor/editor/footer', [ $this, 'render_panel_html' ] );
		add_action( 'elementor/frontend/before_enqueue_styles', [ $this, 'frontend_before_enqueue_styles' ] );
	}
}
