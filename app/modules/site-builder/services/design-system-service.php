<?php
namespace Elementor\App\Modules\SiteBuilder\Services;

use Elementor\Core\Kits\Documents\Kit;
use Elementor\Modules\GlobalClasses\Global_Classes_Repository;
use Elementor\Modules\Variables\Storage\Constants as Variables_Constants;
use Elementor\Modules\Variables\Storage\Variables_Collection;
use Elementor\Modules\Variables\Storage\Variables_Repository;
use Elementor\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Design_System_Service {

	private ?Kit $kit;

	public function __construct( ?Kit $kit = null ) {
		$this->kit = $kit;
	}

	public function deploy_global_classes( array $global_classes ): array {
		$items = isset( $global_classes['items'] ) && is_array( $global_classes['items'] )
			? $global_classes['items']
			: [];
		$order = isset( $global_classes['order'] ) && is_array( $global_classes['order'] )
			? array_values( $global_classes['order'] )
			: [];

		Global_Classes_Repository::make( $this->kit )
			->context( Global_Classes_Repository::CONTEXT_FRONTEND )
			->put( $items, $order );

		return [
			'items' => count( $items ),
			'order' => count( $order ),
		];
	}

	public function deploy_global_variables( array $global_variables ): array {
		$kit = $this->get_kit();

		if ( ! $kit ) {
			throw new \Exception( 'No active kit found' );
		}

		$record = [
			'data' => isset( $global_variables['data'] ) && is_array( $global_variables['data'] )
				? $global_variables['data']
				: [],
			'watermark' => (int) ( $global_variables['watermark'] ?? 0 ),
			'version' => (int) ( $global_variables['version'] ?? Variables_Constants::FORMAT_VERSION_V1 ),
		];

		$collection = Variables_Collection::hydrate( $record );

		$watermark = $this->repository_for( $kit )->save( $collection );

		if ( false === $watermark ) {
			throw new \Exception( 'Failed to update global variables' );
		}

		return [
			'data' => count( $record['data'] ),
			'watermark' => $watermark,
			'version' => $record['version'],
		];
	}

	private function get_kit(): ?Kit {
		return $this->kit ?? Plugin::$instance->kits_manager->get_active_kit();
	}

	private function repository_for( Kit $kit ): Variables_Repository {
		return new Variables_Repository( $kit );
	}
}
