/* 
 * AppGeo/geo 
 * (c) 2007-2011, Applied Geographics, Inc. All rights reserved. 
 * Dual licensed under the MIT or GPL Version 2 licenses. 
 * http://jquery.org/license 
 */ 
 

/* Copyright (c) 2009 Brandon Aaron (http://brandonaaron.net)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 *
 * Version: 3.0.2
 * 
 * Requires: 1.2.2+
 */
(function(c){var a=["DOMMouseScroll","mousewheel"];c.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var d=a.length;d;){this.addEventListener(a[--d],b,false)}}else{this.onmousewheel=b}},teardown:function(){if(this.removeEventListener){for(var d=a.length;d;){this.removeEventListener(a[--d],b,false)}}else{this.onmousewheel=null}}};c.fn.extend({mousewheel:function(d){return d?this.bind("mousewheel",d):this.trigger("mousewheel")},unmousewheel:function(d){return this.unbind("mousewheel",d)}});function b(f){var d=[].slice.call(arguments,1),g=0,e=true;f=c.event.fix(f||window.event);f.type="mousewheel";if(f.wheelDelta){g=f.wheelDelta/120}if(f.detail){g=-f.detail/3}d.unshift(f,g);return c.event.handle.apply(this,d)}})(jQuery);

/*!
 * jQuery UI Widget @VERSION
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Widget
 */
