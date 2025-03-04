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

		$document = Plugin::$instance->documents->create(
			Cloud_Template_Preview::TYPE,
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

		$content = '[{"id":"d6ce215","elType":"container","settings":[],"elements":[{"id":"856a861","elType":"widget","settings":{"carousel_name":"Image Carousel","carousel":[{"id":372,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/12\\/image1.jpg"},{"id":373,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/12\\/image2.jpg"},{"id":143,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/11\\/Aceofspades.svg"},{"id":17,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/11\\/cart2.jpg"}],"link_to":"file"},"elements":[],"widgetType":"image-carousel"}],"isInner":false},{"id":"4bb7ec2","elType":"container","settings":[],"elements":[{"id":"041befb","elType":"widget","settings":{"wp_gallery":[{"id":464,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/12\\/image2.jpg"},{"id":463,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/12\\/image1.jpg"},{"id":143,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/11\\/Aceofspades.svg"}]},"elements":[],"widgetType":"image-gallery"},{"id":"965d259","elType":"widget","settings":{"gallery":[{"id":464,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/12\\/image2.jpg"},{"id":463,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/12\\/image1.jpg"},{"id":143,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/11\\/Aceofspades.svg"},{"id":17,"url":"http:\\/\\/dev.local\\/wp-content\\/uploads\\/2024\\/11\\/cart2.jpg"}],"galleries":[{"gallery_title":"New Gallery","_id":"29a48b4"}],"show_all_galleries_label":"All"},"elements":[],"widgetType":"gallery"},{"id":"e63b488","elType":"widget","settings":{"slides_name":"Slides","slides":[{"heading":"Slide 1 Heading","description":"Lorem ipsum dolor sit amet consectetur adipiscing elit dolor","button_text":"Click Here","background_color":"#833ca3","_id":"4e15fd3"},{"heading":"Slide 2 Heading","description":"Lorem ipsum dolor sit amet consectetur adipiscing elit dolor","button_text":"Click Here","background_color":"#4054b2","_id":"3c846d2"},{"heading":"Slide 3 Heading","description":"Lorem ipsum dolor sit amet consectetur adipiscing elit dolor","button_text":"Click Here","background_color":"#1abc9c","_id":"576108a"}]},"elements":[],"widgetType":"slides"}],"isInner":false},{"id":"undefined-c39d0f9","elType":"container","settings":{"flex_direction":"column","padding":{"unit":"px","top":"100","right":"24","bottom":"100","left":"24","isLinked":false},"padding_tablet":{"unit":"px","top":"80","right":"16","bottom":"80","left":"16","isLinked":false},"padding_mobile":{"unit":"px","top":"48","right":"16","bottom":"48","left":"16","isLinked":false},"boxed_width":{"unit":"px","size":1280,"sizes":[]},"min_height_tablet":{"unit":"px","size":0,"sizes":[]},"flex_align_items":"center","flex_align_items_tablet":"flex-start","flex_gap":{"size":48,"unit":"px","column":"48","row":"048"},"flex_gap_tablet":{"unit":"px","size":0,"sizes":[],"row":"0","column":"0"},"flex_gap_mobile":{"unit":"px","size":24,"sizes":[],"row":"24","column":"24"},"background_background":"classic","background_color":"#2C2C2C","__globals__":{"background_color":""},"pa_condition_repeater":[],"premium_tooltip_text":"Hi, I\'m a global tooltip.","premium_tooltip_position":"top,bottom","premium_parallax_layers_list":[],"premium_gradient_colors_repeater":[],"premium_kenburns_repeater":[],"premium_lottie_repeater":[],"premium_blob_repeater":[],"pa_cursor_ftext":"Premium Follow Text","pa_badge_text":"New","_title":"Call to Action Section","ai":{"generator":"textBasedLayoutGen","baseTemplateId":"610","blockId":"29335","requestIds":{"editorSessionId":"editor-session-fe16b15","sessionId":"session-2f75e21","generateId":"generate-d4aac50","batchId":"batch-7e5a9a9","requestId":"request-55225d9"}}},"elements":[{"id":"undefined-36aa18e","elType":"container","settings":{"background_overlay_hover_transition":{"unit":"px","size":0.29999999999999999,"sizes":[]},"border_border":"solid","border_width":{"unit":"px","top":"1","right":"1","bottom":"1","left":"1","isLinked":true},"border_color":"#FFFFFF","padding":{"unit":"px","top":"85","right":"150","bottom":"85","left":"150","isLinked":false},"padding_tablet":{"unit":"px","top":"50","right":"50","bottom":"50","left":"50","isLinked":true},"padding_mobile":{"unit":"px","top":"30","right":"30","bottom":"30","left":"30","isLinked":true},"background_background":"classic","__globals__":{"border_color":""},"pa_condition_repeater":[],"premium_tooltip_text":"Hi, I\'m a global tooltip.","premium_tooltip_position":"top,bottom","premium_parallax_layers_list":[],"premium_gradient_colors_repeater":[],"premium_kenburns_repeater":[],"premium_lottie_repeater":[],"premium_blob_repeater":[],"pa_cursor_ftext":"Premium Follow Text","pa_badge_text":"New","ai":{"generator":"textBasedLayoutGen","baseTemplateId":"610","blockId":"29335","requestIds":{"editorSessionId":"editor-session-fe16b15","sessionId":"session-2f75e21","generateId":"generate-d4aac50","batchId":"batch-7e5a9a9","requestId":"request-55225d9"}}},"elements":[{"id":"undefined-216925a","elType":"widget","settings":{"title":"Your Next Step Starts Here","align":"center","title_color":"#FFFFFF","align_mobile":"center","align_tablet":"center","__globals__":{"typography_typography":"","title_color":""},"typography_typography":"custom","typography_font_family":"Poppins","typography_font_size":{"unit":"px","size":48,"sizes":[]},"typography_font_size_tablet":{"unit":"px","size":40,"sizes":[]},"typography_font_size_mobile":{"unit":"px","size":32,"sizes":[]},"typography_font_style":"normal","typography_text_decoration":"none","typography_line_height":{"unit":"custom","size":"120%","sizes":[]},"typography_line_height_tablet":{"unit":"custom","size":"","sizes":[]},"typography_line_height_mobile":{"unit":"custom","size":"120%","sizes":[]},"typography_word_spacing":{"unit":"em","size":"","sizes":[]},"pa_condition_repeater":[],"premium_tooltip_text":"Hi, I\'m a global tooltip.","premium_tooltip_position":"top,bottom","pa_cursor_ftext":"Premium Follow Text","pa_badge_text":"New","premium_mscroll_repeater":[],"ai":{"generator":"textBasedLayoutGen","baseTemplateId":"610","blockId":"29335","requestIds":{"editorSessionId":"editor-session-fe16b15","sessionId":"session-2f75e21","generateId":"generate-d4aac50","batchId":"batch-7e5a9a9","requestId":"request-55225d9"}}},"elements":[],"widgetType":"heading"},{"id":"undefined-2c52cc7","elType":"widget","settings":{"editor":"<p>Explore exciting opportunities with us. We provide the resources you need to succeed. Take a moment to connect, and let\u2019s make things happen together. Don\u2019t miss out on making your dreams a reality.<\\/p>","align":"center","text_color":"#FFFFFF","typography_typography":"custom","typography_font_size":{"unit":"px","size":16},"typography_line_height":{"unit":"custom","size":"1.5"},"_margin":{"unit":"px","top":"0","right":"0","bottom":"-10","left":"0","isLinked":false},"align_mobile":"center","typography_font_family":"Poppins","typography_font_size_mobile":{"unit":"px","size":16,"sizes":[]},"typography_line_height_tablet":{"unit":"custom","size":"1.5","sizes":[]},"typography_line_height_mobile":{"unit":"custom","size":"","sizes":[]},"__globals__":{"text_color":""},"pa_condition_repeater":[],"premium_tooltip_text":"Hi, I\'m a global tooltip.","premium_tooltip_position":"top,bottom","pa_cursor_ftext":"Premium Follow Text","pa_badge_text":"New","premium_mscroll_repeater":[],"ai":{"generator":"textBasedLayoutGen","baseTemplateId":"610","blockId":"29335","requestIds":{"editorSessionId":"editor-session-fe16b15","sessionId":"session-2f75e21","generateId":"generate-d4aac50","batchId":"batch-7e5a9a9","requestId":"request-55225d9"}}},"elements":[],"widgetType":"text-editor"},{"id":"undefined-0c42d60","elType":"widget","settings":{"text":"Get Started","_element_width":"auto","button_text_color":"#FFFFFF","border_border":"solid","border_width":{"unit":"px","top":"1","right":"1","bottom":"1","left":"1","isLinked":"1"},"border_color":"#467FF7","border_radius":{"unit":"px","top":"","right":"","bottom":"","left":"","isLinked":"1"},"text_padding":{"unit":"px","top":"12","right":"24","bottom":"12","left":"24","isLinked":""},"text_padding_mobile":{"unit":"px","top":"12","right":"24","bottom":"12","left":"24","isLinked":""},"_margin_mobile":{"unit":"px","top":"0","right":"0","bottom":"0","left":"0","isLinked":""},"typography_typography":"custom","typography_font_family":"Poppins","typography_font_size":{"unit":"px","size":16,"sizes":[]},"typography_text_transform":"capitalize","typography_font_style":"normal","typography_text_decoration":"none","typography_line_height":{"unit":"custom","size":"150%","sizes":[]},"background_color":"#467FF7","typography_font_size_mobile":{"unit":"px","size":15,"sizes":[]},"_margin_tablet":{"unit":"px","top":"0","right":"0","bottom":"0","left":"0","isLinked":false},"align":"right","_element_custom_width":{"unit":"%","size":15,"sizes":[]},"icon_indent":{"unit":"px","size":0,"sizes":[]},"typography_font_size_tablet":{"unit":"px","size":14,"sizes":[]},"typography_line_height_tablet":{"unit":"px","size":"","sizes":[]},"typography_line_height_mobile":{"unit":"px","size":"","sizes":[]},"button_background_hover_background":"","_flex_align_self":"center","__globals__":{"hover_color":"","button_background_hover_color":"","button_hover_border_color":""},"pa_condition_repeater":[],"premium_tooltip_text":"Hi, I\'m a global tooltip.","premium_tooltip_position":"top,bottom","pa_cursor_ftext":"Premium Follow Text","pa_badge_text":"New","premium_mscroll_repeater":[],"ai":{"generator":"textBasedLayoutGen","baseTemplateId":"610","blockId":"29335","requestIds":{"editorSessionId":"editor-session-fe16b15","sessionId":"session-2f75e21","generateId":"generate-d4aac50","batchId":"batch-7e5a9a9","requestId":"request-55225d9"}}},"elements":[],"widgetType":"button"}],"isInner":true}],"isInner":false}]';
		$page_settings = [];

		$document = $this->save_item( [
			'content' => json_decode($content, true),
			'page_settings' => $page_settings,
		] );

//		Plugin::$instance->documents->switch_to_document( $document );

		return $document;
	}
}
