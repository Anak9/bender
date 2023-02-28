// to avoid using try/catch blocks in all our route handlers we wrap them with this function
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// *important: we dont want to execute a fn, we want to return a fn
