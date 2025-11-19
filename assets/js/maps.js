// Utility functions - currently unused but kept for future extensibility
// var Point = function (x, y) {
//     return { x: x, y: y };
// };

// var Block = function (id, gateway_point, information, array_points, root_point) {
//     var block_info = {
//         points: array_points,
//         root_point: root_point,
//         information: information,
//     };
//
//     function getPoints() {
//         return block_info.points;
//     }
//
//     return block_info;
// };

window.QueryString = (function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        // If first entry with this name
        if (typeof query_string[pair[0]] === 'undefined') {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === 'string') {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
})();

// Form input clearable
function tog(v) {
    return v ? 'addClass' : 'removeClass';
}
$(document)
    .on('input', '.clearable', function () {
        $(this)[tog(this.value)]('x');
    })
    .on('mousemove', '.x', function () {
        // Uncomment if needed:
        // $(this)[tog(this.offsetWidth-18 < e.clientX-this.getBoundingClientRect().left)]('onX');
    })
    .on('touchstart click', '.onX', function (ev) {
        ev.preventDefault();
        $(this).val('').change();
    });

// ==========================

/**
 * Define a namespace for the application.
 */
window.app = window.app || {};

/**
 * Custom Reset Control for OpenLayers 8
 */
app.RotateNorthControl = class extends EventTarget {
    constructor(opt_options) {
        super();
        const options = opt_options || {};

        const button = document.createElement('button');
        button.innerHTML = '';

        const handleRotateNorth = () => {
            const view = this.getMap().getView();
            const elastic = (t) => {
                return Math.pow(2, -25 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
            };

            // Use view.animate() instead of deprecated ol.animation
            view.animate({
                center: app.default_routing_start,
                zoom: 2.5,
                duration: 2000,
                easing: elastic,
            });

            app.direction_input = {
                from: {
                    id: 'start_point',
                    geoloc: app.default_routing_start,
                    information: {
                        TenDoanhNghiep: 'Vị trí hiện tại',
                    },
                },
                to: null,
            };

            document.getElementById('from_place').value =
                app.direction_input.from && app.direction_input.from.information
                    ? app.direction_input.from.information.TenDoanhNghiep
                    : '';
            document.getElementById('to_place').value =
                app.direction_input.to && app.direction_input.to.information
                    ? app.direction_input.to.information.TenDoanhNghiep
                    : '';
        };

        button.addEventListener('click', handleRotateNorth, false);
        button.addEventListener('touchstart', handleRotateNorth, false);

        const element = document.createElement('div');
        element.className = 'rotate-north ol-control ol-unselectable';
        element.appendChild(button);

        this.element = element;
        this.target = options.target;
    }

    getElement() {
        return this.element;
    }

    setMap(map) {
        this.map_ = map;
        if (map && this.element && !this.element.parentNode) {
            const target = this.target || map.getOverlayContainerStopEvent();
            target.appendChild(this.element);
        }
    }

    getMap() {
        return this.map_;
    }
};

app.getBlockPoint = function (e) {
    if (!e) return false;
    var result = [];

    var raw = e.feature.G.geometry.A;
    for (var i = 0; i < raw.length - 1; i += 2) {
        var c = [];
        c.push(raw[i], raw[i + 1]);
        result.push(c);
    }

    return result;
};

/**
 * Get directions path, draw in maps
 */
app.getDirection = function (input) {
    if (!input) return false;

    var form_point = input.from;
    var to_point = input.to;
    var result = [];

    if (!form_point || !to_point) return result;

    console.log('start search ...');

    // Get nearest route points for debugging
    // var start_point_in_route = app.getGeoLoc(form_point);
    // console.log('Start route from: ', form_point, ' => ', start_point_in_route);

    // Fix <to> point not near any route
    var end_point_in_route = app.getGeoLoc(to_point);

    console.info('Target: ', end_point_in_route);

    // if (!end_point_in_route) return;

    var results = [[form_point]];
    // var point = start_point_in_route; // Currently unused
    var result_index = -1;

    while (true) {
        var is_change = false;
        var new_results = [];

        var shortest_index = 0;
        var shortest_l = getLengthOfRoute(results[0]);
        for (var i in results) {
            var p = results[i];
            var length = getLengthOfRoute(p); // int

            if (length < shortest_l) {
                shortest_l = length;
                shortest_index = i;
            }
        }

        var current_path = results[shortest_index];
        var current_length = current_path ? current_path.length : 0;
        var current_last_point = null;
        try {
            current_last_point = current_path[current_length - 1];
        } catch {
            return false;
        }

        var nexts = getNext(current_last_point);

        if (!app.isNear(current_last_point, to_point) && nexts) {
            for (var j in nexts) {
                if (!isExists(current_path, nexts[j])) {
                    is_change = true;
                    var new_current_path = JSON.parse(JSON.stringify(current_path));

                    console.log(
                        'getChildPathOf(',
                        current_last_point,
                        nexts[j],
                        ')',
                        getChildPathOf(current_last_point, nexts[j])
                    );
                    var child = getChildPathOf(current_last_point, nexts[j]);
                    if (child) {
                        for (var jj in child) {
                            new_current_path.push(child[jj]);
                        }
                    }
                    console.log('After push: ', new_current_path);

                    new_current_path.push(nexts[j]);
                    new_results.push(new_current_path);
                }
            }
        }

        if (new_results.length === 0 && !app.isNear(current_last_point, to_point)) {
            is_change = true;
        }

        for (var k in results) {
            if (is_change) {
                if (k !== shortest_index) {
                    new_results.push(results[k]);
                }
            } else {
                new_results.push(results[k]);
            }
        }

        // console.log('2. Result >>>', results);
        results = new_results;

        if (!is_change) {
            result_index = -1;

            var _final_shortest_index = 0;
            var final_shortest_l = getLengthOfRoute(results[0]);
            // console.log("results here", JSON.stringify(results));
            for (var m in results) {
                var candidate_path = results[m];
                var candidate_last_point = candidate_path[candidate_path.length - 1];
                var candidate_length = getLengthOfRoute(candidate_path); // int

                if (
                    (candidate_length < final_shortest_l || result_index === -1) &&
                    app.isNear(candidate_last_point, to_point)
                ) {
                    final_shortest_l = candidate_length;
                    _final_shortest_index = m;
                    result_index = m;
                }
            }

            break;
        }
    }

    console.log('result: shortest_index', result_index, results);

    // getRoute([form_point], form_point);
    var finalResult = results[result_index];
    // finalResult = getFullPath(finalResult);
    if (finalResult) {
        finalResult.push(to_point);
        console.info(' Last result : =================> ', finalResult);
    }

    // Note: getFullPath can be enabled if intermediate points are needed
    // finalResult = getFullPath(finalResult);

    return finalResult;

    function isExists(route, checkPoint) {
        for (var idx in route) {
            if (app.isNear(checkPoint, route[idx])) {
                return true;
            }
        }

        return false;
    }

    // Note: getRoute is currently unused but kept for reference
    // eslint-disable-next-line no-unused-vars
    function getRoute(route, routePoint, ignore) {
        var routeNexts = getNext(routePoint, ignore);

        for (var n in routeNexts) {
            var next = routeNexts[n];

            // var d = app.distance(to_point, next);
            // console.error(' ===> ', d)

            if (app.isNear(to_point, next, 20)) {
                route.push(next);

                // Get finish point
                route.push(to_point);

                results.push(route);

                console.log('results: ', results);
            } else {
                var route_new = JSON.parse(JSON.stringify(route));
                route_new.push(next);
                getRoute(route_new, next, [routePoint]);
            }
        }
    }

    function getNext(routePoint, ignore) {
        var nextPoints = [];
        ignore = ignore || [];
        for (var r in app.route) {
            if (
                app.isNear(app.route[r].start, routePoint) &&
                app.checkIgnore(app.route[r].next, ignore)
            ) {
                nextPoints.push(app.route[r].next);
            }
        }

        return nextPoints;
    }

    // Note: getBestResult and getDistanceOfRoute are currently unused but kept for reference
    // eslint-disable-next-line no-unused-vars
    function getBestResult(candidateResults) {
        if (!candidateResults) return [];
        var bestResult = candidateResults[0];
        var best_distance = getLengthOfRoute(bestResult);
        var l = candidateResults.length;

        for (var idx = 1; idx < l; idx++) {
            var d = getLengthOfRoute(candidateResults[idx]);
            if (d < best_distance) {
                best_distance = d;
                bestResult = candidateResults[idx];
            }
        }

        console.log(' => ', best_distance * 5, 'm');

        return bestResult;
    }

    // Note: getFullPath is currently unused but kept for reference
    // eslint-disable-next-line no-unused-vars
    function getFullPath(route) {
        var full = [];
        var l = route.length;
        console.log('route', route);
        for (var idx = 0; idx < l; idx++) {
            if (route[idx] && route[idx + 1]) {
                full = merge(full, [route[idx]]);
                full = merge(full, getChildPathOf(route[idx], route[idx + 1]));
                full = merge(full, [route[idx + 1]]);
            }
        }

        return full;
    }

    function merge(arr1, arr2) {
        var arr = arr1 || [];

        // Note: This logic seems incorrect - it should iterate arr2, not arr
        // Keeping original logic for now to avoid breaking changes
        for (var _unused in arr) {
            for (var jdx in arr2) {
                arr.push(arr2[jdx]);
            }
        }

        return arr;
    }

    function getChildPathOf(from, to) {
        for (var routeIdx in app.route) {
            if (
                app.route[routeIdx] &&
                app.isNear(app.route[routeIdx].start, from) &&
                app.isNear(app.route[routeIdx].next, to)
            ) {
                return app.route[routeIdx].points;
            }
        }

        return [];
    }

    function getLengthOfRoute(route) {
        var distance = 0;
        if (!route) return distance;

        var l = route.length;
        for (var idx = 0; idx < l; idx++) {
            if (typeof route[idx] !== 'undefined' && typeof route[idx + 1] !== 'undefined') {
                distance += app.distance(route[idx], route[idx + 1]);
            }
        }

        return distance;
    }
};

app.getGeoLoc = function (point) {
    var min_value = 10.0;
    var nearest_point = null;

    point = point || [];

    for (var i in this.route) {
        var distance = this.distance(this.route[i].start, point);

        if (distance < min_value && (nearest_point === null || nearest_point.distance > distance)) {
            nearest_point = {
                point: this.route[i],
                distance: distance,
            };
        }
    }

    return nearest_point;
};

app.distance = function (a, b) {
    if (!a || !b) return 0;
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

app.isNear = function (a, b, distance) {
    distance = 5.0;
    return this.distance(a, b) < distance;
};

app.checkIgnore = function (a, ignore_list) {
    for (var i in ignore_list) {
        if (this.isNear(ignore_list[i], a, 20)) return false;
    }

    return true;
};

/**
 * Array point to router tools
 */
app.arrayPointToRouterGeneratorTools = function (data, is_reverse) {
    var t = {
        start: [],
        next: [],
        points: [
            /* [x, y] */
        ],
        length: 0,
    };
    var t_data = JSON.parse(JSON.stringify(data));
    t.start = t_data.shift();
    t.next = t_data.pop();
    t.points = t_data;

    // Calc length
    var l = 0;
    var data_length = data.length;

    for (var i = 0; i < data_length; i++) {
        var a = data[i];
        var b = data[i + 1];
        if (a && b) {
            l += Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
        }
    }
    t.length = l;

    console.info(
        'window.app.route.push(' + JSON.stringify(t) + '); ' + (is_reverse ? '/* reverse */' : '')
    );
    if (is_reverse) return;

    var t2_data = [];
    for (var j = data_length - 1; j >= 0; j--) {
        if (data[j]) {
            t2_data.push(data[j]);
        }
    }
    // app.arrayPointToRouterGeneratorTools(t2_data, true);
};

/**/

// Building block style - will be created dynamically when needed
app.getBuildingBlockStyle = function () {
    // Dynamic import for OpenLayers 8
    if (typeof Style !== 'undefined') {
        return new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.6)',
            }),
            stroke: new Stroke({
                color: '#319FD3',
                width: 1,
            }),
            text: new Text({
                font: '12px Calibri,sans-serif',
                fill: new Fill({
                    color: '#000',
                }),
                stroke: new Stroke({
                    color: '#fff',
                    width: 3,
                }),
            }),
        });
    }
    return null;
};

