'use strict';

module.exports.repoToOwnerAndOwner = (repository = '') => {
	const [owner, repo] = repository.split('/');
	return { owner, repo };
};
