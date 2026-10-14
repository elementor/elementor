<?php

namespace Elementor\Modules\AssetsManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Assets {
	private $assets;
	private $assets_map;

	public function __construct() {
		$this->assets = [];
		$this->assets_map = [];
	}

	public function append( $handle, $uri, $dependencies = [], $version = '', $options = [] ) {
		if ( ! array_key_exists( $handle, $this->assets_map ) ) {
			$this->assets_map[ $handle ] = [
				'uri' => $uri . ( $version ? '?ver=' . $version : '' ),
				'options' => $options,
			];
			$this->assets[ $handle ] = $dependencies;
		}
		return $this;
	}

	public function assets_map() {
		return $this->assets_map;
	}

	public function priority_queue() {
		$graph = [];
		$in_degree = [];

		foreach ( $this->assets as $handle => $dependencies ) {
			if ( ! array_key_exists( $handle, $in_degree ) ) {
				$in_degree[ $handle ] = 0;
			}

			foreach ( $dependencies as $dependency ) {
				if ( ! array_key_exists( $dependency, $graph ) ) {
					$graph[ $dependency ] = [];
				}

				$graph[ $dependency ][] = $handle;

				$in_degree[ $handle ]++;

				if ( ! array_key_exists( $dependency, $in_degree ) ) {
					$in_degree[ $dependency ] = 0;
				}
			}
		}

		$queue = new \SplQueue();

		foreach ( $in_degree as $handle => $count ) {
			if ( 0 === $count ) {
				$queue->enqueue( $handle );
			}
		}

		$priority_queue = [];

		while ( ! $queue->isEmpty() ) {
			$current = $queue->dequeue();

			$priority_queue[] = $current;

			if ( ! array_key_exists( $current, $graph ) ) {
				continue;
			}

			foreach ( $graph[ $current ] as $next ) {
				$in_degree[ $next ]--;

				if ( 0 === $in_degree[ $next ] ) {
					$queue->enqueue( $next );
				}
			}
		}

		return $priority_queue;
	}
}
