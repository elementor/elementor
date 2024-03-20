<?php
namespace Elementor\Modules\Home\Transformations\Base;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

abstract class Transformations_Abstract {
	/**
	 * @var array
	 */
	protected array $home_screen_data;

	protected $wordpress_adapter;

	public function __construct( $args ) {
		$this->home_screen_data = $args['home_screen_data'] ?? [];
		$this->wordpress_adapter = $args['wordpress_adapter'] ?? null;
	}

	abstract public function transform(): array;
}
