<?php
namespace Elementor\Modules\Tags;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\MicroElements\Manager as MicroElementsManager;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Module extends BaseModule {

	const DEFAULT_GROUP = 'base';

	public function __construct() {
		parent::__construct();

		$this->register_default_group();

		$this->register_default_tags();
	}

	public function get_name() {
		return 'micro-elements';
	}

	private function register_default_group() {
		MicroElementsManager::register_group( self::DEFAULT_GROUP, [
			'title' => __( 'Base Tags', 'elementor' ),
		] );
	}

	private function register_default_tags() {
		$tags_classes = [
			'Icon'
		];

		foreach ( $tags_classes as $tag_class ) {
			MicroElementsManager::register_tag( __NAMESPACE__ . '\Tags\\' .$tag_class );
		}
	}
}
