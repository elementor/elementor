module.exports = {
	isObject: ( value ) => value && 'object' === typeof value && value.constructor === Object,
};
