<?php
namespace Elementor\Modules\Library;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Modules\Library\Documents;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends BaseModule {

	public function get_name() {
		return 'library';
	}

	public function localize_settings( $settings ) {
		$settings = array_replace_recursive( $settings, [
			'i18n' => [
			],
		] );

		return $settings;
	}

	public function __construct() {
		parent::__construct();

		Plugin::$instance->documents
			->register_document_type( 'page', Documents\Page::get_class_full_name() )
			->register_document_type( 'section', Documents\Section::get_class_full_name() );

		add_filter( 'elementor/editor/localize_settings', [ $this, 'localize_settings' ] );
	}
}
