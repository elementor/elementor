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

	protected bool $has_pro;

	public function __construct( $args ) {
		$this->home_screen_data = $args['home_screen_data'] ?? [];
		$this->wordpress_adapter = $args['wordpress_adapter'] ?? null;
		$this->has_pro = $args['has_pro'] ?? false;
	}

	abstract public function transform(): array;
}
