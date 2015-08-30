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
                        x: 5000,
                        y: 3000,
                    },
                },
                {
                    id: 'a10',
                    position: {
                        x: 6000,
                        y: 1000,
                    },
                },
                {
                    id: 'a11',
                    position: {
                        x: 7000,
                        y: 1000,
                    },
                },
                {
                    id: 'a12',
                    position: {
                        x: 8000,
                        y: 1000,
                    },
                },
                {
                    id: 'a13',
                    position: {
                        x: 6500,
                        y: 1500,
                    },
                },
                {
                    id: 'a114',
                    position: {
                        x: 7500,
                        y: 1500,
                    },
                },
                {
                    id: 'a15',
                    position: {
                        x: 8500,
                        y: 1500,
                    },
                },
            ],
            shapepusher_settings: {
                world: {
                    // in mm
                    width: 10000,
                    height: 5000,
                    pan: {
                        enabled: false,
                        x: 0,
                        y: 0,
                    },
                    zoom: {
                        enabled: false,
                        factor: 1,
                    },
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
                    enabled: true,
                },
                box_select: {
                    enabled: true,
                    forceItemEnclosure: false,
                },
                move: {
                    enabled: true,
                    snap: false,
                    selected: false,
                },
            },
        };

        $scope.itemActive = {};

        /******************************************/
        /** debug event things **/

        function event_log(event) {
            console.log("event", event);
        }

        function events_all_for(element, on) {
            var events = [
                // wheel
                'wheel',
                // touch
                'touchstart',
                'touchend',
                'touchmove',
                'touchenter',
                'touchleave',
                'touchcancel',
                // mouse
                'click',
                'dblclick',
                'mousedown',
                'mousemove',
                // 'mouseup',
                'mouseout',
                'mouseover',
                // paint
                'paint',
                'resize',
                'scroll',
                // scroll
                'overflow',
                'underflow',
                'overflowchanged',
                // clipboard
                'cut',
                'copy',
                'paste',
                // key
                'keydown',
                'keypress',
                'keyup',
                // drag
                'dragdrop',
                'dragenter',
                'dragexit',
                'draggesture',
                'dragover',
            ];
            angular.forEach(events, function(value, key){
                console.log("event:", value);
                if (on) {
                    element.on(value, event_log);
                } else {
                    element.off(value, event_log);
                }
            });
        }

        //////////////////////////////////////////
        // functions
        $scope.loadData = function() {
            console.log("loadData - TODO");

            var svg_base = document.getElementsByTagName('svg')[0];
            var svg_base_jql = angular.element(svg_base);

            events_all_for(
                svg_base_jql,
                true
            );
        };


        //////////////////////////////////////////
    }
]);
