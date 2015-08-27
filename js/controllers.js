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

var mainControllers = angular.module('mainControllers', [
    // 'myServices',
    'myFilters',
    'myDirectivesShapePusher',
    // 'myDirectivesArrays',
    // 'myDirectivesInput',
    // 'CtrlBall',
]);


// MAIN Controller
mainControllers.controller('MainController',[
    // '$scope', '$filter', '$http', 'Ball',
    '$scope', '$http',
    function($scope, $http) {

        //////////////////////////////////////////////////
        // global configuration / default values

        //////////////////////////////////////////////////
        // internal data structure

        $scope.viewStyle = {
            list : {
                'blueocean' : {
                    name : 'blueocean',
                    class : 'blueocean',
                    description : 'deep relaxing blue',
                },
                'sunlight' : {
                    name : 'sunlight',
                    class : 'sunlight',
                    description : 'high contrast - readable by sunlight',
                },
                'test': {
                    name: 'test',
                    class: 'test',
                    description: 'not implementd yet',
                },
            },
            current : {}
        };
        // $scope.viewStyle.current = $scope.viewStyle.list[0];

        // $scope.user = User.user_data();
        $scope.data = {
            settings: {
                viewStyle: 'blueocean',
                // viewStyle: 'sunlight',
            },
            shapepusher_items: [
                {
                    id: 'a1',
                    position: {
                        x: 1000,
                        y: 1000,
                    },
                },
                {
                    id: 'a2',
                    position: {
                        x: 1000,
                        y: 2000,
                    },
                },
                {
                    id: 'a3',
                    position: {
                        x: 2000,
                        y: 2500,
                    },
                },
                {
                    id: 'a4',
                    position: {
                        x: 3000,
                        y: 2000,
                    },
                },
                {
                    id: 'a5',
                    position: {
                        x: 6000,
                        y: 3000,
                    },
                },
            ],
            shapepusher_settings: {
                world: {
                    // in mm
                    width: 10000,
                    height: 5000,
                },
                item: {
                    width: 500,
                    height: 500,
                },
                grid: {
                    visible: true,
                    numbers: true,
                    stepSize: 1000,
                },
                gridSnap: {
                    visible: true,
                    stepSize: 250,
                },
                select: {
                    forceItemEnclosure: false,
                },
                move: {
                    snap: false,
                    selected: false,
                },
            },
        };

        $scope.itemActive = {};

        //////////////////////////////////////////
        // functions
        $scope.loadData = function() {
            console.log("loadData - TODO");
        };


        //////////////////////////////////////////
    }
]);
