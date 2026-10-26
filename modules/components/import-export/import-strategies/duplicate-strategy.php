<?php

namespace Elementor\Modules\Components\ImportExport\ImportStrategies;

use Elementor\Modules\Components\Components_Repository;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Duplicate_Strategy implements Import_Strategy_Interface {
	const NAME = 'duplicate';
	const TITLE_DUPLICATE_SUFFIX = '_DUP';

	private Components_Repository $repository;

	public function __construct( Components_Repository $repository ) {
		$this->repository = $repository;
	}

	public function resolve( array $record ): Import_Strategy_Result {
		$uid = $record['uid'] ?? '';

		if ( ! $uid || $this->repository->find_by_uid( $uid ) ) {
			$uid = wp_generate_uuid4();
		}

		return new Import_Strategy_Result(
			$uid,
			$this->resolve_title( $record['title'], (int) $record['id'] ),
			self::NAME
		);
	}

	private function resolve_title( string $title, int $self_id ): string {
		while ( $this->repository->title_exists( $title, $self_id ) ) {
			$title .= self::TITLE_DUPLICATE_SUFFIX;
		}

		return $title;
	}
}
