<?php

namespace Elementor\Modules\Variables;

use Elementor\Core\Files\CSS\Post;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Modules\Variables\Classes\Variables;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Cache {
	const DB_KEY = 'elementor-atomic-global-variables';

	private Wordpress_Adapter_Interface $wp_adapter;

	public function __construct( Wordpress_Adapter_Interface $wp_adapter ) {
		$this->wp_adapter = $wp_adapter;
	}

	public function clear_if_expired() {
		if ( $this->cache_expired() ) {
			$this->clear_kit_css_cache();
			$this->update_signature();
		}

		return $this;
	}

	private function global_variables() {
		return ( new Variables( $this->wp_adapter ) )->get_all();
	}

	private function active_kit_id() {
		return Plugin::$instance->kits_manager->get_active_id();
	}

	private function signature() {
		return sha1( serialize( [
			'kit' => $this->active_kit_id(),
			'variables' => $this->global_variables(),
		] ) );
	}

	private function cache_expired() {
		return $this->signature() !== $this->wp_adapter->get_option( self::DB_KEY );
	}

	private function clear_kit_css_cache() {
		Post::create( $this->active_kit_id() )->delete();

		return $this;
	}

	private function update_signature() {
		if ( ! $this->wp_adapter->get_option( self::DB_KEY ) ) {
			$this->wp_adapter->add_option( self::DB_KEY, $this->signature() );
			return $this;
		}

		$this->wp_adapter->update_option( self::DB_KEY, $this->signature() );

		return $this;
	}
}
