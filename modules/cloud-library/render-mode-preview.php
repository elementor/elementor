<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Preview extends Render_Mode_Base {
	const ENQUEUE_SCRIPTS_PRIORITY = 1000;

	const MODE = 'cloud-template-preview';

	protected int $template_id;

	public function __construct( $template_id ) {
		$this->template_id = $template_id;
		$this->document = $this->create_document();

		Plugin::$instance->db->switch_to_post( $this->document->get_main_id() );

		// Switch to document BEFORE calling parent constructor
		Plugin::$instance->documents->switch_to_document( $this->document );

		// Add template filter immediately to ensure it's applied before template selection
		add_filter( 'template_include', [ $this, 'filter_template' ] );

		// Add body class filter immediately to ensure correct classes are set
		add_filter( 'body_class', [ $this, 'filter_body_class' ], 999 );

		// Add cleanup action to run after page is fully rendered
		add_action( 'wp_footer', [ $this, 'cleanup' ], 999 );

		// Set the module to use for rendering
		add_filter( 'elementor/render_mode/module', [ $this, 'filter_render_mode_module' ] );

		parent::__construct( $this->document->get_main_id() );
	}

	public static function get_name() {
		return self::MODE;
	}

	public function prepare_render() {
		parent::prepare_render();
		show_admin_bar( false );
	}

	public function filter_template() {
		return ELEMENTOR_PATH . 'modules/page-templates/templates/canvas.php';
	}

	public function filter_body_class( $classes ) {
		// Remove any existing elementor-page classes
		$classes = array_filter( $classes, function( $class ) {
			return ! preg_match( '/^elementor-page/', $class );
		} );

		// Add the correct elementor-page class for our document
		$classes[] = 'elementor-page elementor-page-' . $this->document->get_main_id();

		return $classes;
	}

	public function cleanup() {
		// Clean up the temporary document after screenshot is taken
		if ( $this->document && $this->document->get_main_id() ) {
			wp_delete_post( $this->document->get_main_id(), true );
		}
	}

	public function filter_render_mode_module( $module ) {
		return 'cloud-library';
	}

	public function enqueue_scripts() {
		$suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_enqueue_script(
			'cloud-library-screenshot',
			ELEMENTOR_ASSETS_URL . "/js/cloud-library-screenshot{$suffix}.js",
			[],
			ELEMENTOR_VERSION,
			true
		);

		$config = [
			'selector' => '.elementor-' . $this->document->get_main_id(),
			'home_url' => home_url(),
			'post_id' => $this->document->get_main_id(),
			'template_id' => $this->template_id,
		];

		wp_add_inline_script( 'cloud-library-screenshot', 'var ElementorScreenshotConfig = ' . wp_json_encode( $config ) . ';' );
	}

	private function create_document() {
		if ( ! Plugin::$instance->common ) {
			Plugin::$instance->init_common();
		}

		$document = Plugin::$instance->templates_manager->get_source( 'cloud' )->create_document_for_preview( $this->template_id );

		if ( is_wp_error( $document ) ) {
			wp_die();
		}

		return $document;
	}

	/**
	 * Get the document instance.
	 *
	 * @return \Elementor\Core\Base\Document
	 */
	public function get_document() {
		return $this->document;
	}
}