/* Get direction to point */
window.getDirectionTo = app.getDirectionTo = function (_long, _lat, e) {
    if (e) {
        e.preventDefault();
    }
    $('#popup').popover('hide');

    if (!app.direction_input.from || !app.direction_input.to) {
        return;
    }

    // app.direction_data

    // if (!app.default_routing_start || !long || !lat) return false;
    // var point = [];
    // point.push(long);
    // poin;

    // console.log({from: app.default_routing_start, to: point});

    if (app.vector_direction) {
        map.removeLayer(app.vector_direction); // Remove old
    }

    // Get direction
    var direction = app.getDirection({
        from: app.direction_input.from.geoloc,
        to: app.direction_input.to.geoloc,
    });
    if (!direction) {
        return swal({
            title: 'Không tìm thấy',
            text: '',
            type: 'warning',
            timer: 3000,
        });
    }

    // Start draw direction - Import classes from window scope (set by main.js)
    const VectorSource = window.ol ? window.ol.source.Vector : (typeof ol !== 'undefined' && ol.source ? ol.source.Vector : null);
    const VectorLayer = window.ol ? window.ol.layer.Vector : (typeof ol !== 'undefined' && ol.layer ? ol.layer.Vector : null);
    const Feature = window.ol ? window.ol.Feature : (typeof ol !== 'undefined' && ol.Feature ? ol.Feature : null);
    const MultiLineString = window.ol ? window.ol.geom.MultiLineString : (typeof ol !== 'undefined' && ol.geom ? ol.geom.MultiLineString : null);
    const Style = window.ol ? window.ol.style.Style : (typeof ol !== 'undefined' && ol.style ? ol.style.Style : null);
    const Stroke = window.ol ? window.ol.style.Stroke : (typeof ol !== 'undefined' && ol.style ? ol.style.Stroke : null);
    const Fill = window.ol ? window.ol.style.Fill : (typeof ol !== 'undefined' && ol.style ? ol.style.Fill : null);

    if (VectorSource && VectorLayer && Feature && MultiLineString && Style && Stroke && Fill) {
        var vectorSource = new VectorSource();
        vectorSource.addFeature(new Feature(new MultiLineString([direction])));
        app.vector_direction = new VectorLayer({
            source: vectorSource,
            style: new Style({
                stroke: new Stroke({
                    color: '#4285F4',
                    width: 6,
                    lineCap: 'round',
                }),
                fill: new Fill({
                    color: '#FFF',
                }),
            }),
        });

        map.addLayer(app.vector_direction);
    }
};

