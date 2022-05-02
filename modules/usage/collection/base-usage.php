<?php
namespace Elementor\Modules\Usage\Collection;

use Elementor\Core\Base\Document;
use Elementor\Core\Utils\Collection;

abstract class BaseUsage extends Collection {
	/**
	 * Add, adds the document to collection.
	 *
	 * @param Document $document
	 *
	 * @return $this
	 */
	abstract public function add( Document $document );

	/**
	 * Remove, remove's the document from the collection.
	 *
	 * @param Document $document
	 *
	 * @return $this
	 */
	abstract public function remove( Document $document );
}
