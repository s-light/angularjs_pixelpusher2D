# angularjs_shapepusher2D
simple angular.js directive for 2D box layout things...

similar to a very striped down graphic editor.



history:
- shows 2D shapes on a SVG view
- select single/muliple shapes (last selected shape is highlighted)
- select with border (box selection) (inklusive forceItemEnclosure option)
- drag and drop with mouse (=move) to position the shapes on the world
- move with snap to grid
- move all selected shapes
- move of items and box select works on touch devices
- fixed bug with snap and move selected
- world pan & zoom values available in settings
- fixed bug with item select on touch devices
- zoom in&out per mouse wheel works.
- drag world around works
- added key controls: (only active if mouse is over svg)
    zoom (+ and -)
    pan (arrow keys)
    reset view (home)
    fast mode: hold shiftKey
    super fast mode: hold shiftKey + altKey
- zoom in&out to cursor location (with wheel)
- zoom in&out per pinch gesture
- added button user interface to select tools / modes


todo:
- different touch friendly add/remove/toggle modes for the box selection

extension ideas:
- group shapes
- edit groups 'in-line'