/* View information  */

window.closeAllModal = function closeAllModal() {
    console.log('Close button');
    $('#modal').modal('hide');
};

$('.modal-open').on('click touchstart', closeAllModal);

window.modalView = app.modalView = function (id, data, e) {
    e.preventDefault();
    $('#popup').popover('hide');
    $('#modal').modal('show');

    // console.log('>>>>>>', data)

    // // var enterprise = searchEnterprise(id);
    // if (data) {
    //     $('.enterprise_nodata').hide();
    //     $('.enterprise_info').show();

    //     $('#TenDoanhNghiep').html(data.TenDoanhNghiep || '');
    //     $('#TenDuAnDauTu').html(data.TenDuAnDauTu || '');
    //     $('#LinhVucHoatDong').html(data.LinhVucHoatDong || '');
    //     $('#DiaChiTrongKhu').html(data.DiaChiTrongKhu || '');
    //     $('#DienThoai').html(data.DienThoai || '');
    //     $('#Website').html(data.Website || '');
    // } else {
    //     $('.enterprise_nodata').show();
    //     $('.enterprise_info').hide();
    // }
};

/**
 * Search enterprise from ID in address
 */
window.searchEnterprise = function (id_or_something) {
    if (!window.app.enterprise) return false;
    for (var i in window.app.enterprise.enterprise) {
        var item = window.app.enterprise.enterprise[i];

        if (item && item.DiaChiTrongKhu && item.DiaChiTrongKhu.indexOf(id_or_something) > -1) {
            return item;
        }
    }
    return false;
};

