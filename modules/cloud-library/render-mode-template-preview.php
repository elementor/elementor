<?php
namespace Elementor\Modules\CloudLibrary;

use Elementor\Core\Frontend\RenderModes\Render_Mode_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Render_Mode_Template_Preview extends Render_Mode_Preview_Base {
	const MODE = 'cloud-template-preview';

	protected int $template_id;

	public function __construct( $template_id ) {
		$this->template_id = $template_id;
		$this->document = $this->create_document();
		parent::__construct( $this->document->get_main_id() );
	}

	public static function get_name() {
		return self::MODE;
	}

	public function prepare_render() {
		parent::prepare_render();

		add_filter( 'template_include', [ $this, 'filter_template' ] );
	}

	public function filter_template() {
		return ELEMENTOR_PATH . 'modules/page-templates/templates/canvas.php';
	}

	private function create_document() {
		if ( ! Plugin::$instance->common ) {
			Plugin::$instance->init_common();
		}

		$document = Plugin::$instance->templates_manager->get_source( 'cloud' )->create_document_for_preview( $this->template_id );

		if ( is_wp_error( $document ) ) {
			wp_die();
		}

		Plugin::$instance->documents->switch_to_document( $document );

		return $document;
	}

	public function get_config() {
		return [
			'selector' => '.elementor-' . $this->document->get_main_id(),
			'home_url' => home_url(),
			'post_id' => $this->document->get_main_id(),
			'template_id' => $this->template_id,
		];
	}
}
