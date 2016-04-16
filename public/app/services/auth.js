/**
 * Created by Sreenadh TC on 16-04-2016.
 */
angular.module('auth', [])

    .factory('Auth', function ($http, $q, AuthToken) {
        var authFactory = {};

        authFactory.login = function (username, password) {
            return $http.post('/api/login', {
                username: username,
                password: password
            }).success(function (data) {
                AuthToken.setToken(data.token);
                return data;
            });
        };

        authFactory.logout = function () {
            AuthToken.setToken();
        };

        authFactory.isUserLoggedIn = function () {
            if (AuthToken.getToken())return true;
            else return false;
        };

        authFactory.getUser = function () {
            if (AuthToken.getToken())
                return $http.get("/api/me");
            else
                return $q.reject({message: "No token for you!"});
        };
        return authFactory;
    })

    .factory('AuthToken', function ($window) {
        var authTokenFactory = {};

        authTokenFactory.getToken = function () {
            return $window.localStorage.getItem('token');
        }
        authTokenFactory.setToken = function (token) {
            if (token)
                $window.localStorage.setItem('token', token);
            else
                $window.localStorage.removeItem('token');

        };
        return authTokenFactory;
    })

    .factory('AuthInterceptor', function ($q, $location, AuthToken) {

        var interceptorFactory = {};

        interceptorFactory.request = function (config) {
            if (AuthToken.getToken()) {
                config.headers['x-access-token'] = AuthToken.getToken();
            }

            return config;
        };

        interceptorFactory.responseError = function (response) {
            if (response.status = 403)
                $http.location.path('/login');

            return $q.reject(response);
        }

        return interceptorFactory;
    });