const http = require('./http');

/**
 * Git API.
 */
module.exports = {
  /**
   * Performs GET request.
   * @param {*} parameters 
   */
  getUserEvents(parameters) {
    return http.get({
      hostname: 'api.github.com',
      protocol: 'https:',
      path: '/users/' + encodeURIComponent(parameters.username) + '/events',
      port: 443,
      method: 'GET',
    });
  },
};
