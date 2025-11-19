import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Projection } from 'ol/proj';
import { Vector as VectorLayer, Image as ImageLayer } from 'ol/layer';
import { Vector as VectorSource, ImageStatic } from 'ol/source';
import { GeoJSON } from 'ol/format';
import { Style, Fill, Stroke, Text } from 'ol/style';
import { defaults as defaultInteractions, Select } from 'ol/interaction';
import { defaults as defaultControls, Attribution, FullScreen, ZoomToExtent, ScaleLine } from 'ol/control';
import Overlay from 'ol/Overlay';
import Feature from 'ol/Feature';
import { MultiLineString } from 'ol/geom';
import './assets/js/maps.js';
import './assets/geodata.js';
import './assets/route.js';

// Expose OpenLayers classes globally for backward compatibility
window.ol = {
    Map,
    View,
    proj: { Projection },
    layer: { Vector: VectorLayer, Image: ImageLayer },
    source: { Vector: VectorSource, ImageStatic },
    format: { GeoJSON },
    style: { Style, Fill, Stroke, Text },
    interaction: { defaults: defaultInteractions, Select },
    control: { defaults: defaultControls, Attribution, FullScreen, ZoomToExtent, ScaleLine },
    Overlay,
    Feature,
    geom: { MultiLineString },
};

