<?php
namespace Elementor\Modules\CrossOriginDestination;

use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Core\Utils\Collection;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Module extends \Elementor\Core\Base\Module {

	public function get_name() {
		return 'cross-origin-destination';
	}

	public function __construct() {
		parent::__construct();

		$this->add_filters();
	}

	protected function add_filters() {
		add_filter( 'elementor/element/link-attributes', function ( $attributes ) {
			$rel = empty( $attributes['rel'] ) ? '' : $attributes['rel'];

			$rel_attributes = new Collection( preg_split(
				'/\s+/',
				$rel,
				-1,
				PREG_SPLIT_NO_EMPTY
			) );

			$rel_attributes->push( 'noopener' );

			$attributes['rel'] = $rel_attributes->unique()->implode( ' ' );

			return $attributes;
		} );
	}

	public static function get_experimental_data() {
		return [
			'name' => 'cross-origin-destinations',
			'title' => esc_html__( 'Cross-Origin Destination', 'elementor' ),
			'description' => esc_html__( 'This feature adds rel="noopener" to all external links. It prevents a new page from being able to access the window.opener property and ensures it runs in a separate process.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'new_site' => [
				'default_active' => true,
			],
		];
	}
}
