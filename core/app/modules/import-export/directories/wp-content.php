<?php

namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Core\App\Modules\ImportExport\Iterator;
use Elementor\Modules\LandingPages\Module as Landing_Pages_Module;
use Elementor\TemplateLibrary\Source_Local;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Content extends Base {

	public $custom_post_types;

	public function __construct( Iterator $iterator, Base $parent, $custom_post_types ) {
		$this->custom_post_types = $custom_post_types;

		parent::__construct( $iterator, $parent );
	}

	protected function get_name() {
		return 'wp-content';
	}

	protected function get_default_sub_directories() {

		$native_post_types = [ 'page', 'post', 'nav_menu_item' ];
		$post_types_to_export = array_merge( $native_post_types, $this->custom_post_types );

		$post_types = get_post_types( [
			'public' => true,
			'can_export' => true,
		] );

		foreach ( $post_types as $post_type ) {
			if ( ! in_array( $post_type, $post_types_to_export ) ) {
				unset( $post_types[ $post_type ] );
			}
		}

		$sub_directories = [];

		foreach ( $post_types as $post_type ) {
			$sub_directories[] = new WP_Post_Type( $this->iterator, $this, $post_type );
		}

		return $sub_directories;
	}
}