// Wait for DOM and scripts to load
document.addEventListener('DOMContentLoaded', () => {
    $('#map').on('touchstart', function (event) {
        event.preventDefault();
    });

    // Active debug
    window.app.debug = false;
    window.app.show_draw_line = false;

    window.app.default_routing_start = [129.625, 803.125];
    window.app.direction_data = {
        from: null,
        to: null,
    };

    if (window.QueryString && window.QueryString.long && window.QueryString.lat) {
        const long = parseFloat(window.QueryString.long);
        const lat = parseFloat(window.QueryString.lat);
        if (long && lat) window.app.default_routing_start = [long, lat];
    }
    if (window.QueryString && window.QueryString.__debug) {
        if (window.QueryString.__debug === '1') window.app.debug = true;
        else window.app.debug = false;
    }
    if (window.QueryString && window.QueryString.__draw) {
        if (window.QueryString.__draw === '1') window.app.show_draw_line = true;
        else window.app.show_draw_line = false;
    }

    window.app.vector_direction = null;

    if (window.app.debug) {
        document.getElementById('debug').style.display = 'block';
    }

    const extent = [0, 0, 1024, 968];

    // Search box typeahead
    $('#from_place').typeahead({
        source: window.app.enterprise_geodata.features,
        autoSelect: true,
        displayText: function (item) {
            if (
                typeof item !== 'undefined' &&
                typeof item.properties !== 'undefined' &&
                typeof item.properties.data !== 'undefined' &&
                typeof item.properties.data.TenDoanhNghiep !== 'undefined'
            )
                return item.properties.data.TenDoanhNghiep;

            return '';
        },
        afterSelect: function (item) {
            if (!item) return;

            window.app.direction_input.from = {
                id: item.id,
                geoloc: item.properties.gateway || [],
                information: item.properties.data,
            };

            window.app.markAPinTo(item);
        },
    });
    $('#to_place').typeahead({
        source: window.app.enterprise_geodata.features,
        autoSelect: true,
        displayText: function (item) {
            if (
                typeof item !== 'undefined' &&
                typeof item.properties !== 'undefined' &&
                typeof item.properties.data !== 'undefined' &&
                typeof item.properties.data.TenDoanhNghiep !== 'undefined'
            )
                return item.properties.data.TenDoanhNghiep;

            return '';
        },
        afterSelect: function (item) {
            if (!item) return;

            window.app.direction_input.to = {
                id: item.id,
                geoloc: item.properties.gateway || [],
                information: item.properties.data,
            };

            window.app.markAPinTo(item);
        },
    });

    const projection = new Projection({
        code: 'xkcd-image',
        units: 'pixels',
        extent: extent,
    });

    const vectorLayer = new VectorLayer({
        source: new VectorSource({
            url: './assets/data.geojson',
            format: new GeoJSON(),
        }),
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.1)',
            }),
            stroke: new Stroke({
                color: '#319FD3',
                width: 0.5,
            }),
        }),
    });

    const select = new Select({
        wrapX: false,
    });

    const view = new View({
        projection: projection,
        center: window.app.default_routing_start,
        zoom: 2.5,
        maxZoom: 8,
        rotation: 0,
    });

    const map = new Map({
        target: 'map',
        interactions: defaultInteractions({
            pinchRotate: false,
            altShiftDragRotate: false,
        }),
        layers: [
            new ImageLayer({
                source: new ImageStatic({
                    attributions: 'ISLab',
                    url: './assets/images/kcnc_bando.jpg',
                    projection: projection,
                    imageExtent: extent,
                }),
            }),
            vectorLayer,
        ],
        controls: defaultControls({
            attribution: true,
            attributionOptions: {
                collapsible: true,
            },
            rotate: false,
        }).extend([new window.app.RotateNorthControl()]),
        view: view,
    });

    // Expose map and view globally for other functions
    window.map = map;
    window.view = view;

    const ex = map.getLayers().item(1).getSource();
    console.log('exxxxxxxx', ex);

    map.addControl(new window.app.RotateNorthControl());
    map.addControl(new FullScreen());
    map.addControl(
        new ZoomToExtent({
            extent: [0, 0, 1024, 760],
            tipLabel: 'Zoom to extent',
        })
    );
    map.addControl(new ScaleLine());

    const featureOverlay = new VectorLayer({
        source: new VectorSource(),
        map: map,
    });

    let highlight;
    window.app.direction_input = {
        from: {
            id: 'start_point',
            geoloc: window.app.default_routing_start,
            information: {
                TenDoanhNghiep: 'Vị trí hiện tại',
            },
        },
        to: null,
    };
    document.getElementById('from_place').value = window.app.direction_input.from.information.TenDoanhNghiep;

    const addDirectionInput = function (point) {
        if (!window.app.direction_input) window.app.direction_input = {};

        if (window.app.direction_input.from === null) window.app.direction_input.from = point;
        else if (window.app.direction_input.to === null) window.app.direction_input.to = point;
        else {
            window.app.direction_input.to = point;
        }

        if (window.app.debug)
            document.getElementById('info').innerHTML = JSON.stringify(window.app.direction_input);

        document.getElementById('from_place').value =
            window.app.direction_input.from && window.app.direction_input.from.information
                ? window.app.direction_input.from.information.TenDoanhNghiep
                : '';
        document.getElementById('to_place').value =
            window.app.direction_input.to && window.app.direction_input.to.information
                ? window.app.direction_input.to.information.TenDoanhNghiep
                : '';
    };

    // Current position
    const current_position = new Overlay({
        position: window.app.default_routing_start,
        positioning: 'center-center',
        element: document.getElementById('current_position'),
        stopEvent: false,
    });
    map.addOverlay(current_position);
    const current_position_message = new Overlay({
        position: [window.app.default_routing_start[0], window.app.default_routing_start[1]],
        element: document.getElementById('current_position_message'),
    });
    map.addOverlay(current_position_message);

    // Get block information
    let gateway_position = null;
    const displayFeatureInfo = function (pixel) {
        const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
            return feature;
        });

        if (feature !== highlight) {
            if (highlight) {
                featureOverlay.getSource().removeFeature(highlight);
            }
            if (feature) {
                featureOverlay.getSource().addFeature(feature);
            }
            highlight = feature;
        }
    };

    /**
     * Hover to building block
     */
    map.on('pointermove', function (evt) {
        if (evt.dragging) {
            return;
        }
        const pixel = map.getEventPixel(evt.originalEvent);
        document.getElementById('pointer_pos').innerHTML = 'pointer_pos (x, y) = ' + evt.coordinate.toString();
    });

    /**
     * Click to shop proper
     */
    const popup = new Overlay({
        element: document.getElementById('popup'),
    });
    map.addOverlay(popup);

    /**
     * Click to building block
     */
    map.on('click', function (evt) {
        document.getElementById('message').innerHTML = '(x, y) = ' + evt.coordinate.toString();

        map.removeOverlay(gateway_position);
        gateway_position = new Overlay({
            position: evt.coordinate,
            positioning: 'center-center',
            element: document.getElementById('gateway_position'),
            stopEvent: false,
        });
        map.addOverlay(gateway_position);

        displayFeatureInfo(evt.pixel);

        const element = popup.getElement();
        const coordinate = evt.coordinate;

        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
        });

        if (feature) {
            const point = feature.getId() + ': (' + feature.get('gateway') + ')';
            info.value = point;

            addDirectionInput({
                id: feature.getId(),
                geoloc: feature.get('gateway'),
                information: feature.get('data'),
            });

            popup.setPosition(coordinate);

            const data = feature.get('data');
            if (data) {
                $('.enterprise_nodata').hide();
                $('.enterprise_info').show();

                $('#TenDoanhNghiep').text(data.TenDoanhNghiep || '');
                $('#TenDuAnDauTu').text(data.TenDuAnDauTu || '');
                $('#LinhVucHoatDong').text(data.LinhVucHoatDong || '');
                $('#DiaChiTrongKhu').text(data.DiaChiTrongKhu || '');
                $('#DienThoai').text(data.DienThoai || '');
                $('#Website').text(data.Website || '');
            } else {
                $('.enterprise_nodata').show();
                $('.enterprise_info').hide();
            }
            $(element).popover({
                placement: 'top',
                animation: true,
                html: true,
                content:
                    '<div class="popup-button"><a href="#" class="btn btn-custom" id="view_info" onClick=\'modalView("' +
                    feature.getId() +
                    '", ' +
                    JSON.stringify(feature.get('data')) +
                    ', event)\'>Thông tin</a>\
                    <a href="#" id="get_direction" class="btn btn-custom" onClick="addSearchPlace(\'' +
                    feature.getId() +
                    "', " +
                    feature.get('gateway') +
                    ', event)">Chỉ đường đến đây</a></div>',
            });
            $(element).popover('show');
        }
    });

    $('#from_place').change(function (e) {
        if (!$(this).val()) window.app.direction_input.from = null;
    });
    $('#to_place').change(function (e) {
        if (!$(this).val()) window.app.direction_input.to = null;
    });

    // Draw gateway
    $.get('./assets/data.geojson', function (data) {
        try {
            const parsedData = JSON.parse(data);
            console.log(parsedData);
            const features = parsedData.features;

            for (const i in features) {
                const coordinates = features[i].geometry.coordinates[0];
                const center = window.app.getCenterFromCoordinate(coordinates);

                const pin = document.createElement('span');
                pin.className = 'enterprise_pin';

                const location_pin = new Overlay({
                    position: center,
                    positioning: 'center-center',
                    element: pin,
                    stopEvent: false,
                });
                map.addOverlay(location_pin);
            }
        } catch (e) {
            console.log('data error');
        }
    });

    const first_char = /\S/;
    function capitalize(s) {
        return s.replace(first_char, function (m) {
            return m.toUpperCase();
        });
    }

    // Voice search
    if (!('webkitSpeechRecognition' in window)) {
        console.log('Speech recognition not available');
    } else {
        const recognizer = new webkitSpeechRecognition();
        recognizer.lang = 'vi-VN';
        recognizer.continuous = false;
        recognizer.interimResults = false;

        let recognizing = false;
        let voice_for = null;

        recognizer.onend = function () {
            recognizing = false;
            $('#for_from').removeClass('loading');
            $('#for_to').removeClass('loading');
        };

        recognizer.onstart = function () {
            recognizing = true;
        };

        recognizer.onerror = function (event) {
            console.log(event.error);
        };

        recognizer.onresult = function (event) {
            let final_transcript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    final_transcript = capitalize(event.results[i][0].transcript);
                }
            }

            final_transcript = final_transcript.trim();
            $('#' + voice_for).val(final_transcript);
            $('#' + voice_for).trigger('change');
        };

        $('#for_from').click(function () {
            if (recognizing) {
                recognizer.stop();
                return;
            }
            voice_for = 'from_place';
            recognizer.start();
            $(this).addClass('loading');
        });

        $('#for_to').click(function () {
            if (recognizing) {
                recognizer.stop();
                return;
            }
            voice_for = 'to_place';
            recognizer.start();
            $(this).addClass('loading');
        });
    }

    // Expose globally for inline handlers
    window.addSearchPlace = window.app.addSearchPlace = function (block_id, long, lat, e) {
        window.getDirectionTo(long, lat, e);
    };

    // Drawing tools for debug mode
    if (window.app.show_draw_line) {
        import('ol/interaction/Draw').then(({ default: Draw }) => {
            const typeSelect = document.getElementById('type');

            let draw;
            function addInteraction() {
                const value = typeSelect.value;
                if (value !== '') {
                    draw = new Draw({
                        source: vectorLayer.getSource(),
                        type: value,
                    });
                    map.addInteraction(draw);

                    draw.on('drawend', function (evt) {
                        const list = window.app.getBlockPoint(evt);
                        if (list) {
                            window.app.arrayPointToRouterGeneratorTools(list);
                        }
                    });
                }
            }

            typeSelect.onchange = function () {
                map.removeInteraction(draw);
                addInteraction();
            };
        });
    }
});
