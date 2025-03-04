<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Common\Modules\Connect\Apps\Library;
use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Modules\CloudLibrary\Connect\Cloud_Library;
use Elementor\Modules\CloudLibrary\Documents\Cloud_Template_Preview;
use Elementor\Plugin;
use Elementor\Utils;
use ElementorPro\Modules\Screenshots\Module;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Preview extends Render_Mode_Base {
	const ENQUEUE_SCRIPTS_PRIORITY = 1000;

	const MODE = 'cloud-template-preview';


	public function __construct( $template_id ) {
		$this->document = $this->create_document($template_id);
		parent::__construct( $this->document->get_main_id() );
	}

	public static function get_name() {
		return Render_Mode_Preview::MODE;
	}

	public function prepare_render() {
		parent::prepare_render();
		show_admin_bar( false );

		add_filter( 'template_include', [ $this, 'filter_template' ] );
	}

	public function filter_template() {
		return ELEMENTOR_PATH . 'modules/cloud-library/templates/canvas.php';
	}

	public function is_static() {
		return true;
	}

	public function enqueue_scripts() {
//		$suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() && ELEMENTOR_PRO_TESTS ) ? '' : '.min';
//
//		wp_enqueue_script(
//			'dom-to-image',
//			ELEMENTOR_PRO_ASSETS_URL . "/lib/dom-to-image/js/dom-to-image{$suffix}.js",
//			[],
//			'2.6.0',
//			true
//		);
//
//		wp_enqueue_script(
//			'html2canvas',
//			ELEMENTOR_PRO_ASSETS_URL . "/lib/html2canvas/js/html2canvas{$suffix}.js",
//			[],
//			'1.0.0-rc.5',
//			true
//		);
//
//		wp_enqueue_script(
//			'elementor-screenshot',
//			ELEMENTOR_PRO_ASSETS_URL . "/js/screenshot{$suffix}.js",
//			[ 'dom-to-image', 'html2canvas' ],
//			ELEMENTOR_PRO_VERSION,
//			true
//		);
//
//		$config = [
//			'selector' => '.elementor-' . $this->document->get_main_id(),
//			'nonce' => wp_create_nonce( Module::SCREENSHOT_PROXY_NONCE_ACTION ),
//			'home_url' => home_url(),
//			'post_id' => $this->document->get_main_id(),
//		];
//
//		wp_add_inline_script( 'elementor-screenshot', 'var ElementorScreenshotConfig = ' . wp_json_encode( $config ) . ';' );
	}

	protected function replace_elements_ids( $content ) {
		return Plugin::$instance->db->iterate_data( $content, function( $element ) {
			$element['id'] = Utils::generate_random_string();

			return $element;
		} );
	}

	public function save_item( $template_content ) {
		$template_data = [
			'title' => esc_html__( '(no title)', 'elementor' ),
			'page_settings' => $template_content['page_settings'] ?? [],
			'status' => 'publish',
		];

		$template_data['type'] = 'container';
		$template_data['editor_post_id'] = 7;
		$template_data['source'] = 'cloud';
		$template_data['post_id'] = 7;

		$document = Plugin::$instance->documents->create(
			'container',
			[
				'post_title' => $template_data['title'],
				'post_status' => $template_data['status'],
			]
		);

		if ( is_wp_error( $document ) ) {
			wp_die();
		}

		$template_data['content'] = $this->replace_elements_ids( $template_content['content'] );

		$document->save( [
			'elements' => $template_data['content'],
			'settings' => $template_data['page_settings'],
		] );

		do_action( 'elementor/template-library/after_save_template', $this->post_id, $template_data );
		do_action( 'elementor/template-library/after_update_template', $this->post_id, $template_data );


		return $document;
	}


	private function create_document() {
//			Plugin::$instance->init_common();
//			/** @var Cloud_Library $cloud_library_app */
//			$cloud_library_app = Plugin::$instance->common->get_component( 'connect' )->get_app( 'cloud-library' );
//
//			if ( ! $cloud_library_app ) {
//				return;
//			}
//
//
//			$template = $cloud_library_app->get_resource( [ 'id' => $this->template_id ] );

//			if ( is_wp_error( $template ) || empty( $template['content'] ) ) {
//				return;
//			}

		$content = "{\"content\":[{\"id\":\"712e52d\",\"elType\":\"container\",\"isInner\":false,\"isLocked\":false,\"settings\":[],\"defaultEditSettings\":{\"defaultEditRoute\":\"content\"},\"elements\":[{\"id\":\"e2d4a46\",\"elType\":\"widget\",\"isInner\":false,\"isLocked\":false,\"settings\":{\"title\":\"Hadar\"},\"defaultEditSettings\":{\"defaultEditRoute\":\"content\"},\"elements\":[],\"title\":\"Heading\",\"categories\":[\"basic\"],\"keywords\":[\"heading\",\"title\",\"text\"],\"icon\":\"eicon-t-letter\",\"widgetType\":\"heading\",\"hideOnSearch\":false,\"editSettings\":{\"defaultEditRoute\":\"content\",\"panel\":{\"activeTab\":\"content\",\"activeSection\":\"section_title\"}}}],\"editSettings\":{\"defaultEditRoute\":\"layout\",\"panel\":{\"activeTab\":\"layout\",\"activeSection\":\"section_layout_container\"}}}],\"page_settings\":{\"hide_title\":\"yes\",\"template\":\"elementor_canvas\"}}";
		$page_settings = [];

		$dev = json_decode($content, true);

		$document = $this->save_item( [
			'content' => $dev['content'],
			'page_settings' =>$dev['page_settings'],
		] );

		Plugin::$instance->documents->switch_to_document( $document );

		return $document;
	}
}
