<?php
namespace Elementor\Core\App\Modules\ImportExport\Directories;

use Elementor\Core\App\Modules\ImportExport\Iterator;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class WP_Custom_Post_Type_Title extends Base {

	private $post_type;

	public function __construct( Iterator $iterator, Base $parent, $post_type ) {
		parent::__construct( $iterator, $parent );

		$this->post_type = $post_type;
	}

	public function export() {

		$post_type_object = get_post_type_object( $this->post_type );
		return [
			'name' => $post_type_object->name,
			'label' => $post_type_object->label,
		];
	}

	protected function get_name() {
		return $this->post_type;
	}

}
