/******************************************************************************

    Angularjs playground / test enviroment

    written by stefan krueger (s-light),
        mail@s-light.eu, http://s-light.eu, https://github.com/s-light/

    changelog / history
        see git commits

    TO DO:
        ~ enjoy your life :-)

******************************************************************************/

/******************************************************************************

    Copyright 2015 Stefan Krueger

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

******************************************************************************/


/*****************************************************************************/
/**   helper                                                                **/


/*****************************************************************************/
/**   AngularJS mainApp                                                     **/

var mainApp = angular.module('mainApp', [
    // 'ngRoute',
    'mainControllers',
]);

// mainApp.config(['$routeProvider',
//       function($routeProvider) {
//             $routeProvider.
//                 when('/menu', {
//                     templateUrl: 'views/menu.html',
//                     controller: 'MenuCtrl'
//                 }).
//                 when('/test', {
//                     templateUrl: 'views/test.html',
//                     controller: 'TestCtrl'
//                 }).
//                 otherwise({
//                     redirectTo: '/menu'
//                 });
//       }
// ]);

/* END */
