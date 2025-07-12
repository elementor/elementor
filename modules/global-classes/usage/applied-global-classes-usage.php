<?php

namespace Elementor\Modules\GlobalClasses\Usage;

use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Applied_Global_Classes_Usage {

	/** @var array<string, Css_Class_Usage> */
	private array $class_usages = array();

	public function get(): array {
		$this->build_class_usages();

		$result = array();
		foreach ( $this->class_usages as $class_id => $usage ) {
			$result[ $class_id ] = $usage->get_total_usage();
		}

		return $result;
	}

	public function get_detailed_usage(): array {
		$this->build_class_usages();

		$result = array();
		foreach ( $this->class_usages as $class_id => $usage ) {
			$result[ $class_id ] = array();
			foreach ( $usage->get_pages() as $page_id => $page_data ) {
				$result[ $class_id ][] = array(
					'pageId'   => $page_id,
					'title'    => $page_data['title'],
					'total'    => $page_data['total'],
					'elements' => $page_data['elements'],
				);
			}
		}

		return $result;
	}

	private function build_class_usages(): void {
		$this->class_usages = array();
		$class_ids = Global_Classes_Repository::make()->all()->get_items()->keys()->all();

		Plugin::$instance->db->iterate_elementor_documents(
			function ( $document ) use ( $class_ids ) {
				$usage = new Document_Usage( $document );
				$usage->analyze();

				foreach ( $usage->get_usages() as $class_id => $class_usage ) {
					if ( ! in_array( $class_id, $class_ids, true ) ) {
						continue;
					}

					if ( ! isset( $this->class_usages[ $class_id ] ) ) {
						$this->class_usages[ $class_id ] = $class_usage;
					} else {
						$this->class_usages[ $class_id ]->merge( $class_usage );
					}
				}
			}
		);
	}
}
