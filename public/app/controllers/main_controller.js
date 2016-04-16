/**
 * Created by Sreenadh TC on 16-04-2016.
 */
angular.module('main_ontroller', [])

    .controller('MainController', function ($rootScope, $location, Auth) {

        var vm = this;

        vm.loggedIn = Auth.isLogged();

        $rootScope.$on('$routeChangeStart', function () {

            vm.loggedIn = Auth.isUserLoggedIn();

            Auth.getUser()
                .then(function (data) {
                    vm.user = data.data;
                });
        });

        vm.doLogin = function () {
            vm.processing = true;
            vm.error = '';
            Auth.login(vm.loginData.username, vm.loginData.password)
                .success(function () {
                    vm.processing = false;

                    Auth.getUser()
                        .then(function (data) {
                            vm.user = data.data;
                        });

                    if (data.success)
                        $location.path('/');
                    else
                        vm.error = data.message;
                });
        }

        vm.doLogout = function(){
            Auth.logout();

            $location.path('/logout');
        }
    });