if (!$.widget) {
(function( $, undefined ) {

var slice = Array.prototype.slice;

var _cleanData = $.cleanData;
$.cleanData = function( elems ) {
	for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
		$( elem ).triggerHandler( "remove" );
	}
	_cleanData( elems );
};

$.widget = function( name, base, prototype ) {
	var namespace = name.split( "." )[ 0 ],
		fullName;
	name = name.split( "." )[ 1 ];
	fullName = namespace + "-" + name;

	if ( !prototype ) {
		prototype = base;
		base = $.Widget;
	}

	// create selector for plugin
	$.expr[ ":" ][ fullName ] = function( elem ) {
		return !!$.data( elem, name );
	};

	$[ namespace ] = $[ namespace ] || {};
	// create the constructor using $.extend() so we can carry over any
	// static properties stored on the existing constructor (if there is one)
	$[ namespace ][ name ] = $.extend( function( options, element ) {
		// allow instantiation without "new" keyword
		if ( !this._createWidget ) {
			return new $[ namespace ][ name ]( options, element );
		}

		// allow instantiation without initializing for simple inheritance
		// must use "new" keyword (the code above always passes args)
		if ( arguments.length ) {
			this._createWidget( options, element );
		}
	}, $[ namespace ][ name ] );

	var basePrototype = new base();
	// we need to make the options hash a property directly on the new instance
	// otherwise we'll modify the options hash on the prototype that we're
	// inheriting from
	basePrototype.options = $.extend( true, {}, basePrototype.options );
	$.each( prototype, function( prop, value ) {
		if ( $.isFunction( value ) ) {
			prototype[ prop ] = (function() {
				var _super = function( method ) {
					return base.prototype[ method ].apply( this, slice.call( arguments, 1 ) );
				};
				var _superApply = function( method, args ) {
					return base.prototype[ method ].apply( this, args );
				};
				return function() {
					var __super = this._super,
						__superApply = this._superApply,
						returnValue;

					this._super = _super;
					this._superApply = _superApply;

					returnValue = value.apply( this, arguments );

					this._super = __super;
					this._superApply = __superApply;

					return returnValue;
				};
			}());
		}
	});
	$[ namespace ][ name ].prototype = $.extend( true, basePrototype, {
		namespace: namespace,
		widgetName: name,
		widgetEventPrefix: name,
		widgetBaseClass: fullName
	}, prototype );

	$.widget.bridge( name, $[ namespace ][ name ] );
};

$.widget.bridge = function( name, object ) {
	$.fn[ name ] = function( options ) {
		var isMethodCall = typeof options === "string",
			args = slice.call( arguments, 1 ),
			returnValue = this;

		// allow multiple hashes to be passed on init
		options = !isMethodCall && args.length ?
			$.extend.apply( null, [ true, options ].concat(args) ) :
			options;

		if ( isMethodCall ) {
			this.each(function() {
				var instance = $.data( this, name );
				if ( !instance ) {
					return $.error( "cannot call methods on " + name + " prior to initialization; " +
						"attempted to call method '" + options + "'" );
				}
				if ( !$.isFunction( instance[options] ) || options.charAt( 0 ) === "_" ) {
					return $.error( "no such method '" + options + "' for " + name + " widget instance" );
				}
				var methodValue = instance[ options ].apply( instance, args );
				if ( methodValue !== instance && methodValue !== undefined ) {
					returnValue = methodValue;
					return false;
				}
			});
		} else {
			this.each(function() {
				var instance = $.data( this, name );
				if ( instance ) {
					instance.option( options || {} )._init();
				} else {
					object( options, this );
				}
			});
		}

		return returnValue;
	};
};

$.Widget = function( options, element ) {
	// allow instantiation without "new" keyword
	if ( !this._createWidget ) {
		return new $[ namespace ][ name ]( options, element );
	}

	// allow instantiation without initializing for simple inheritance
	// must use "new" keyword (the code above always passes args)
	if ( arguments.length ) {
		this._createWidget( options, element );
	}
};

$.Widget.prototype = {
	widgetName: "widget",
	widgetEventPrefix: "",
	defaultElement: "<div>",
	options: {
		disabled: false
	},
	_createWidget: function( options, element ) {
		element = $( element || this.defaultElement || this )[ 0 ];
		this.element = $( element );
		this.options = $.extend( true, {},
			this.options,
			this._getCreateOptions(),
			options );

		this.bindings = $();
		this.hoverable = $();
		this.focusable = $();

		if ( element !== this ) {
			$.data( element, this.widgetName, this );
			this._bind({ remove: "destroy" });
		}

		this._create();
		this._trigger( "create" );
		this._init();
	},
	_getCreateOptions: function() {
		return $.metadata && $.metadata.get( this.element[0] )[ this.widgetName ];
	},
	_create: $.noop,
	_init: $.noop,

	destroy: function() {
		this._destroy();
		// we can probably remove the unbind calls in 2.0
		// all event bindings should go through this._bind()
		this.element
			.unbind( "." + this.widgetName )
			.removeData( this.widgetName );
		this.widget()
			.unbind( "." + this.widgetName )
			.removeAttr( "aria-disabled" )
			.removeClass(
				this.widgetBaseClass + "-disabled " +
				"ui-state-disabled" );

		// clean up events and states
		this.bindings.unbind( "." + this.widgetName );
		this.hoverable.removeClass( "ui-state-hover" );
		this.focusable.removeClass( "ui-state-focus" );
	},
	_destroy: $.noop,

	widget: function() {
		return this.element;
	},

	option: function( key, value ) {
		var options = key;

		if ( arguments.length === 0 ) {
			// don't return a reference to the internal hash
			return $.extend( {}, this.options );
		}

		if  (typeof key === "string" ) {
			if ( value === undefined ) {
				return this.options[ key ];
			}
			options = {};
			options[ key ] = value;
		}

		this._setOptions( options );

		return this;
	},
	_setOptions: function( options ) {
		var self = this;
		$.each( options, function( key, value ) {
			self._setOption( key, value );
		});

		return this;
	},
	_setOption: function( key, value ) {
		this.options[ key ] = value;

		if ( key === "disabled" ) {
			this.widget()
				.toggleClass( this.widgetBaseClass + "-disabled ui-state-disabled", !!value )
				.attr( "aria-disabled", value );
			this.hoverable.removeClass( "ui-state-hover" );
			this.focusable.removeClass( "ui-state-focus" );
		}

		return this;
	},

	enable: function() {
		return this._setOption( "disabled", false );
	},
	disable: function() {
		return this._setOption( "disabled", true );
	},

	_bind: function( element, handlers ) {
		// no element argument, shuffle and use this.element
		if ( !handlers ) {
			handlers = element;
			element = this.element;
		} else {
			// accept selectors, DOM elements
			element = $( element );
			this.bindings = this.bindings.add( element );
		}
		var instance = this;
		$.each( handlers, function( event, handler ) {
			element.bind( event + "." + instance.widgetName, function() {
				// allow widgets to customize the disabled handling
				// - disabled as an array instead of boolean
				// - disabled class as method for disabling individual parts
				if ( instance.options.disabled === true ||
						$( this ).hasClass( "ui-state-disabled" ) ) {
					return;
				}
				return ( typeof handler === "string" ? instance[ handler ] : handler )
					.apply( instance, arguments );
			});
		});
	},

	_hoverable: function( element ) {
		this.hoverable = this.hoverable.add( element );
		this._bind( element, {
			mouseenter: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-hover" );
			},
			mouseleave: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-hover" );
			}
		});
	},

	_focusable: function( element ) {
		this.focusable = this.focusable.add( element );
		this._bind( element, {
			focusin: function( event ) {
				$( event.currentTarget ).addClass( "ui-state-focus" );
			},
			focusout: function( event ) {
				$( event.currentTarget ).removeClass( "ui-state-focus" );
			}
		});
	},

	_trigger: function( type, event, data ) {
		var callback = this.options[ type ],
			args;

		event = $.Event( event );
		event.type = ( type === this.widgetEventPrefix ?
			type :
			this.widgetEventPrefix + type ).toLowerCase();
		data = data || {};

		// copy original event properties over to the new event
		// this would happen if we could call $.event.fix instead of $.Event
		// but we don't have a way to force an event to be fixed multiple times
		if ( event.originalEvent ) {
			for ( var i = $.event.props.length, prop; i; ) {
				prop = $.event.props[ --i ];
				event[ prop ] = event.originalEvent[ prop ];
			}
		}

		this.element.trigger( event, data );

		args = $.isArray( data ) ?
			[ event ].concat( data ) :
			[ event, data ];

		return !( $.isFunction( callback ) &&
			callback.apply( this.element[0], args ) === false ||
			event.isDefaultPrevented() );
	}
};

})( jQuery );
}﻿(function ($, window, undefined) {
  $.geo = {
    //
    // geometry functions
    //

    // bbox

    _center: function (bbox) {
      // bbox only, use centroid for geom
      return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
    },

    _expandBy: function (bbox, dx, dy) {
      var c = this._center(bbox);
      return [c[0] - dx, c[1] - dy, c[0] + dx, c[1] + dy];
    },

    _height: function (bbox) {
      return bbox[3] - bbox[1];
    },

    _reaspect: function (bbox, ratio) {
      // not in JTS
      var width = this._width(bbox),
        height = this._height(bbox),
        center = this._center(bbox),
        dx, dy;

      if (width == 0 || height == 0 || ratio <= 0) {
        return bbox;
      }

      if (width / height > ratio) {
        dx = width / 2;
        dy = dx / ratio;
      } else {
        dy = height / 2;
        dx = dy * ratio;
      }

      return [center[0] - dx, center[1] - dy, center[0] + dx, center[1] + dy];
    },

    _scaleBy: function (bbox, scale) {
      // not in JTS
      return this._expandBy(bbox, this._width(bbox) * scale / 2, this._height(bbox) * scale / 2);
    },

    _width: function (bbox) {
      return bbox[2] - bbox[0];
    },

    //
    // projection
    //

    proj: (function () {
      // RW: This is a direct copy from our internal library and will be cleaned up later

      var tPi = 6.2831853071795864769;
      var hPi = 1.5707963267948966192;
      var qPi = 0.7853981633974483096;
      var radDeg = 0.0174532925199432958;
      var degRad = 57.295779513082320877;
      var fpm = 3.2808333333333333333;

      function normalizeLon(lon) {
        return lon > Math.PI ? lon -= tPi : lon < -Math.PI ? lon += tPi : lon;
      }

      this.CoordinateSystem = function (prj, fe, fn, upm) {
        if (arguments.length < 2) {
          fe = 0;
        }
        if (arguments.length < 3) {
          fn = 0;
        }
        if (arguments.length < 4) {
          upm = 1;
        }

        switch (upm) {
          case "meters": upm = 1; break;
          case "feet": upm = fpm; break;
        }

        this.toGeodetic = function (p) {
          return prj.toGeodetic({ x: (p.x - fe) / upm, y: (p.y - fn) / upm });
        };

        this.toProjected = function (p) {
          p = prj.toProjected(p);
          return { x: p.x * upm + fe, y: p.y * upm + fn };
        };
      };

      this.Mercator = function (cm, lts, sph) {
        cm *= radDeg;
        lts *= radDeg;

        var es = sph.e * sph.e;
        var sinLat = Math.sin(lts);
        var sf = 1.0 / (Math.sqrt(1.0 - es * sinLat * sinLat) / Math.cos(lts));

        var es2 = es * es;
        var es3 = es2 * es;
        var es4 = es3 * es;

        var ab = es / 2.0 + 5.0 * es2 / 24.0 + es3 / 12.0 + 13.0 * es4 / 360.0;
        var bb = 7.0 * es2 / 48.0 + 29.0 * es3 / 240.0 + 811.0 * es4 / 11520.0;
        var cb = 7.0 * es3 / 120.0 + 81.0 * es4 / 1120.0;
        var db = 4279.0 * es4 / 161280.0;

        this.toGeodetic = function (p) {
          var lon = normalizeLon(cm + p.x / (sf * sph.smaj));

          var xphi = hPi - 2.0 * Math.atan(1.0 / Math.exp(p.y / (sf * sph.smaj)));
          var lat = xphi + ab * Math.sin(2.0 * xphi) + bb * Math.sin(4.0 * xphi) + cb * Math.sin(6.0 * xphi) + db * Math.sin(8.0 * xphi);

          return { x: lon * degRad, y: lat * degRad };
        };

        this.toProjected = function (p) {
          var lat = p.y * radDeg;
          var eSinLat = sph.e * Math.sin(lat);
          var ctanz2 = Math.tan(Math.PI / 4.0 + lat / 2.0) * Math.pow(((1.0 - eSinLat) / (1.0 + eSinLat)), sph.e / 2.0);

          var lon = normalizeLon(p.x * radDeg - cm);

          return { x: sf * sph.smaj * lon, y: sf * sph.smaj * Math.log(ctanz2) };
        };
      };

      this.Spheroid = function () {
        switch (typeof (arguments[0])) {
          case "number": this.smaj = arguments[0]; this.e = arguments[1]; break;

          case "string":
            switch (arguments[0]) {
              case "WGS84Sphere": this.smaj = 6378137; this.e = 0.0; break;
            }
            break;
        }

        this.smin = this.smaj * Math.sqrt(1 - this.e * this.e);
        var fl = (this.smaj - this.smin) / this.smaj;

        this.distance = function (p0, p1, upm) {
          if (arguments.length < 3) {
            upm = 1;
          }

          switch (upm) {
            case "meters": upm = 1; break;
            case "feet": upm = fpm; break;
          }

          var lon1 = p0.x * radDeg;
          var lat1 = p0.y * radDeg;
          var lon2 = p1.x * radDeg;
          var lat2 = p1.y * radDeg;

          var f = (lat1 + lat2) * 0.5;
          var g = (lat1 - lat2) * 0.5;
          var l = (lon1 - lon2) * 0.5;

          var sf2 = Math.sin(f);
          sf2 *= sf2;
          var cf2 = Math.cos(f);
          cf2 *= cf2;
          var sg2 = Math.sin(g);
          sg2 *= sg2;
          var cg2 = Math.cos(g);
          cg2 *= cg2;
          var sl2 = Math.sin(l);
          sl2 *= sl2;
          var cl2 = Math.cos(l);
          cl2 *= cl2;

          var s = (sg2 * cl2) + (cf2 * sl2);
          var c = (cg2 * cl2) + (sf2 * sl2);

          var omega = Math.atan(Math.sqrt(s / c));
          var rho = Math.sqrt(s * c) / omega;

          var d = 2 * this.smaj * omega;
          var h1 = ((3 * rho) - 1) / (2 * c);
          var h2 = ((3 * rho) + 1) / (2 * s);

          return d * (1 + (fl * ((h1 * sf2 * cg2) - (h2 * cf2 * sg2)))) * upm;
        };
      };





      var webMercator = new Mercator(0, 0, new Spheroid("WGS84Sphere"));









      return {
        fromGeodetic: function (positions) {
          var isArray = $.isArray(positions[0]), result = [], i = 0, cur;
          if (!isArray) {
            positions = [positions];
          }
          for (; i < positions.length; i++) {
            cur = webMercator.toProjected({ x: positions[i][0], y: positions[i][1] });
            result[i] = [cur.x, cur.y];
          }
          return isArray ? result : result[0];
        },

        toGeodetic: function (positions) {
          var isArray = $.isArray(positions[0]), result = [], i = 0, cur;
          if (!isArray) {
            positions = [positions];
          }
          for (; i < positions.length; i++) {
            cur = webMercator.toGeodetic({ x: positions[i][0], y: positions[i][1] });
            result[i] = [cur.x, cur.y];
          }
          return isArray ? result : result[0];
        }
      }
    })()
  }
})(jQuery, this);
﻿(function ($, undefined) {

  var 
  // private widget members
  _elem,

  _contentBounds = {},

  _$contentFrame,
  _$servicesContainer,
  _$graphicsContainer,
  _$textContainer,
  _$textContent,
  _$eventTarget,

  _dpi = 96,

  _currentServices = [], //< internal copy

  _center,
  _pixelSize,
  _centerMax,
  _pixelSizeMax,

  _wheelZoomFactor = 1.18920711500273,
  _wheelTimer = null,
  _wheelLevel = 0,

  _zoomFactor = 2,

  _mouseDown,
  _inOp,
  _toolPan,
  _shiftZoom,
  _anchor,
  _current,
  _downDate,
  _moveDate,
  _clickDate,
  _lastMove,
  _lastDrag,

  _panning,
  _velocity,
  _friction,

  _ieVersion = (function () {
    var v = 5, div = document.createElement("div"), a = div.all || [];
    while (div.innerHTML = "<!--[if gt IE " + (++v) + "]><br><![endif]-->", a[0]) { }
    return v > 6 ? v : !v;
  } ()),

  _supportTouch,
  _softDblClick,
  _isTap,
  _isDbltap,

  _graphicStyle = {
    color: "#000",
    //fill: undefined,
    //fillOpacity: undefined,
    height: "8px",
    opacity: 1,
    //stroke: undefined,
    //strokeOpacity: undefined,
    strokeWidth: "1px",
    visibility: "visible",
    width: "8px"
  },
  _graphicTiles = [],
  _graphicShapes = [],

  _initOptions = {},

  _options = {},

  _defaultOptions = {
    bbox: [-180, -85, 180, 85],
    bboxMax: [-180, -85, 180, 85],
    center: [0, 0],
    cursors: {
      pan: "move"
    },
    mode: "pan",
    services: [
        {
          id: "OSM",
          type: "tiled",
          getUrl: function (view) {
            return "http://tile.openstreetmap.org/" + view.zoom + "/" + view.tile.column + "/" + view.tile.row + ".png";
          },
          attr: "&copy; OpenStreetMap &amp; contributors, CC-BY-SA"
        }
      ],
    tilingScheme: {
      tileWidth: 256,
      tileHeight: 256,
      levels: 18,
      basePixelSize: 156543.03392799936,
      origin: [-20037508.342787, 20037508.342787]
    },
    zoom: 0,

    _serviceTypes: {
      tiled: (function () {
        var tiledServicesState = {};

        return {
          create: function (map, service, index) {
            if (!tiledServicesState[service.id]) {
              tiledServicesState[service.id] = {
                loadCount: 0,
                reloadTiles: false,
                serviceContainer: null
              };

              var scHtml = "<div data-service='" + service.id + "' style='position:absolute; left:0; top:0; width:8px; height:8px; margin:0; padding:0; display:" + (service.visible === undefined || service.visible ? "block" : "none") + ";'></div>";
              _$servicesContainer.append(scHtml);

              tiledServicesState[service.id].serviceContainer = _$servicesContainer.children("[data-service='" + service.id + "']");
            }
          },

          destroy: function (map, service) {
            tiledServicesState[service.id].serviceContainer.remove();
            delete tiledServicesState[service.id];
          },

          interactivePan: function (map, service, dx, dy) {
            if (!tiledServicesState[service.id]) {
              return;
            }

            this._cancelUnloaded(map, service);
            tiledServicesState[service.id].serviceContainer.children().css({
              left: function (index, value) {
                return parseInt(value) + dx;
              },
              top: function (index, value) {
                return parseInt(value) + dy;
              }
            });

            if (service && tiledServicesState[service.id] != null && (service.visible === undefined || service.visible)) {

              var 
              pixelSize = _pixelSize,

              serviceState = tiledServicesState[service.id],
              serviceContainer = serviceState.serviceContainer,
              scaleContainer = serviceContainer.children("[data-pixelSize='" + pixelSize + "']"),

              /* same as refresh 1 */
              mapWidth = _contentBounds["width"],
              mapHeight = _contentBounds["height"],

              tilingScheme = map.options["tilingScheme"],
              tileWidth = tilingScheme.tileWidth,
              tileHeight = tilingScheme.tileHeight,
              /* end same as refresh 1 */

              halfWidth = mapWidth / 2 * pixelSize,
              halfHeight = mapHeight / 2 * pixelSize,

              currentPosition = scaleContainer.position(),
              scaleOriginParts = scaleContainer.data("scaleOrigin").split(","),
              totalDx = parseInt(scaleOriginParts[0]) - currentPosition.left,
              totalDy = parseInt(scaleOriginParts[1]) - currentPosition.top,

              mapCenterOriginal = _center,
              mapCenter = [mapCenterOriginal[0] + totalDx * pixelSize, mapCenterOriginal[1] - totalDy * pixelSize],

              /* same as refresh 2 */
              tileX = Math.floor(((mapCenter[0] - halfWidth) - tilingScheme.origin[0]) / (pixelSize * tileWidth)),
              tileY = Math.floor((tilingScheme.origin[1] - (mapCenter[1] + halfHeight)) / (pixelSize * tileHeight)),
              tileX2 = Math.ceil(((mapCenter[0] + halfWidth) - tilingScheme.origin[0]) / (pixelSize * tileWidth)),
              tileY2 = Math.ceil((tilingScheme.origin[1] - (mapCenter[1] - halfHeight)) / (pixelSize * tileHeight)),

              bboxMax = map._getBboxMax(),
              pixelSizeAtZero = map._getTiledPixelSize(0),
              ratio = pixelSizeAtZero / pixelSize,
              fullXAtScale = Math.floor((bboxMax[0] - tilingScheme.origin[0]) / (pixelSizeAtZero * tileWidth)) * ratio,
              fullYAtScale = Math.floor((tilingScheme.origin[1] - bboxMax[3]) / (pixelSizeAtZero * tileHeight)) * ratio,

              fullXMinX = tilingScheme.origin[0] + (fullXAtScale * tileWidth) * pixelSize,
              fullYMaxY = tilingScheme.origin[1] - (fullYAtScale * tileHeight) * pixelSize,
              /* end same as refresh 2 */

              serviceLeft = Math.round((fullXMinX - (mapCenterOriginal[0] - halfWidth)) / pixelSize),
              serviceTop = Math.round(((mapCenterOriginal[1] + halfHeight) - fullYMaxY) / pixelSize),

              opacity = (service.opacity === undefined ? 1 : service.opacity),

              x, y;

              for (x = tileX; x < tileX2; x++) {
                for (y = tileY; y < tileY2; y++) {
                  var 
                  tileStr = "" + x + "," + y,
                  $img = scaleContainer.children("[data-tile='" + tileStr + "']").removeAttr("data-dirty");

                  if ($img.size() === 0) {
                    /* same as refresh 3 */
                    var bottomLeft = [
                      tilingScheme.origin[0] + (x * tileWidth) * pixelSize,
                      tilingScheme.origin[1] - (y * tileHeight) * pixelSize
                    ],

                    topRight = [
                      tilingScheme.origin[0] + ((x + 1) * tileWidth - 1) * pixelSize,
                      tilingScheme.origin[1] - ((y + 1) * tileHeight - 1) * pixelSize
                    ],

                    tileBbox = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]],

                    imageUrl = service.getUrl({
                      bbox: tileBbox,
                      width: tileWidth,
                      height: tileHeight,
                      zoom: map._getZoom(),
                      tile: {
                        row: y,
                        column: x
                      },
                      index: Math.abs(y + x)
                    });
                    /* end same as refresh 3 */

                    serviceState.loadCount++;
                    //this._map._requestQueued();

                    if (serviceState.reloadTiles && $img.size() > 0) {
                      $img.attr("src", imageUrl);
                    } else {
                      /* same as refresh 4 */
                      var imgMarkup = "<img style='position:absolute; " +
                        "left:" + (((x - fullXAtScale) * 100) + (serviceLeft - (serviceLeft % tileWidth)) / tileWidth * 100) + "%; " +
                        "top:" + (((y - fullYAtScale) * 100) + (serviceTop - (serviceTop % tileHeight)) / tileHeight * 100) + "%; ";

                      if ($("body")[0].filters === undefined) {
                        imgMarkup += "width: 100%; height: 100%;";
                      }

                      imgMarkup += "margin:0; padding:0; -khtml-user-select:none; -moz-user-select:none; -webkit-user-select:none; user-select:none; display:none;' unselectable='on' data-tile='" + tileStr + "' />";

                      scaleContainer.append(imgMarkup);
                      $img = scaleContainer.children(":last");
                      $img.load(function (e) {
                        if (opacity < 1) {
                          $(e.target).fadeTo(0, opacity);
                        } else {
                          $(e.target).show();
                        }

                        serviceState.loadCount--;

                        if (serviceState.loadCount <= 0) {
                          serviceContainer.children(":not([data-pixelSize='" + pixelSize + "'])").remove();
                          serviceState.loadCount = 0;
                        }
                      }).error(function (e) {
                        $(e.target).remove();
                        serviceState.loadCount--;

                        if (serviceState.loadCount <= 0) {
                          serviceContainer.children(":not([data-pixelSize='" + pixelSize + "'])").remove();
                          serviceState.loadCount = 0;
                        }
                      }).attr("src", imageUrl);
                      /* end same as refresh 4 */
                    }
                  }
                }
              }
            }
          },

          interactiveScale: function (map, service, center, pixelSize) {
            if (!tiledServicesState[service.id]) {
              return;
            }

            this._cancelUnloaded(map, service);

            var 
            serviceContainer = tiledServicesState[service.id].serviceContainer,

            tilingScheme = map.options["tilingScheme"],
            tileWidth = tilingScheme.tileWidth,
            tileHeight = tilingScheme.tileHeight;


            serviceContainer.children().each(function (i) {
              var 
              $scaleContainer = $(this),
              scaleRatio = $scaleContainer.attr("data-pixelSize") / pixelSize;

              scaleRatio = Math.round(scaleRatio * 1000) / 1000;

              var 
              scaleOriginParts = $scaleContainer.data("scaleOrigin").split(","),
              oldMapCoord = map._toMap([scaleOriginParts[0], scaleOriginParts[1]]),
              newPixelPoint = map._toPixel(oldMapCoord, center, pixelSize);

              $scaleContainer.css({
                left: Math.round(newPixelPoint[0]) + "px",
                top: Math.round(newPixelPoint[1]) + "px",
                width: tileWidth * scaleRatio,
                height: tileHeight * scaleRatio
              });

              if ($("body")[0].filters !== undefined) {
                $scaleContainer.children().each(function (i) {
                  $(this).css("filter", "progid:DXImageTransform.Microsoft.Matrix(FilterType=bilinear,M11=" + scaleRatio + ",M22=" + scaleRatio + ",sizingmethod='auto expand')");
                });
              }
            });
          },

          refresh: function (map, service) {
            if (service && tiledServicesState[service.id] && (service.visible === undefined || service.visible)) {
              this._cancelUnloaded(map, service);

              var 
              bbox = map._getBbox(),
              pixelSize = _pixelSize,

              serviceState = tiledServicesState[service.id],
              serviceContainer = serviceState.serviceContainer,

              mapWidth = _contentBounds["width"],
              mapHeight = _contentBounds["height"],

              tilingScheme = map.options["tilingScheme"],
              tileWidth = tilingScheme.tileWidth,
              tileHeight = tilingScheme.tileHeight,

              tileX = Math.floor((bbox[0] - tilingScheme.origin[0]) / (pixelSize * tileWidth)),
              tileY = Math.floor((tilingScheme.origin[1] - bbox[3]) / (pixelSize * tileHeight)),
              tileX2 = Math.ceil((bbox[2] - tilingScheme.origin[0]) / (pixelSize * tileWidth)),
              tileY2 = Math.ceil((tilingScheme.origin[1] - bbox[1]) / (pixelSize * tileHeight)),

              bboxMax = map._getBboxMax(),
              pixelSizeAtZero = map._getTiledPixelSize(0),
              ratio = pixelSizeAtZero / pixelSize,
              fullXAtScale = Math.floor((bboxMax[0] - tilingScheme.origin[0]) / (pixelSizeAtZero * tileWidth)) * ratio,
              fullYAtScale = Math.floor((tilingScheme.origin[1] - bboxMax[3]) / (pixelSizeAtZero * tileHeight)) * ratio,

              fullXMinX = tilingScheme.origin[0] + (fullXAtScale * tileWidth) * pixelSize,
              fullYMaxY = tilingScheme.origin[1] - (fullYAtScale * tileHeight) * pixelSize,

              serviceLeft = Math.round((fullXMinX - bbox[0]) / pixelSize),
              serviceTop = Math.round((bbox[3] - fullYMaxY) / pixelSize),

              scaleContainers = serviceContainer.children().show(),
              scaleContainer = scaleContainers.filter("[data-pixelSize='" + pixelSize + "']").appendTo(serviceContainer),

              opacity = (service.opacity === undefined ? 1 : service.opacity),

              x, y;

              if (serviceState.reloadTiles) {
                scaleContainers.find("img").attr("data-dirty", "true");
              }

              if (!scaleContainer.size()) {
                serviceContainer.append("<div style='position:absolute; left:" + serviceLeft % tileWidth + "px; top:" + serviceTop % tileHeight + "px; width:" + tileWidth + "px; height:" + tileHeight + "px; margin:0; padding:0;' data-pixelSize='" + pixelSize + "'></div>");
                scaleContainer = serviceContainer.children(":last").data("scaleOrigin", (serviceLeft % tileWidth) + "," + (serviceTop % tileHeight));
              } else {
                scaleContainer.css({
                  left: (serviceLeft % tileWidth) + "px",
                  top: (serviceTop % tileHeight) + "px"
                }).data("scaleOrigin", (serviceLeft % tileWidth) + "," + (serviceTop % tileHeight));

                scaleContainer.children().each(function (i) {
                  var 
                  $img = $(this),
                  tile = $img.attr("data-tile").split(",");

                  $img.css({
                    left: Math.round(((parseInt(tile[0]) - fullXAtScale) * 100) + (serviceLeft - (serviceLeft % tileWidth)) / tileWidth * 100) + "%",
                    top: Math.round(((parseInt(tile[1]) - fullYAtScale) * 100) + (serviceTop - (serviceTop % tileHeight)) / tileHeight * 100) + "%"
                  });

                  if (opacity < 1) {
                    $img.fadeTo(0, opacity);
                  }
                });
              }

              for (x = tileX; x < tileX2; x++) {
                for (y = tileY; y < tileY2; y++) {
                  var 
                  tileStr = "" + x + "," + y,
                  $img = scaleContainer.children("[data-tile='" + tileStr + "']").removeAttr("data-dirty");

                  if ($img.size() === 0 || serviceState.reloadTiles) {
                    var bottomLeft = [
                      tilingScheme.origin[0] + (x * tileWidth) * pixelSize,
                      tilingScheme.origin[1] - (y * tileHeight) * pixelSize
                    ],

                    topRight = [
                      tilingScheme.origin[0] + ((x + 1) * tileWidth - 1) * pixelSize,
                      tilingScheme.origin[1] - ((y + 1) * tileHeight - 1) * pixelSize
                    ],

                    tileBbox = [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]],

                    imageUrl = service.getUrl({
                      bbox: tileBbox,
                      width: tileWidth,
                      height: tileHeight,
                      zoom: map._getZoom(),
                      tile: {
                        row: y,
                        column: x
                      },
                      index: Math.abs(y + x)
                    });

                    serviceState.loadCount++;
                    //this._map._requestQueued();

                    if (serviceState.reloadTiles && $img.size() > 0) {
                      $img.attr("src", imageUrl);
                    } else {
                      var imgMarkup = "<img style='position:absolute; " +
                        "left:" + (((x - fullXAtScale) * 100) + (serviceLeft - (serviceLeft % tileWidth)) / tileWidth * 100) + "%; " +
                        "top:" + (((y - fullYAtScale) * 100) + (serviceTop - (serviceTop % tileHeight)) / tileHeight * 100) + "%; ";

                      if ($("body")[0].filters === undefined) {
                        imgMarkup += "width: 100%; height: 100%;";
                      }

                      imgMarkup += "margin:0; padding:0; -khtml-user-select:none; -moz-user-select:none; -webkit-user-select:none; user-select:none; display:none;' unselectable='on' data-tile='" + tileStr + "' />";

                      scaleContainer.append(imgMarkup);
                      $img = scaleContainer.children(":last");
                      $img.load(function (e) {
                        if (opacity < 1) {
                          $(e.target).fadeTo(0, opacity);
                        } else {
                          $(e.target).show();
                        }

                        serviceState.loadCount--;

                        if (serviceState.loadCount <= 0) {
                          serviceContainer.children(":not([data-pixelSize='" + pixelSize + "'])").remove();
                          serviceState.loadCount = 0;
                        }
                      }).error(function (e) {
                        $(e.target).remove();
                        serviceState.loadCount--;

                        if (serviceState.loadCount <= 0) {
                          serviceContainer.children(":not([data-pixelSize='" + pixelSize + "'])").remove();
                          serviceState.loadCount = 0;
                        }
                      }).attr("src", imageUrl);
                    }
                  }
                }
              }

              scaleContainers.find("[data-dirty]").remove();
              serviceState.reloadTiles = false;
            }
          },

          _cancelUnloaded: function (map, service) {
            var serviceState = tiledServicesState[service.id];

            if (serviceState && serviceState.loadCount > 0) {
              serviceState.serviceContainer.find("img:hidden").remove();
              while (serviceState.loadCount > 0) {
                serviceState.loadCount--;
              }
            }
          }
        };
      })(),

      shingled: (function () {
        var shingledServicesState = {};

        return {
          create: function (map, service, index) {
            if (!shingledServicesState[service.id]) {
              shingledServicesState[service.id] = {
                loadCount: 0
              };

              var scHtml = '<div data-service="' + service.id + '" style="position:absolute; left:0; top:0; width:16px; height:16px; margin:0; padding:0; display:' + (service.visible === undefined || service.visible ? "block" : "none") + ';"></div>';
              _$servicesContainer.append(scHtml);

              shingledServicesState[service.id].serviceContainer = _$servicesContainer.children('[data-service="' + service.id + '"]');
            }
          },

          destroy: function (map, service) {
            shingledServicesState[service.id].serviceContainer.remove();
            delete shingledServicesState[service.id];
          },

          interactivePan: function (map, service, dx, dy) {
            if (!shingledServicesState[service.id]) {
              return;
            }

            this._cancelUnloaded(map, service);

            var 
            serviceState = shingledServicesState[service.id],
            serviceContainer = serviceState.serviceContainer,
            scaleContainer = serviceContainer.children("[data-pixelSize='" + _pixelSize + "']"),
            panContainer = scaleContainer.children("div");

            if (!panContainer.length) {
              scaleContainer.children("img").wrap('<div style="position:absolute; left:0; top:0; width:100%; height:100%;"></div>');
              panContainer = scaleContainer.children("div");
            }

            panContainer.css({
              left: function (index, value) {
                return parseInt(value) + dx;
              },
              top: function (index, value) {
                return parseInt(value) + dy;
              }
            });
          },

          interactiveScale: function (map, service, center, pixelSize) {
            if (!shingledServicesState[service.id]) {
              return;
            }

            this._cancelUnloaded(map, service);

            var 
            serviceState = shingledServicesState[service.id],
            serviceContainer = serviceState.serviceContainer,

            mapWidth = _contentBounds["width"],
            mapHeight = _contentBounds["height"],

            halfWidth = mapWidth / 2,
            halfHeight = mapHeight / 2,

            bbox = [center[0] - halfWidth, center[1] - halfHeight, center[0] + halfWidth, center[1] + halfHeight];

            serviceContainer.children().each(function (i) {
              var 
              $scaleContainer = $(this),
              scalePixelSize = $scaleContainer.attr("data-pixelSize"),
              ratio = scalePixelSize / pixelSize;

              $scaleContainer.css({ width: mapWidth * ratio, height: mapHeight * ratio }).children("img").each(function (i) {
                var 
                $img = $(this),
                imgCenter = $img.data("center"),
                x = (Math.round((imgCenter[0] - center[0]) / scalePixelSize) - halfWidth) * ratio,
                y = (Math.round((center[1] - imgCenter[1]) / scalePixelSize) - halfHeight) * ratio;

                $img.css({ left: x + "px", top: y + "px" });
              });
            });
          },

          refresh: function (map, service) {
            if (service && shingledServicesState[service.id] && (service.visible === undefined || service.visible)) {
              this._cancelUnloaded(map, service);

              var 
              bbox = map._getBbox(),
              pixelSize = _pixelSize,

              serviceState = shingledServicesState[service.id],
              serviceContainer = serviceState.serviceContainer,

              mapWidth = _contentBounds["width"],
              mapHeight = _contentBounds["height"],

              halfWidth = mapWidth / 2,
              halfHeight = mapHeight / 2,

              scaleContainer = serviceContainer.children('[data-pixelSize="' + pixelSize + '"]'),

              opacity = (service.opacity === undefined ? 1 : service.opacity),

              $img;

              if (!scaleContainer.size()) {
                serviceContainer.append('<div style="position:absolute; left:' + halfWidth + 'px; top:' + halfHeight + 'px; width:' + mapWidth + 'px; height:' + mapHeight + 'px; margin:0; padding:0;" data-pixelSize="' + pixelSize + '"></div>');
                scaleContainer = serviceContainer.children(":last");
              }

              scaleContainer.children("img").each(function (i) {
                var 
                $thisimg = $(this),
                imgCenter = $thisimg.data("center"),
                x = Math.round((imgCenter[0] - _center[0]) / pixelSize) - halfWidth,
                y = Math.round((_center[1] - imgCenter[1]) / pixelSize) - halfHeight;

                $thisimg.css({ left: x + "px", top: y + "px" });
              });

              if (opacity < 1) {
                serviceContainer.find("img").attr("data-keepAlive", "0");
              }

              var 
              imageUrl = service.getUrl({
                bbox: bbox,
                width: mapWidth,
                height: mapHeight,
                zoom: map._getZoom(),
                tile: null,
                index: 0
              });

              serviceState.loadCount++;
              //this._map._requestQueued();

              scaleContainer.append('<img style="position:absolute; left:-' + halfWidth + 'px; top:-' + halfHeight + 'px; width:100%; height:100%; margin:0; padding:0; -khtml-user-select:none; -moz-user-select:none; -webkit-user-select:none; user-select:none; display:none;" unselectable="on" />');
              $img = scaleContainer.children(":last").data("center", _center);
              $img.load(function (e) {
                if (opacity < 1) {
                  $(e.target).fadeTo(0, opacity);
                } else {
                  $(e.target).show();
                }

                serviceState.loadCount--;

                if (serviceState.loadCount <= 0) {
                  serviceContainer.children(':not([data-pixelSize="' + pixelSize + '"])').remove();

                  var panContainer = serviceContainer.find('[data-pixelSize="' + pixelSize + '"]>div');
                  if (panContainer.size() > 0) {
                    var panContainerPos = panContainer.position();

                    panContainer.children("img").each(function (i) {
                      var 
                      $thisimg = $(this),
                      x = panContainerPos.left + parseInt($thisimg.css("left")),
                      y = panContainerPos.top + parseInt($thisimg.css("top"));

                      $thisimg.css({ left: x + "px", top: y + "px" });
                    }).unwrap();

                    panContainer.remove();
                  }

                  serviceState.loadCount = 0;
                }
              }).error(function (e) {
                $(e.target).remove();
                serviceState.loadCount--;

                if (serviceState.loadCount <= 0) {
                  serviceContainer.children(":not([data-pixelSize='" + pixelSize + "'])").remove();
                  serviceState.loadCount = 0;
                }
              }).attr("src", imageUrl);
            }
          },

          _cancelUnloaded: function (map, service) {
            var serviceState = shingledServicesState[service.id];

            if (serviceState && serviceState.loadCount > 0) {
              serviceState.serviceContainer.find("img:hidden").remove();
              while (serviceState.loadCount > 0) {
                serviceState.loadCount--;
              }
            }
          }
        }
      })()
    }
  };

  $.widget("geo.geomap", (function () {
    return {
      options: $.extend({}, _defaultOptions),

      _createWidget: function (options, element) {
        _initOptions = options;
        _elem = $(element);

        this._forcePosition(_elem);

        _elem.css("text-align", "left");

        var size = this._findMapSize();
        _contentBounds = {
          x: parseInt(_elem.css("padding-left")),
          y: parseInt(_elem.css("padding-top")),
          width: size["width"],
          height: size["height"]
        };

        this._createChildren();

        _center = _centerMax = [0, 0];

        _pixelSize = _pixelSizeMax = 156543.03392799936;

        _mouseDown =
        _inOp =
        _toolPan =
        _shiftZoom =
        _panning =
        _isTap =
        _isDbltap = false;

        _anchor =
        _current =
        _lastMove =
        _lastDrag =
        _velocity = [0, 0];

        _friction = [.8, .8];

        _downDate =
        _moveDate =
        _clickDate = 0;

        $.Widget.prototype._createWidget.apply(this, arguments);
      },

      _create: function () {
        _options = this.options;

        _supportTouch = "ontouchend" in document;
        _softDblClick = _supportTouch || _ieVersion == 7;

        var 
        touchStartEvent = _supportTouch ? "touchstart" : "mousedown",
    	  touchStopEvent = _supportTouch ? "touchend touchcancel" : "mouseup",
    	  touchMoveEvent = _supportTouch ? "touchmove" : "mousemove";

        _$eventTarget.dblclick($.proxy(this._eventTarget_dblclick, this));
        _$eventTarget.bind(touchStartEvent, $.proxy(this._eventTarget_touchstart, this));

        var dragTarget = (_$eventTarget[0].setCapture) ? _$eventTarget : $(document);
        dragTarget.bind(touchMoveEvent, $.proxy(this._dragTarget_touchmove, this));
        dragTarget.bind(touchStopEvent, $.proxy(this._dragTarget_touchstop, this));

        _$eventTarget.mousewheel($.proxy(this._eventTarget_mousewheel, this));

        if (_initOptions) {
          if (_initOptions.bbox) {
            this._setOption("bbox", _initOptions.bbox, false);
          }
          if (_initOptions.center) {
            this._setOption("center", _initOptions.center, false);
          }
          if (_initOptions.zoom) {
            this._setZoom(_initOptions.zoom, false, false);
          }
        }

        _$eventTarget.css("cursor", _options["cursors"][_options["mode"]]);

        this._createServices();

        this._refresh();
      },

      _setOption: function (key, value, refresh) {
        refresh = (refresh === undefined || refresh);

        switch (key) {
          case "bbox":
            if ($.geo.proj) {
              value = $.geo.proj.fromGeodetic([[value[0], value[1]], [value[2], value[3]]]);
              value = [value[0][0], value[0][1], value[1][0], value[1][1]];
            }

            this._setBbox(value, false, refresh);
            value = this._getBbox();

            if ($.geo.proj) {
              value = $.geo.proj.toGeodetic([[value[0], value[1]], [value[2], value[3]]]);
              value = [value[0][0], value[0][1], value[1][0], value[1][1]];
            }
            break;

          case "center":
            this._setCenterAndSize($.geo.proj ? $.geo.proj.fromGeodetic([[value[0], value[1]]])[0] : value, _pixelSize, false, refresh);
            break;

          case "zoom":
            this._setZoom(value, false, refresh);
            break;
        }

        $.Widget.prototype._setOption.apply(this, arguments);

        switch (key) {
          case "services":
            this._createServices();
            if (refresh) {
              this._refresh();
            }
            break;
        }
      },

      destroy: function () {
        $.Widget.prototype.destroy.apply(this, arguments);
        this.element.html("");
      },

      getPixelSize: function () {
        return _pixelSize;
      },

      toMap: function (p) {
        p = this._toMap(p);
        return $.geo.proj ? $.geo.proj.toGeodetic(p) : p;
      },

      toPixel: function (p) {
        p = $.geo.proj ? $.geo.proj.fromGeodetic(p) : p;
        return this._toPixel(p);
      },

      addShape: function (shape, style) {
        //var graphicTile = _graphicTiles.length ? _graphicTiles[_graphicTiles.length - 1] : null;
        style = style || _graphicStyle;
        if (shape) {
          var shapes;
          if (shape.type == "FeatureCollection") {
            shapes = shape.features;
          } else {
            shapes = [shape];
          }

          $.each(shapes, function () {
            _graphicShapes[_graphicShapes.length] = {
              shape: this,
              style: style
            };
          });
          if (_graphicTiles.length > 0) {
            this._refresh();
          }
        }
      },


      _getBbox: function () {
        // calculate the internal bbox
        var halfWidth = _contentBounds["width"] / 2 * _pixelSize,
        halfHeight = _contentBounds["height"] / 2 * _pixelSize;
        return [_center[0] - halfWidth, _center[1] - halfHeight, _center[0] + halfWidth, _center[1] + halfHeight];
      },

      _setBbox: function (value, trigger, refresh) {
        var center = [value[0] + (value[2] - value[0]) / 2, value[1] + (value[3] - value[1]) / 2],
          pixelSize = Math.max($.geo._width(value) / _contentBounds.width, $.geo._height(value) / _contentBounds.height);

        if (_options["tilingScheme"]) {
          var zoom = this._getTiledZoom(pixelSize);
          pixelSize = this._getTiledPixelSize(zoom);
        }
        this._setCenterAndSize(center, pixelSize, trigger, refresh);
      },

      _getBboxMax: function () {
        // calculate the internal bboxMax
        var halfWidth = _contentBounds["width"] / 2 * _pixelSizeMax,
        halfHeight = _contentBounds["height"] / 2 * _pixelSizeMax;
        return [_centerMax[0] - halfWidth, _centerMax[1] - halfHeight, _centerMax[0] + halfWidth, _centerMax[1] + halfHeight];
      },

      _getZoom: function () {
        // calculate the internal zoom level, vs. public zoom property
        if (_options["tilingScheme"]) {
          return this._getTiledZoom(_pixelSize);
        } else {
          var ratio = _contentBounds["width"] / _contentBounds["height"],
          bbox = $.geo._reaspect(this._getBbox(), ratio),
          bboxMax = $.geo._reaspect(this._getBboxMax(), ratio);

          return Math.log($.geo._width(bboxMax) / $.geo._width(bbox)) / Math.log(_zoomFactor);
        }
      },

      _setZoom: function (value, trigger, refresh) {
        value = Math.max(value, 0);

        if (_options["tilingScheme"]) {
          this._setCenterAndSize(_center, this._getTiledPixelSize(value), trigger, refresh);
        } else {
          var 
          bbox = $.geo._scaleBy(this._getBbox(), 1 / Math.pow(_zoomFactor, value)),
          pixelSize = Math.max($.geo._width(bbox) / _contentBounds.width, $.geo._height(bbox) / _contentBounds.height);
          this._setCenterAndSize(_center, pixelSize, trigger, refresh);
        }
      },

      _createChildren: function () {
        var existingChildren = _elem.children().detach();

        this._forcePosition(existingChildren);

        existingChildren.css("-moz-user-select", "none");

        _elem.prepend("<div style='position:absolute; left:" + _contentBounds.x + "px; top:" + _contentBounds.y + "px; width:" + _contentBounds["width"] + "px; height:" + _contentBounds["height"] + "px; margin:0; padding:0; overflow:hidden; -khtml-user-select:none; -moz-user-select:none; -webkit-user-select:none; user-select:none;' unselectable='on'></div>");
        _$eventTarget = _$contentFrame = _elem.children(':first');

        _$contentFrame.append('<div style="position:absolute; left:0; top:0; width:' + _contentBounds["width"] + 'px; height:' + _contentBounds["height"] + 'px; margin: 0; padding: 0;"></div>');
        _$servicesContainer = _$contentFrame.children(':last');

        _$contentFrame.append('<div style="position:absolute; left:0; top:0; width:' + _contentBounds["width"] + 'px; height:' + _contentBounds["height"] + 'px; margin: 0; padding: 0;"></div>');
        _$graphicsContainer = _$contentFrame.children(':last');

        _$contentFrame.append('<div class="ui-widget ui-widget-content ui-corner-all" style="position:absolute; left:0; top:0px; max-width:128px; display:none;"><div style="margin:.2em;"></div></div>');
        _$textContainer = _$contentFrame.children(':last');
        _$textContent = _$textContainer.children();

        _$contentFrame.append(existingChildren);
      },

      _createServices: function () {
        var i;
        for (i = 0; i < _currentServices.length; i++) {
          _options["_serviceTypes"][_currentServices[i].type].destroy(this, _currentServices[i]);
        }

        for (i = 0; i < _options["services"].length; i++) {
          _options["_serviceTypes"][_options["services"][i].type].create(this, _options["services"][i], i);
        }

        _currentServices = _options["services"];
      },

      _findMapSize: function () {
        // really, really attempt to find a size for this thing
        // even if it's hidden (look at parents)
        var size = { width: 0, height: 0 },
        sizeContainer = _elem;

        while (sizeContainer.size() && !(size["width"] > 0 && size["height"] > 0)) {
          size = { width: sizeContainer.width(), height: sizeContainer.height() };
          if (size["width"] <= 0 || size["height"] <= 0) {
            size = { width: parseInt(sizeContainer.css("width")), height: parseInt(sizeContainer.css("height")) };
          }
          sizeContainer = sizeContainer.parent();
        }
        return size;
      },

      _forcePosition: function (elem) {
        var cssPosition = elem.css("position");
        if (cssPosition != "relative" && cssPosition != "absolute" && cssPosition != "fixed") {
          elem.css("position", "relative");
        }
      },

      _getTiledPixelSize: function (zoom) {
        var tilingScheme = _options["tilingScheme"];
        if (tilingScheme != null) {
          if (zoom === 0) {
            return tilingScheme.pixelSizes != null ? tilingScheme.pixelSizes[0] : tilingScheme.basePixelSize;
          }

          zoom = Math.round(zoom);
          zoom = Math.max(zoom, 0);
          var levels = tilingScheme.pixelSizes != null ? tilingScheme.pixelSizes.length : tilingScheme.levels;
          zoom = Math.min(zoom, levels - 1);

          if (tilingScheme.pixelSizes != null) {
            return tilingScheme.pixelSizes[zoom];
          } else {
            return tilingScheme.basePixelSize / Math.pow(2, zoom);
          }
        } else {
          return NaN;
        }
      },

      _getTiledZoom: function (pixelSize) {
        var tilingScheme = _options["tilingScheme"];
        if (tilingScheme.pixelSizes != null) {
          var roundedPixelSize = Math.round(pixelSize),
          levels = tilingScheme.pixelSizes != null ? tilingScheme.pixelSizes.length : tilingScheme.levels;
          for (var i = levels - 1; i >= 0; i--) {
            if (Math.round(tilingScheme.pixelSizes[i]) >= roundedPixelSize) {
              return i;
            }
          }
          return 0;
        } else {
          return Math.max(Math.round(Math.log(tilingScheme.basePixelSize / pixelSize) / Math.log(2)), 0);
        }
      },

      _getWheelCenterAndSize: function () {
        var pixelSize, zoomLevel, scale;
        if (_options["tilingScheme"]) {
          zoomLevel = this._getTiledZoom(_pixelSize) + _wheelLevel;
          pixelSize = this._getTiledPixelSize(zoomLevel);
        } else {
          scale = Math.pow(_wheelZoomFactor, -_wheelLevel);
          pixelSize = _pixelSize * scale;
        }

        var 
        ratio = pixelSize / _pixelSize,
        anchorMapCoord = this._toMap(_anchor),
        centerDelta = [(_center[0] - anchorMapCoord[0]) * ratio, (_center[1] - anchorMapCoord[1]) * ratio],
        scaleCenter = [anchorMapCoord[0] + centerDelta[0], anchorMapCoord[1] + centerDelta[1]];

        return { pixelSize: pixelSize, center: scaleCenter };
      },

      _mouseWheelFinish: function () {
        _wheelTimer = null;

        if (_wheelLevel != 0) {
          var wheelCenterAndSize = this._getWheelCenterAndSize();

          _wheelLevel = 0;

          this._setCenterAndSize(wheelCenterAndSize.center, wheelCenterAndSize.pixelSize, true, true);
        } else {
          this._refresh();
        }
      },

      _panEnd: function () {
        _velocity = [
        (_velocity[0] > 0 ? Math.floor(_velocity[0] * _friction[0]) : Math.ceil(_velocity[0] * _friction[0])),
        (_velocity[1] > 0 ? Math.floor(_velocity[1] * _friction[1]) : Math.ceil(_velocity[1] * _friction[1]))
      ];

        if (Math.abs(_velocity[0]) < 4 && Math.abs(_velocity[1]) < 4) {
          this._panFinalize();
        } else {
          _current = [
          _current[0] + _velocity[0],
          _current[1] + _velocity[1]
        ];

          this._panMove();
          setTimeout($.proxy(this._panEnd, this), 30);
        }
      },

      _panFinalize: function () {
        if (_panning) {
          _velocity = [0, 0];

          var 
          dx = _current[0] - _anchor[0],
          dy = _current[1] - _anchor[1],
          dxMap = -dx * _pixelSize,
          dyMap = dy * _pixelSize;

          this._setCenterAndSize([_center[0] + dxMap, _center[1] + dyMap], _pixelSize, true, true);

          _inOp = false;
          _anchor = _current;
          _toolPan = _panning = false;

          _$eventTarget.css("cursor", _options["cursors"][_options["mode"]]);
        }
      },

      _panMove: function () {
        var 
        dx = _current[0] - _lastDrag[0],
        dy = _current[1] - _lastDrag[1];

        if (_toolPan || dx > 3 || dx < -3 || dy > 3 || dy < -3) {
          if (!_toolPan) {
            _toolPan = true;
            _$eventTarget.css("cursor", _options["cursors"]["pan"]);
          }

          if (_mouseDown) {
            _velocity = [dx, dy];
          }

          if (dx != 0 || dy != 0) {
            _panning = true;
            _lastDrag = _current;

            for (i = 0; i < _options["services"].length; i++) {
              var service = _options["services"][i];
              _options["_serviceTypes"][service.type].interactivePan(this, service, dx, dy);
            }
          }
        }
      },

      _refresh: function () {
        for (var i = 0; i < _options["services"].length; i++) {
          var service = _options["services"][i];
          if (!_mouseDown && _options["_serviceTypes"][service.type] != null) {
            _options["_serviceTypes"][service.type].refresh(this, service);
          }
        }
      },

      _setCenterAndSize: function (center, pixelSize, trigger, refresh) {
        // the final call during any extent change
        if (_pixelSize != pixelSize) {
          for (var i = 0; i < _options["services"].length; i++) {
            var service = _options["services"][i];
            _options["_serviceTypes"][service.type].interactiveScale(this, service, center, pixelSize);
          }
        }

        _center = center;
        _pixelSize = pixelSize;

        if ($.geo.proj) {
          var bbox = this._getBbox();
          bbox = $.geo.proj.toGeodetic([[bbox[0], bbox[1]], [bbox[2], bbox[3]]]);
          bbox = [bbox[0][0], bbox[0][1], bbox[1][0], bbox[1][1]];
          _options["bbox"] = bbox;

          _options["center"] = $.geo.proj.toGeodetic([[_center[0], _center[1]]])[0];
        } else {
          _options["bbox"] = this._getBbox();

          _options["center"] = _center;
        }

        _options["zoom"] = this._getZoom();

        if (trigger) {
          this._trigger("bboxchange", window.event, { bbox: _options["bbox"] });
        }

        if (refresh) {
          this._refresh();
        }
      },

      _toMap: function (p, center, pixelSize) {
        // ignores $.geo.proj
        var isArray = $.isArray(p[0]);
        if (!isArray) {
          p = [p];
        }

        center = center || _center;
        pixelSize = pixelSize || _pixelSize;

        var 
        width = _contentBounds["width"],
        height = _contentBounds["height"],
        halfWidth = width / 2 * pixelSize,
        halfHeight = height / 2 * pixelSize,
        bbox = [center[0] - halfWidth, center[1] - halfHeight, center[0] + halfWidth, center[1] + halfHeight],
        xRatio = $.geo._width(bbox) / width,
        yRatio = $.geo._height(bbox) / height,
        result = [];

        $.each(p, function (i) {
          var yOffset = (this[1] * yRatio);
          result[i] = [bbox[0] + (this[0] * xRatio), bbox[3] - yOffset];
        });

        return isArray ? result : result[0];
      },

      _toPixel: function (p, center, pixelSize) {
        // ignores $.geo.proj
        var isArray = $.isArray(p[0]);
        if (!isArray) {
          p = [p];
        }

        center = center || _center;
        pixelSize = pixelSize || _pixelSize;

        var 
        width = _contentBounds["width"],
        height = _contentBounds["height"],
        halfWidth = width / 2 * pixelSize,
        halfHeight = height / 2 * pixelSize,
        bbox = [center[0] - halfWidth, center[1] - halfHeight, center[0] + halfWidth, center[1] + halfHeight],
        bboxWidth = $.geo._width(bbox),
        bboxHeight = $.geo._height(bbox),
        result = [];

        $.each(p, function (i) {
          result[i] = [
            (this[0] - bbox[0]) * width / bboxWidth,
            (bbox[3] - this[1]) * height / bboxHeight
          ];
        });

        return isArray ? result : result[0];
      },

      _zoomTo: function (coord, zoom, trigger, refresh) {
        zoom = zoom < 0 ? 0 : zoom;

        var tiledPixelSize = this._getTiledPixelSize(zoom);

        if (!isNaN(tiledPixelSize)) {
          this._setCenterAndSize(coord, tiledPixelSize, trigger, refresh);
        } else {
          var 
          bboxMax = $.geo._scaleBy(this._getBboxMax(), 1 / Math.pow(_zoomFactor, zoom)),
          pixelSize = Math.max($.geo._width(bboxMax) / _contentBounds["width"], $.geo._height(bboxMax) / _contentBounds["height"]);

          this._setCenterAndSize(coord, pixelSize, trigger, refresh);
        }
      },

      _eventTarget_dblclick: function (e) {
        this._panFinalize();

        var offset = $(e.currentTarget).offset();

        switch (_options["mode"]) {
          case "pan":
            this._trigger("dblclick", e, { pixels: _current, coordinates: this.toMap(_current) });
            if (!e.isDefaultPrevented()) {
              this._zoomTo(this._toMap(_current), this._getZoom() + 1, true, true);
            }
            break;
        }

        _inOp = false;
      },

      _eventTarget_touchstart: function (e) {
        if (!_supportTouch && e.which != 1) {
          return;
        }

        if (_softDblClick) {
          var downDate = $.now();
          if (downDate - _downDate < 750) {
            if (_isDbltap) {
              _isDbltap = false;
            } else {
              _isDbltap = _isTap;
            }
          } else {
            _isDbltap = false;
          }
          _isTap = true;
          _downDate = downDate;
        }

        e.preventDefault();

        this._panFinalize();
        this._mouseWheelFinish();

        var offset = $(e.currentTarget).offset();

        if (_supportTouch) {
          _current = [e.originalEvent.changedTouches[0].pageX - offset.left, e.originalEvent.changedTouches[0].pageY - offset.top];
        } else {
          _current = [e.pageX - offset.left, e.pageY - offset.top];
        }

        _mouseDown = true;
        _anchor = _current;

        if (!_inOp && e.shiftKey) {
          _shiftZoom = true;
          _$eventTarget.css("cursor", _options["cursors"]["zoom"]);
        } else {
          _inOp = true;
          switch (_options["mode"]) {
            case "pan":
              _lastDrag = _current;

              if (e.currentTarget.setCapture) {
                e.currentTarget.setCapture();
              }
              break;
          }
        }

        return false;
      },

      _dragTarget_touchmove: function (e) {
        var 
        offset = _$eventTarget.offset(),
        current, i, dx, dy;

        if (_supportTouch) {
          current = [e.originalEvent.changedTouches[0].pageX - offset.left, e.originalEvent.changedTouches[0].pageY - offset.top];
        } else {
          current = [e.pageX - offset.left, e.pageY - offset.top];
        }

        if (current[0] == _lastMove[0] && current[1] == _lastMove[1]) {
          return;
        }

        if (_softDblClick) {
          _isDbltap = _isTap = false;
        }

        if (_mouseDown) {
          _current = current;
          _moveDate = $.now();
        }

        var mode = _shiftZoom ? "zoom" : _options["mode"];

        switch (mode) {
          case "pan":
            if (_mouseDown || _toolPan) {
              this._panMove();
            } else {
              this._trigger("move", e, { pixels: current, coordinates: this.toMap(current) });
            }
            break;
        }

        _lastMove = current;
      },

      _dragTarget_touchstop: function (e) {
        if (!_mouseDown && _ieVersion == 7) {
          // ie7 doesn't appear to trigger dblclick on _$eventTarget,
          // we fake regular click here to cause soft dblclick
          this._eventTarget_touchstart(e);
        }

        var 
        mouseWasDown = _mouseDown,
        wasToolPan = _toolPan,
        offset = _$eventTarget.offset(),
        current, i;

        if (_supportTouch) {
          current = [e.originalEvent.changedTouches[0].pageX - offset.left, e.originalEvent.changedTouches[0].pageY - offset.top];
        } else {
          current = [e.pageX - offset.left, e.pageY - offset.top];
        }

        var mode = _shiftZoom ? "zoom" : _options["mode"];

        _$eventTarget.css("cursor", _options["cursors"][mode]);

        _shiftZoom =
        _mouseDown =
        _toolPan = false;

        if (document.releaseCapture) {
          document.releaseCapture();
        }

        if (mouseWasDown) {
          var 
          clickDate = $.now(),
          dx, dy;

          _current = current;

          switch (mode) {
            case "pan":
              if (wasToolPan) {
                this._panEnd();
              } else {
                if (clickDate - _clickDate > 100) {
                  this._trigger("click", e, { pixels: current, coordinates: this.toMap(current) });
                  _inOp = false;
                }
              }
              break;
          }

          _clickDate = clickDate;

          if (_softDblClick && _isDbltap) {
            _isDbltap = _isTap = false;
            _$eventTarget.trigger("dblclick", e);
          }
        }
      },

      _eventTarget_mousewheel: function (e, delta) {
        e.preventDefault();

        this._panFinalize();

        if (_mouseDown) {
          return;
        }

        if (delta != 0) {
          if (_wheelTimer) {
            window.clearTimeout(_wheelTimer);
            _wheelTimer = null;
          } else {
            var offset = $(e.currentTarget).offset();
            _anchor = [e.pageX - offset.left, e.pageY - offset.top];
          }

          _wheelLevel += delta;

          var wheelCenterAndSize = this._getWheelCenterAndSize();

          for (i = 0; i < _options["services"].length; i++) {
            var service = _options["services"][i];
            _options["_serviceTypes"][service.type].interactiveScale(this, service, wheelCenterAndSize.center, wheelCenterAndSize.pixelSize);
          }

          //          if (this._imageShape != null && this._mapShape != null) {
          //            for (var i = 0; i < this._mapShapeCoords.length; i++) {
          //              this._imageShapeCoords[i] = this.toPixelPoint(this._mapShapeCoords[i], scaleCenter, pixelSize);
          //            }

          //            this._redrawShape();

          //            if (this._clickMode == Ag.UI.ClickMode.measureLength || this._clickMode == Ag.UI.ClickMode.measureArea) {
          //              this._labelShape();
          //            }
          //          }

          var that = this;
          _wheelTimer = window.setTimeout(function () {
            that._mouseWheelFinish();
          }, 1000);
        }
        return false;
      }
    };
  })()
  );


})(jQuery);

