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

	public static function get_experimental_data() {
		return [
			'name' => 'cross-origin-destinations',
			'title' => esc_html__( 'Cross-Origin Destination', 'elementor' ),
			'description' => esc_html__( 'This feature adds rel="noopener" to all external links. It prevents a new page from being able to access the window.opener property and ensures it runs in a separate process.', 'elementor' ),
			'release_status' => Experiments_Manager::RELEASE_STATUS_BETA,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.7.0-beta',
			],
		];
	}

	protected function add_filters() {
		add_filter( 'elementor/element/link-attributes', function ( $attributes ) {
			$rel = empty( $attributes['rel'] ) ? '' : $attributes['rel'];

			// Need to split the rel string into an array in order to remove redundant spaces (if present), push new
			// rel attributes, and remove duplicates.
			$rel = preg_split(
				'/\s+/',
				$rel,
				-1, // Default value.
				PREG_SPLIT_NO_EMPTY
			);

			$rel = new Collection( $rel );

			$rel->push( 'noopener' );

			$attributes['rel'] = $rel->unique()->implode( ' ' );

			return $attributes;
		} );
	}
}
