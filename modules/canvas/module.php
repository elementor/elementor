<?php
namespace Elementor\Modules\Canvas;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	const TEMPLATE_CANVAS = 'elementor_canvas';

	public function get_name() {
		return 'canvas';
	}

	public function template_include( $template ) {
		if ( is_singular() ) {
			$document = Plugin::$instance->documents->get_doc_or_auto_save( get_the_ID() );
			$page_template = get_post_meta( $document->get_post()->ID, '_wp_page_template', true );

			if ( self::TEMPLATE_CANVAS === $page_template ) {
				$template = __DIR__ . '/page-templates/canvas.php';
			}
		}

		return $template;
	}

	private function add_wp_templates_support() {
		$post_types = get_post_types_by_support( 'elementor' );

		foreach ( $post_types as $post_type ) {
			add_filter( "theme_{$post_type}_templates", [ $this, 'add_page_templates' ], 10, 4 );
		}
	}

	public function add_page_templates( $post_templates ) {
		$post_templates = [
			self::TEMPLATE_CANVAS => __( 'Elementor', 'elementor' ) . ' ' . __( 'Canvas', 'elementor' ),
		] + $post_templates;

		return $post_templates;
	}

	public function __construct() {
		parent::__construct();

		$this->add_wp_templates_support();

		add_filter( 'template_include', [ $this, 'template_include' ] );
	}
}
