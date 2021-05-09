'use strict';

module.exports.repoToOwnerAndRepo = (repository = '') => {
	const [owner, repo] = repository.split('/');
	return { owner, repo };
};