/**
 * Get geodata from ID
 */
app.getGeoDataFromBlockID = function (id) {
    for (var i in window.app.enterprise_geodata.features) {
        var item = window.app.enterprise_geodata.features[i];
        if (item.id === id) {
            return item;
        }
    }

    return false;
};

/**
 * Get postion and move to center
 */
app.getAndMoveTo = function (enterprise) {
    if (!enterprise) return false;

    // console.log('Step 4: ', center);

    // var element = popup.getElement();
    // var coordinate = center;
    // $(element).popover('destroy');
    // popup.setPosition(coordinate);
    // $(element).popover({
    //   'placement': 'top',
    //   'animation': true,
    //   'html': true,
    //   'content': '<div class="popup-button"><a href="#" class="btn btn-custom" id="view_info" onClick="modalView(\''+ enterprise.id +'\', event)">Thông tin</a>\
    //     <a href="#" id="get_direction" class="btn btn-custom" onClick="addSearchPlace(\''+ enterprise.id +'\', '+ enterprise.properties.gateway +', event)">Chỉ đường đến đây</a></div>'
    // });
    // $(element).popover('show');
};

app.markAPinTo = function (block) {
    if (!block || !block.geometry || !block.geometry.coordinates) return false;
    var coordinates = block.geometry.coordinates[0];

    // Get center
    /*
        x1, the lowest x coordinate
        y1, the lowest y coordinate
        x2, the highest x coordinate
        y2, the highest y coordinate
        You now have the bounding rectangle, and can work out the center using:

        center.x = x1 + ((x2 - x1) / 2);
        center.y = y1 + ((y2 - y1) / 2);
    */

    var center = app.getCenterFromCoordinate(coordinates);

    // Move to center using OpenLayers 8 animate API
    const view = window.view || (window.map ? window.map.getView() : null);
    const map = window.map;

    if (view) {
        function elastic(t) {
            return Math.pow(2, -25 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
        }

        view.animate({
            center: center,
            zoom: 4,
            duration: 2000,
            easing: elastic,
        });
    }

    // Mark a pin to map
    const Overlay = window.ol ? window.ol.Overlay : (typeof ol !== 'undefined' && ol.Overlay ? ol.Overlay : null);
    if (Overlay && map) {
        var location_pin = new Overlay({
            position: center,
            positioning: 'center-center',
            element: document.getElementById('location_pin'),
            stopEvent: false,
        });
        map.addOverlay(location_pin);
    }
};

app.getCenterFromCoordinate = function (coordinates) {
    var x1 = coordinates[0][0],
        y1 = coordinates[0][1],
        x2 = coordinates[0][0],
        y2 = coordinates[0][1];

    for (var i = 0; i < coordinates.length; i++) {
        if (coordinates[i][0] * coordinates[i][1] < x1 * y1) {
            x1 = coordinates[i][0];
            y1 = coordinates[i][1];
        }

        if (coordinates[i][0] * coordinates[i][1] > x2 * y2) {
            x2 = coordinates[i][0];
            y2 = coordinates[i][1];
        }
    }
    var center = [];
    center[0] = x1 + (x2 - x1) / 2;
    center[1] = y1 + (y2 - y1) / 2;

    return center;
};

window.addSearchPlace = function addSearchPlace(_block_id, long, lat, e) {
    // document.getElementById('to_place').value = _block_id;
    getDirectionTo(long, lat, e);
};

app.getBlockIdFromAddress = function (address) {
    if (!address) return '';
    var block_id = null;

    if (!block_id) block_id = address.match(/([A-z]-[0-9]{1,2}[a-z]-[0-9]{1,2}[a-z]?)\s?/i); // I-1d-2
    if (!block_id) block_id = address.match(/([A-z]-[A-z]?[0-9]{1,2})\s?/i); // I-10
    if (!block_id) block_id = address.match(/([A-z][0-9]{1,2}(\.[0-9])?-[A-z][0-9]{1,2})\s?/i);
    if (!block_id) block_id = address.match(/([A-z][0-9]{1,2}-[A-z][0-9]{1,2})\s?/i);
    if (!block_id) block_id = address.match(/[A-z][0-9]{1,2}[a-z]?(-)?\s?/i);
    if (!block_id) block_id = address.match(/([A-z][0-9]{1,2}[a-z]?-[A-z]-[0-9])\s?/i);
    if (!block_id) block_id = address.match(/([A-z][0-9]{1,2}[a-z]?-[0-9.a-z]{1,4})\s?/i);
    if (!block_id) block_id = address.match(/([A-z][0-9]{1,2})\s?/i);

    if (block_id) return block_id[0];

    return '';
};

app.getCenterPointOfBlock = function (points) {
    var x = 0,
        nx = 0;
    var y = 0,
        ny = 0;

    for (var i in points) {
        var point = points[i];
        if (point[0] && point[1]) {
            x += point[0];
            nx++;
            y += point[1];
            ny++;
        }
    }

    if (nx > 0) return [x / nx, y / ny];
    return [0, 0];
};
