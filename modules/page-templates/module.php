<?php
namespace Elementor\Modules\PageTemplates;

use Elementor\Controls_Manager;
use Elementor\Core\Base\Document;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\DocumentTypes\Post as PostDocument;
use Elementor\Modules\Library\Documents\Page as PageDocument;
use Elementor\Plugin;
use Elementor\Utils;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	/**
	 * Elementor Canvas template name.
	 */
	const TEMPLATE_CANVAS = 'elementor_canvas';

	/**
	 * Elementor Header & Footer template name.
	 */
	const TEMPLATE_HEADER_FOOTER = 'elementor_header_footer';

	/**
	 * @var callable
	 */
	protected $print_callback;

	public function get_name() {
		return 'page-templates';
	}

	/**
	 * Template include.
	 *
	 * Update the path for the Elementor Canvas template.
	 *
	 * Fired by `template_include` filter.
	 *
	 * @since 1.6.0
	 * @access public
	 *
	 * @param string $template The path of the template to include.
	 *
	 * @return string The path of the template to include.
	 */
	public function template_include( $template ) {
		if ( is_singular() ) {
			$document = Plugin::$instance->documents->get_doc_for_frontend( get_the_ID() );

			if ( $document ) {
				$template_path = $this->get_template_path( $document->get_meta( '_wp_page_template' ) );
				if ( $template_path ) {
					$template = $template_path;
				}
			}
		}

		return $template;
	}

	public function add_wp_templates_support() {
		$post_types = get_post_types_by_support( 'elementor' );

		foreach ( $post_types as $post_type ) {
			add_filter( "theme_{$post_type}_templates", [ $this, 'add_page_templates' ], 10, 4 );
		}
	}

	/**
	 * Add page templates.
	 *
	 * Add the Elementor Canvas page templates to the theme templates.
	 *
	 * Fired by `theme_{$post_type}_templates` filter.
	 *
	 * @since 1.6.0
	 * @access public
	 * @static
	 *
	 * @param array $page_templates Array of page templates. Keys are filenames,
	 *                              values are translated names.
	 *
	 * @return array Page templates.
	 */
	public function add_page_templates( $page_templates ) {
		$page_templates = [
			self::TEMPLATE_CANVAS => __( 'Elementor', 'elementor' ) . ' ' . __( 'Canvas', 'elementor' ),
			self::TEMPLATE_HEADER_FOOTER => __( 'Elementor', 'elementor' ) . ' ' . __( 'Full Width', 'elementor' ),
		] + $page_templates;

		return $page_templates;
	}

	public function set_print_callback( $callback ) {
		$this->print_callback = $callback;
	}

	public function print_callback() {
		while ( have_posts() ) :
			the_post();
			the_content();
		endwhile;
	}

	public function print_content() {
		if ( ! $this->print_callback ) {
			$this->print_callback = [ $this, 'print_callback' ];
		}

		call_user_func( $this->print_callback );
	}

	public function get_template_path( $page_template ) {
		$template_path = '';
		switch ( $page_template ) {
			case self::TEMPLATE_CANVAS:
				$template_path = __DIR__ . '/templates/canvas.php';
				break;
			case self::TEMPLATE_HEADER_FOOTER:
				$template_path = __DIR__ . '/templates/header-footer.php';
				break;
		}

		return $template_path;
	}

	/**
	 * @param Document $document
	 */
	public function action_register_template_control( $document ) {
		if ( $document instanceof PostDocument || $document instanceof PageDocument ) {
			$this->register_template_control( $document );
		}
	}

	/**
	 * @param Document $document
	 * @param string $control_id
	 */
	public function register_template_control( $document, $control_id = 'template' ) {
		if ( ! Utils::is_cpt_custom_templates_supported() ) {
			return;
		}

		require_once ABSPATH . '/wp-admin/includes/template.php';

		$options = [
			'default' => __( 'Default', 'elementor' ),
		];

		$options += array_flip( get_page_templates( null, $document->get_main_post()->post_type ) );

		$document->start_injection( [
			'of' => 'post_status',
		] );

		$document->add_control(
			$control_id,
			[
				'label' => __( 'Page Layout', 'elementor' ),
				'type' => Controls_Manager::SELECT,
				'default' => 'default',
				'options' => $options,
			]
		);

		$document->add_control(
			$control_id . '_default_description',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'Default Page Template from your theme', 'elementor' ),
				'separator' => 'none',
				'content_classes' => 'elementor-descriptor',
				'condition' => [
					$control_id => 'default',
				],
			]
		);

		$document->add_control(
			$control_id . '_canvas_description',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'No header, no footer, just Elementor', 'elementor' ),
				'separator' => 'none',
				'content_classes' => 'elementor-descriptor',
				'condition' => [
					$control_id => self::TEMPLATE_CANVAS,
				],
			]
		);

		$document->add_control(
			$control_id . '_header_footer_description',
			[
				'type' => Controls_Manager::RAW_HTML,
				'raw' => __( 'This template includes the header, full-width content and footer', 'elementor' ),
				'separator' => 'none',
				'content_classes' => 'elementor-descriptor',
				'condition' => [
					$control_id => self::TEMPLATE_HEADER_FOOTER,
				],
			]
		);

		$document->end_injection();
	}

	public function filter_update_meta( $value, $object_id, $meta_key ) {
		// Don't allow WP to update the parent page template.
		// (during `wp_update_post` from page-settings or save_plain_text).
		$is_elementor_action = isset( $_POST['action'] ) && 'elementor_ajax' === $_POST['action'];

		if ( $is_elementor_action && '_wp_page_template' === $meta_key && ! wp_is_post_autosave( $object_id ) ) {
			$value = false;
		}

		return $value;
	}

	public function __construct() {
		add_action( 'init', [ $this, 'add_wp_templates_support' ] );

		add_filter( 'template_include', [ $this, 'template_include' ] );

		add_action( 'elementor/documents/register_controls', [ $this, 'action_register_template_control' ] );

		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			add_filter( 'update_post_metadata', [ $this, 'filter_update_meta' ], 10, 3 );
		}
	}
}
