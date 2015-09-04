/******************************************************************************

    ShapePusherControls directive

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

var slShapePusherControls = angular.module('slShapePusherControls', [
    // 'ShapePusher',
]);

// get current script path
// http://stackoverflow.com/a/21103831/574981
// var scripts = document.getElementsByTagName("script");
// var myDTl_scriptPath = scripts[scripts.length-1].src;
var slShapePusherControls_scriptElement = document.querySelector(
    "[src*=slShapePusherControls]"
);
var slShapePusherControls_scriptPath = slShapePusherControls_scriptElement.getAttribute('src');
var slShapePusherControls_templateURL = slShapePusherControls_scriptPath.replace('.js', '.html');


slShapePusherControls.directive('slShapePusherControls', [
    '$filter',
function(
    $filter
) { return {
    restrict: 'A',
    // require: 'ngModel',
    // transclude: true,
    scope: {
        settings: '=',
        showButtons: '=',
    },
    // template: '<ul class="tagslist"></ul>',
    // templateUrl: 'js/myDirectivesShapePusher.html',
    // templateUrl: slShapePusherControls_templateURL,
    templateUrl: function() {
        // only for development!!!!!
        // this disables the caching of the template file..
        // console.log("shapepusher");
        // console.log("myDTl_scriptPath:", myDTl_scriptPath);
        return slShapePusherControls_templateURL + '?' + new Date();
    },
    link: function(scope, element, attr, ctrl) {
        // console.log("directive date");
        // console.log("scope", scope);
        // console.log("element", element);
        // console.log("attrs", attrs);
        // console.log("ctrl", ctrl);

        // console.log("items", scope.items);
        // console.log("settings", scope.settings);


        // default settings

        // var settings_default = {
        //     world: {
        //         // in mm
        //         width: 10000,
        //         height: 5000,
        //         pan: {
        //             enabled: false,
        //             x: 0,
        //             y: 0,
        //         },
        //         zoom: {
        //             enabled: false,
        //             factor: 1,
        //             min: 0.5,
        //             max: 40,
        //             toCursor: true,
        //         },
        //     },
        //     item: {
        //         width: 500,
        //         height: 500,
        //     },
        //     grid: {
        //         visible: true,
        //         numbers: true,
        //         stepSize: 1000,
        //     },
        //     gridSnap: {
        //         visible: true,
        //         stepSize: 250,
        //     },
        //     select: {
        //         enabled: true,
        //     },
        //     box_select: {
        //         enabled: true,
        //         forceItemEnclosure: false,
        //     },
        //     move: {
        //         enabled: true,
        //         snap: false,
        //         selected: false,
        //     },
        // };

        // set defaults
        // scope.settings = angular.merge({}, settings_default, scope.settings);

        var showButtons_default = {
            pan_zoom_home: true,
            pan_enabled: true,
            zoom_enabled: true,
            zoom_toCursor: false,
            grid_visible: true,
            grid_numbers: false,
            gridSnap_visible: false,
            select_enabled: true,
            move_enabled: true,
            move_snap: true,
            move_selected: true,
            box_select_enabled: true,
            box_select_forceItemEnclosure: true,
            box_select_mode: true,
        };

        scope.showButtons = angular.merge({}, showButtons_default, scope.showButtons);

        /******************************************/
        /** functions **/

        scope.resetPanZoom = function(event) {
            // console.group("resetPanZoom");
            // console.log("event", event);

            scope.settings.world.pan.x = 0;
            scope.settings.world.pan.y = 0;
            scope.settings.world.zoom.factor = 1;

            // console.groupEnd();
        };

    }
};}
]);
