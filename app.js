var APIKEY = "";

/*
Eg:
東 NOT 京
	-> Should not return 東京
	-> Implied type 'all' (radical kanji vocabulary)

// Unique keywords
Kanji CONTAINING lion
 	-> Should return all Kanji using the Lion radical
	-> Explicit type kanji
Kanji IN 東京
	-> [k"東", k"京"]

CONTAINING 京

IN 日本製
		NOTE finding voc in voc might be slow
	-> [v"日本製",　v"日本", v"日", v"本", k"日", k"本", k"製", r, r, r, r ...]



Kanji IN 東京 CONTAINING ground

Kanji IN 東京 CONTAINING (ground AND sun)

Kanji IN 東京 CONTAINING ground AND sun

Kanji IN 東京 CONTAINING (ground OR sun)

Kanji IN 東京 CONTAINING ground OR sun

Kanji IN 東京 CONTAINING (ground NOT sun)

Kanji IN 東京 CONTAINING ground NOT sun

Vocabulary part_of_speech (CONTAINING) "noun"

Vocabulary part_of_speech (CONTAINING) "adj?ctive"

condition
 -> not 'conditional' etc

condition*

*/

/** Represents a Radical, Kanji or Vocabulary object
* @interface ISubject
*/

// OO prototype inheritance architecture inspired by Leaflet library
var WK = {};


WK.Util = {
	/** Extends an object or function with the properties of one or more other objects
	* @memberof WK.Util
	* @param {(WK.Class|Object)} dest - The object to modify
	* @param {...Object} - Objects to modify 'dest'
	* @returns {(WK.Class|Object)} The modified object 'dest'
	*/
	extend: function (dest) { // (Object[, Object, ...]) ->
		var sources = Array.prototype.slice.call(arguments, 1),
		    i, j, len, src;
			sources.forEach(function(src){
			src = src || {};
			for (i in src) {
				if (src.hasOwnProperty(i)) {
					dest[i] = src[i];
				}
			}
		}, this);
		return dest;
	}
};

/** Powers the OOP facilities of the library. (Lifted from LeafletJS)
 * Thanks to John Resig and Dean Edwards for inspiration!
 * @constructor WK.Class
 */
WK.Class = function () {};
/** Creates an extension of this class to provide inheritance functonality
* @function WK.Class.extend
* @param {Object} props - Properties and methods to add to new class
* @returns {wk.Class} A new class
* @requires {@link WK.Util}
*/
WK.Class.extend = function (props) {
	// extended class with the new prototype
	// instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype; // Stored by reference
	var proto = new F();					// Makes copy of prototype
	// overwrite 'F' with class constructor function that calls initialize and constructor hooks.
	var NewClass = function () {
		// call the constructor
		if (this.initialize) {
			this.initialize.apply(this, arguments);
		}
		// call all constructor hooks
		if (this._initHooks) {
			this.callInitHooks();
		}
	};
	proto.constructor = NewClass;
	// overwrite the constructed class's prototype with the instance created by the empty function 'F'
	NewClass.prototype = proto;
	// NewClass is now a function that calls the initialize function if found in the in the instance (prototype) and _initHooks if any.
	// NewClass.prototype is a reference to the standard prototype object created when using the 'new' keyword

	//inherit parent's statics
	for (var i in this) {
		if (this.hasOwnProperty(i) && i !== 'prototype') {
			NewClass[i] = this[i];
		}
	}
	// mix static properties into the Class definition
	if (props.statics) {
		WK.Util.extend(NewClass, props.statics);
		delete props.statics;
	}

	// mix includes into the prototype
	if (props.includes) {
		WK.Util.extend.apply(null, [proto].concat(props.includes));
		delete props.includes;
	}

	// merge options
	if (props.options && proto.options) {
		props.options = WK.Util.extend({}, proto.options, props.options);
	}

	// mix given properties into the prototype
	WK.Util.extend(proto, props);

	proto._initHooks = [];

	var parent = this;
	// jshint camelcase: false
	NewClass.__super__ = parent.prototype; // This is not a standard property in Chrome.

	// add method for calling all hooks
	proto.callInitHooks = function () {

		if (this._initHooksCalled) { return; }

		if (parent.prototype.callInitHooks) {
			parent.prototype.callInitHooks.call(this);
		}

		this._initHooksCalled = true;

		for (var i = 0, len = proto._initHooks.length; i < len; i++) {
			proto._initHooks[i].call(this);
		}
	};
	return NewClass;
};

/** Method for adding properties to prototype
* @function L.Class.include
* @param {Object} props - Properties and methods to include in this class's prototype
* @requires {@link WK.Util}
*/
WK.Class.include = function (props) {
	WK.Util.extend(this.prototype, props);
};
/** Merge new default options to the Class
* @function L.Class.mergeOptions
* @param {Object} props - Properties and methods to include in this class's prototype
* @requires {@link WK.Util}
*/
WK.Class.mergeOptions = function (options) {
	WK.Util.extend(this.prototype.options, options);
};
/** Adds a hook method to call when this Class is initialized (in addition to the Class's constructor)
* The functions will be called in this order:
* 1. Inherited Class Hooks, in order of addition.
* 2. Current Class Hooks, in order of addition.
* For example, all hooks for L.Polyline will be called before the hooks for L.Polygon
* @function L.Class.addInitHook
* @param {Function|String} fn - The name of the class method to call when an instance of this Class is created
* @param {...*} [args] - Arguments to call with Class method. Only applied if fn is a string and not an explicitly defined function.
*/
WK.Class.addInitHook = function (fn) { // (Function) || (String, args...)
	var args = Array.prototype.slice.call(arguments, 1);

	var init = typeof fn === 'function' ? fn : function () {
		this[fn].apply(this, args);
	};
	this.prototype._initHooks = this.prototype._initHooks || [];
	this.prototype._initHooks.push(init);
};

WK.Subject = WK.Class.extend({
	// Methods shared by Radicals, Kanji, and Vocabulary
	initialize: function(options){
		this.options = options;
	}
});

WK.Radical = WK.Subject.extend({
	initialize: function(options){
		this.options = options;
	}
});
WK.Kanji = WK.Subject.extend({
	initialize: function(options){
		this.options = options;
	}
};
WK.Vocabulary = WK.Subject.extend({
	initialize: function(options){
		this.options = options;
	}
};


WK.User = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.Assignment = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.ReviewStatistics = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.StudyMaterials = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.Summary = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.Reviews = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.LevelProgressions = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

WK.Resets = WK.Class.extend({
	initialize: function(options){
		this.options = options;
	}
};

$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/subjects?types=vocabulary',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={APIKEY}'},
  success: function (resp){
    console.log(resp);
		var result = {}; var data = {};
		for (r in resp){
			if (r === "data"){
				resp["data"].forEach(function(dataItem, d){
					data["data:"+d] = dataItem;
                });
            }
			else{
				result[r] = resp[r];
            }
        }
		console.table(result);
		console.table(data);
  }
});

$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/subjects/2468',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});

$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/user',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/assignments',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/review_statistics',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/study_materials',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/summary',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/reviews',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/level_progressions',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});
$.ajax({
  type: "GET",
  url:'https://www.wanikani.com/api/v2/resets',
  dataType: 'json',
  async: false,
  headers:{'Authorization': 'Token token={7bf92cf4-f940-4ea3-8948-5b364a257919}'},
  success: function (resp){
    console.table(resp);
  }
});

// filters

/*
 >> searchMe
(3) [{…}, {…}, {…}]
*/
function search(query, by, arr){
	return arr.filter(function(obj){
 		// extremely naive for development, (matches terms exactly) use regex later
		return obj[by] === query;
  });
}
function searchRx(query, by, arr){
	return arr.filter(function(obj){
 		//	return obj[by].indexOf(query) !== -1;
		return obj[by].filter(function(str){
			return str.match(query.replace("*", ".*"));
        }).length > 0;
  });
}
/*
 >> search('blue', 'color', searchMe)
(2) [{…}, {…}]
 0: {name: "Ethan", color: "blue", uid: 1}
 1: {name: "Ryan", color: "blue", uid: 3}
*/

{
  "object": "collection",
  "url": "https://www.wanikani.com/api/v2/subjects?types=vocabulary",
  "pages": {
    "per_page": 1000,
    "next_url": "https://www.wanikani.com/api/v2/subjects?page_after_id=3468&types=vocabulary",
    "previous_url": null
  },
  "total_count": 6287,
  "data_updated_at": "2018-03-08T19:17:29.626803Z",
  "data": [
    {
      "id": 2467,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2467",
      "data_updated_at": "2017-10-18T23:11:29.546718Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:04:47.000000Z",
        "slug": "一",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80",
        "characters": "一",
        "meanings": [
          {
            "meaning": "One",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いち"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          440
        ]
      }
    },
    {
      "id": 2468,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2468",
      "data_updated_at": "2017-10-18T23:11:29.589086Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:10:16.000000Z",
        "slug": "一つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E3%81%A4",
        "characters": "一つ",
        "meanings": [
          {
            "meaning": "One Thing",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひとつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          440
        ]
      }
    },
    {
      "id": 2469,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2469",
      "data_updated_at": "2017-10-18T23:11:28.261070Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:12:25.000000Z",
        "slug": "七",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%83",
        "characters": "七",
        "meanings": [
          {
            "meaning": "Seven",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なな"
          },
          {
            "primary": false,
            "reading": "しち"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          443
        ]
      }
    },
    {
      "id": 2470,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2470",
      "data_updated_at": "2017-10-18T23:11:28.552877Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:12:39.000000Z",
        "slug": "七つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%83%E3%81%A4",
        "characters": "七つ",
        "meanings": [
          {
            "meaning": "Seven Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ななつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          443
        ]
      }
    },
    {
      "id": 2471,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2471",
      "data_updated_at": "2017-10-18T23:11:29.435002Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:13:23.000000Z",
        "slug": "九",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%9D",
        "characters": "九",
        "meanings": [
          {
            "meaning": "Nine",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゅう"
          },
          {
            "primary": false,
            "reading": "く"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          442
        ]
      }
    },
    {
      "id": 2472,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2472",
      "data_updated_at": "2017-10-18T23:11:29.490099Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:13:33.000000Z",
        "slug": "九つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%9D%E3%81%A4",
        "characters": "九つ",
        "meanings": [
          {
            "meaning": "Nine Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ここのつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          442
        ]
      }
    },
    {
      "id": 2473,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2473",
      "data_updated_at": "2017-10-18T23:11:27.273029Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:13:57.000000Z",
        "slug": "二",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C",
        "characters": "二",
        "meanings": [
          {
            "meaning": "Two",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "に"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          441
        ]
      }
    },
    {
      "id": 2474,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2474",
      "data_updated_at": "2017-10-18T23:11:27.847459Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:14:07.000000Z",
        "slug": "二つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E3%81%A4",
        "characters": "二つ",
        "meanings": [
          {
            "meaning": "Two Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふたつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          441
        ]
      }
    },
    {
      "id": 2475,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2475",
      "data_updated_at": "2017-10-18T23:11:29.634307Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:14:35.000000Z",
        "slug": "人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA",
        "characters": "人",
        "meanings": [
          {
            "meaning": "Person",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          444
        ]
      }
    },
    {
      "id": 2476,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2476",
      "data_updated_at": "2017-10-18T23:11:27.925028Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:14:49.000000Z",
        "slug": "二人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E4%BA%BA",
        "characters": "二人",
        "meanings": [
          {
            "meaning": "Two People",
            "primary": true
          },
          {
            "meaning": "Pair",
            "primary": false
          },
          {
            "meaning": "Couple",
            "primary": false
          },
          {
            "meaning": "Two Persons",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふたり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          444,
          441
        ]
      }
    },
    {
      "id": 2477,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2477",
      "data_updated_at": "2017-10-18T23:11:28.932968Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:15:02.000000Z",
        "slug": "一人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E4%BA%BA",
        "characters": "一人",
        "meanings": [
          {
            "meaning": "Alone",
            "primary": true
          },
          {
            "meaning": "One Person",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひとり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          444,
          440
        ]
      }
    },
    {
      "id": 2478,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2478",
      "data_updated_at": "2017-10-18T23:11:28.437674Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:15:23.000000Z",
        "slug": "アメリカ人",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%82%A2%E3%83%A1%E3%83%AA%E3%82%AB%E4%BA%BA",
        "characters": "アメリカ人",
        "meanings": [
          {
            "meaning": "American",
            "primary": true
          },
          {
            "meaning": "American Person",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あめりかじん"
          },
          {
            "primary": false,
            "reading": "アメリカじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          444
        ]
      }
    },
    {
      "id": 2479,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2479",
      "data_updated_at": "2017-10-18T23:11:29.270187Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:15:33.000000Z",
        "slug": "フランス人",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%83%95%E3%83%A9%E3%83%B3%E3%82%B9%E4%BA%BA",
        "characters": "フランス人",
        "meanings": [
          {
            "meaning": "Frenchman",
            "primary": true
          },
          {
            "meaning": "French Person",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふらんすじん"
          },
          {
            "primary": false,
            "reading": "フランスじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          444
        ]
      }
    },
    {
      "id": 2480,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2480",
      "data_updated_at": "2017-10-18T23:11:29.810394Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:15:42.000000Z",
        "slug": "入る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E3%82%8B",
        "characters": "入る",
        "meanings": [
          {
            "meaning": "To Enter",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はいる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          445
        ]
      }
    },
    {
      "id": 2481,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2481",
      "data_updated_at": "2017-10-18T23:11:27.604706Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:15:53.000000Z",
        "slug": "入れる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E3%82%8C%E3%82%8B",
        "characters": "入れる",
        "meanings": [
          {
            "meaning": "To Insert",
            "primary": true
          },
          {
            "meaning": "To Put In",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いれる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          445
        ]
      }
    },
    {
      "id": 2482,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2482",
      "data_updated_at": "2017-10-18T23:11:29.099244Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:16:01.000000Z",
        "slug": "八",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AB",
        "characters": "八",
        "meanings": [
          {
            "meaning": "Eight",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はち"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          446
        ]
      }
    },
    {
      "id": 2483,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2483",
      "data_updated_at": "2017-10-18T23:11:29.151164Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:16:10.000000Z",
        "slug": "八つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AB%E3%81%A4",
        "characters": "八つ",
        "meanings": [
          {
            "meaning": "Eight Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やっつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          446
        ]
      }
    },
    {
      "id": 2484,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2484",
      "data_updated_at": "2017-10-18T23:11:29.702776Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:16:19.000000Z",
        "slug": "力",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%9B",
        "characters": "力",
        "meanings": [
          {
            "meaning": "Power",
            "primary": true
          },
          {
            "meaning": "Strength",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちから"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          447
        ]
      }
    },
    {
      "id": 2485,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2485",
      "data_updated_at": "2017-10-18T23:11:27.489554Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:16:46.000000Z",
        "slug": "十",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%81",
        "characters": "十",
        "meanings": [
          {
            "meaning": "Ten",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅう"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          448
        ]
      }
    },
    {
      "id": 2486,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2486",
      "data_updated_at": "2017-10-18T23:11:27.708545Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:16:57.000000Z",
        "slug": "三",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%89",
        "characters": "三",
        "meanings": [
          {
            "meaning": "Three",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さん"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          449
        ]
      }
    },
    {
      "id": 2487,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2487",
      "data_updated_at": "2017-10-18T23:11:29.770005Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:06.000000Z",
        "slug": "三つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%89%E3%81%A4",
        "characters": "三つ",
        "meanings": [
          {
            "meaning": "Three Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みっつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          449
        ]
      }
    },
    {
      "id": 2488,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2488",
      "data_updated_at": "2017-10-18T23:11:28.343700Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:14.000000Z",
        "slug": "三人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%89%E4%BA%BA",
        "characters": "三人",
        "meanings": [
          {
            "meaning": "Three People",
            "primary": true
          },
          {
            "meaning": "Three Persons",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さんにん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          449,
          444
        ]
      }
    },
    {
      "id": 2489,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2489",
      "data_updated_at": "2017-10-18T23:11:30.036554Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:22.000000Z",
        "slug": "上",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8A",
        "characters": "上",
        "meanings": [
          {
            "meaning": "Up",
            "primary": true
          },
          {
            "meaning": "Above",
            "primary": false
          },
          {
            "meaning": "Over",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うえ"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun",
          "suffix",
          "no_adjective"
        ],
        "component_subject_ids": [
          450
        ]
      }
    },
    {
      "id": 2490,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2490",
      "data_updated_at": "2017-10-18T23:11:29.983981Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:31.000000Z",
        "slug": "上げる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8A%E3%81%92%E3%82%8B",
        "characters": "上げる",
        "meanings": [
          {
            "meaning": "To Raise",
            "primary": true
          },
          {
            "meaning": "To Raise Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あげる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          450
        ]
      }
    },
    {
      "id": 2491,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2491",
      "data_updated_at": "2017-10-18T23:11:28.814204Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:38.000000Z",
        "slug": "上がる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8A%E3%81%8C%E3%82%8B",
        "characters": "上がる",
        "meanings": [
          {
            "meaning": "To Rise",
            "primary": true
          },
          {
            "meaning": "To Go Up",
            "primary": false
          },
          {
            "meaning": "To Be Raised",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あがる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          450
        ]
      }
    },
    {
      "id": 2492,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2492",
      "data_updated_at": "2017-10-18T23:11:28.761062Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:49.000000Z",
        "slug": "上る",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8A%E3%82%8B",
        "characters": "上る",
        "meanings": [
          {
            "meaning": "To Climb",
            "primary": true
          },
          {
            "meaning": "To Go Up",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のぼる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          450
        ]
      }
    },
    {
      "id": 2493,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2493",
      "data_updated_at": "2017-10-18T23:11:27.768963Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:17:58.000000Z",
        "slug": "下",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B",
        "characters": "下",
        "meanings": [
          {
            "meaning": "Down",
            "primary": true
          },
          {
            "meaning": "Below",
            "primary": false
          },
          {
            "meaning": "Under",
            "primary": false
          },
          {
            "meaning": "Beneath",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "した"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          451
        ]
      }
    },
    {
      "id": 2494,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2494",
      "data_updated_at": "2017-10-18T23:11:29.852357Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:18:06.000000Z",
        "slug": "下がる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B%E3%81%8C%E3%82%8B",
        "characters": "下がる",
        "meanings": [
          {
            "meaning": "To Get Lower",
            "primary": true
          },
          {
            "meaning": "To Fall",
            "primary": false
          },
          {
            "meaning": "To Drop",
            "primary": false
          },
          {
            "meaning": "To Come Down",
            "primary": false
          },
          {
            "meaning": "To Hang Down",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さがる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          451
        ]
      }
    },
    {
      "id": 2495,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2495",
      "data_updated_at": "2017-10-18T23:11:29.903779Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:18:34.000000Z",
        "slug": "下げる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B%E3%81%92%E3%82%8B",
        "characters": "下げる",
        "meanings": [
          {
            "meaning": "To Lower",
            "primary": true
          },
          {
            "meaning": "To Hang",
            "primary": false
          },
          {
            "meaning": "To Lower Something",
            "primary": false
          },
          {
            "meaning": "To Hang Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さげる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          451
        ]
      }
    },
    {
      "id": 2496,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2496",
      "data_updated_at": "2017-10-18T23:11:27.360558Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:18:43.000000Z",
        "slug": "下さい",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B%E3%81%95%E3%81%84",
        "characters": "下さい",
        "meanings": [
          {
            "meaning": "Please Give Me",
            "primary": true
          },
          {
            "meaning": "Please",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ください"
          }
        ],
        "parts_of_speech": [
          "expression"
        ],
        "component_subject_ids": [
          451
        ]
      }
    },
    {
      "id": 2497,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2497",
      "data_updated_at": "2017-10-18T23:11:28.618043Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:19:11.000000Z",
        "slug": "口",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%A3",
        "characters": "口",
        "meanings": [
          {
            "meaning": "Mouth",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          452
        ]
      }
    },
    {
      "id": 2498,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2498",
      "data_updated_at": "2017-10-18T23:11:29.210297Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:19:19.000000Z",
        "slug": "入り口",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E3%82%8A%E5%8F%A3",
        "characters": "入り口",
        "meanings": [
          {
            "meaning": "Entrance",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いりぐち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          452,
          445
        ]
      }
    },
    {
      "id": 2499,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2499",
      "data_updated_at": "2017-10-18T23:11:28.992670Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:19:28.000000Z",
        "slug": "大きい",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E3%81%8D%E3%81%84",
        "characters": "大きい",
        "meanings": [
          {
            "meaning": "Big",
            "primary": true
          },
          {
            "meaning": "Large",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おおきい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          453
        ]
      }
    },
    {
      "id": 2500,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2500",
      "data_updated_at": "2017-10-18T23:11:28.188999Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:19:38.000000Z",
        "slug": "大きさ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E3%81%8D%E3%81%95",
        "characters": "大きさ",
        "meanings": [
          {
            "meaning": "Size",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おおきさ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          453
        ]
      }
    },
    {
      "id": 2501,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2501",
      "data_updated_at": "2017-10-18T23:11:29.044836Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:19:47.000000Z",
        "slug": "大した",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E3%81%97%E3%81%9F",
        "characters": "大した",
        "meanings": [
          {
            "meaning": "Considerable",
            "primary": true
          },
          {
            "meaning": "Great",
            "primary": false
          },
          {
            "meaning": "Important",
            "primary": false
          },
          {
            "meaning": "Big Deal",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいした"
          }
        ],
        "parts_of_speech": [
          "adjective"
        ],
        "component_subject_ids": [
          453
        ]
      }
    },
    {
      "id": 2502,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2502",
      "data_updated_at": "2017-10-18T23:11:28.875554Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:19:56.000000Z",
        "slug": "大人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E4%BA%BA",
        "characters": "大人",
        "meanings": [
          {
            "meaning": "Adult",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おとな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          453,
          444
        ]
      }
    },
    {
      "id": 2503,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2503",
      "data_updated_at": "2017-10-18T23:11:28.041630Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:20:08.000000Z",
        "slug": "女",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A5%B3",
        "characters": "女",
        "meanings": [
          {
            "meaning": "Woman",
            "primary": true
          },
          {
            "meaning": "Female",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おんな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          454
        ]
      }
    },
    {
      "id": 2504,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2504",
      "data_updated_at": "2017-10-18T23:11:29.313184Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:20:18.000000Z",
        "slug": "山",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B1%B1",
        "characters": "山",
        "meanings": [
          {
            "meaning": "Mountain",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          455
        ]
      }
    },
    {
      "id": 2505,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2505",
      "data_updated_at": "2017-10-18T23:11:29.380542Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:20:27.000000Z",
        "slug": "ふじ山",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%B5%E3%81%98%E5%B1%B1",
        "characters": "ふじ山",
        "meanings": [
          {
            "meaning": "Mt Fuji",
            "primary": true
          },
          {
            "meaning": "Mount Fuji",
            "primary": false
          },
          {
            "meaning": "Mt. Fuji",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふじさん"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          455
        ]
      }
    },
    {
      "id": 2506,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2506",
      "data_updated_at": "2017-10-18T23:11:28.112662Z",
      "data": {
        "level": 1,
        "created_at": "2012-02-28T08:20:36.000000Z",
        "slug": "川",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%9D",
        "characters": "川",
        "meanings": [
          {
            "meaning": "River",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かわ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          456
        ]
      }
    },
    {
      "id": 2507,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2507",
      "data_updated_at": "2017-10-18T23:11:30.293349Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T01:38:56.000000Z",
        "slug": "刀",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%80",
        "characters": "刀",
        "meanings": [
          {
            "meaning": "Sword",
            "primary": true
          },
          {
            "meaning": "Katana",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かたな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          458
        ]
      }
    },
    {
      "id": 2508,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2508",
      "data_updated_at": "2017-10-18T23:11:32.871484Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:34:08.000000Z",
        "slug": "土",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%9F",
        "characters": "土",
        "meanings": [
          {
            "meaning": "Soil",
            "primary": true
          },
          {
            "meaning": "Earth",
            "primary": false
          },
          {
            "meaning": "Ground",
            "primary": false
          },
          {
            "meaning": "Dirt",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          459
        ]
      }
    },
    {
      "id": 2509,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2509",
      "data_updated_at": "2017-10-18T23:11:30.871273Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:34:35.000000Z",
        "slug": "千",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%83",
        "characters": "千",
        "meanings": [
          {
            "meaning": "Thousand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せん"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          460
        ]
      }
    },
    {
      "id": 2510,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2510",
      "data_updated_at": "2017-10-18T23:11:30.819871Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:34:46.000000Z",
        "slug": "一千",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E5%8D%83",
        "characters": "一千",
        "meanings": [
          {
            "meaning": "One Thousand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いっせん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          460,
          440
        ]
      }
    },
    {
      "id": 2511,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2511",
      "data_updated_at": "2017-10-18T23:11:32.693546Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:34:57.000000Z",
        "slug": "夕べ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%95%E3%81%B9",
        "characters": "夕べ",
        "meanings": [
          {
            "meaning": "Evening",
            "primary": true
          },
          {
            "meaning": "Last Night",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆうべ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          461
        ]
      }
    },
    {
      "id": 2512,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2512",
      "data_updated_at": "2017-10-18T23:11:34.967156Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:35:07.000000Z",
        "slug": "女の子",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A5%B3%E3%81%AE%E5%AD%90",
        "characters": "女の子",
        "meanings": [
          {
            "meaning": "Young Lady",
            "primary": true
          },
          {
            "meaning": "Young Woman",
            "primary": false
          },
          {
            "meaning": "Young Girl",
            "primary": false
          },
          {
            "meaning": "Girl",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おんなのこ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          462,
          454
        ]
      }
    },
    {
      "id": 2513,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2513",
      "data_updated_at": "2017-10-18T23:11:33.051954Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:35:15.000000Z",
        "slug": "子",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%90",
        "characters": "子",
        "meanings": [
          {
            "meaning": "Kid",
            "primary": true
          },
          {
            "meaning": "Child",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          462
        ]
      }
    },
    {
      "id": 2514,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2514",
      "data_updated_at": "2017-10-18T23:11:32.656332Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:35:23.000000Z",
        "slug": "女子",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A5%B3%E5%AD%90",
        "characters": "女子",
        "meanings": [
          {
            "meaning": "Girl",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          462,
          454
        ]
      }
    },
    {
      "id": 2515,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2515",
      "data_updated_at": "2017-10-18T23:11:33.099633Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:35:34.000000Z",
        "slug": "小さい",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%8F%E3%81%95%E3%81%84",
        "characters": "小さい",
        "meanings": [
          {
            "meaning": "Small",
            "primary": true
          },
          {
            "meaning": "Little",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちいさい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          463
        ]
      }
    },
    {
      "id": 2516,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2516",
      "data_updated_at": "2017-10-18T23:11:33.637203Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:35:42.000000Z",
        "slug": "又",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%88",
        "characters": "又",
        "meanings": [
          {
            "meaning": "Again",
            "primary": true
          },
          {
            "meaning": "And",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "また"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "prefix"
        ],
        "component_subject_ids": [
          466
        ]
      }
    },
    {
      "id": 2517,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2517",
      "data_updated_at": "2017-10-18T23:11:31.321012Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:37:06.000000Z",
        "slug": "丸",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%B8",
        "characters": "丸",
        "meanings": [
          {
            "meaning": "Circle",
            "primary": true
          },
          {
            "meaning": "Round",
            "primary": false
          },
          {
            "meaning": "Circular",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まる"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          467
        ]
      }
    },
    {
      "id": 2518,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2518",
      "data_updated_at": "2017-10-18T23:11:31.113194Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:37:19.000000Z",
        "slug": "丸い",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%B8%E3%81%84",
        "characters": "丸い",
        "meanings": [
          {
            "meaning": "Circular",
            "primary": true
          },
          {
            "meaning": "Round",
            "primary": false
          },
          {
            "meaning": "Spherical",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まるい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          467
        ]
      }
    },
    {
      "id": 2519,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2519",
      "data_updated_at": "2017-10-18T23:11:34.573771Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:37:27.000000Z",
        "slug": "〜才",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E6%89%8D",
        "characters": "〜才",
        "meanings": [
          {
            "meaning": "Years Old",
            "primary": true
          },
          {
            "meaning": "Age",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さい"
          }
        ],
        "parts_of_speech": [
          "suffix"
        ],
        "component_subject_ids": [
          468
        ]
      }
    },
    {
      "id": 2520,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2520",
      "data_updated_at": "2017-10-18T23:11:31.371344Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:37:35.000000Z",
        "slug": "中",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD",
        "characters": "中",
        "meanings": [
          {
            "meaning": "Middle",
            "primary": true
          },
          {
            "meaning": "In",
            "primary": false
          },
          {
            "meaning": "Inside",
            "primary": false
          },
          {
            "meaning": "Center",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          469
        ]
      }
    },
    {
      "id": 2521,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2521",
      "data_updated_at": "2017-10-18T23:11:31.192648Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:37:41.000000Z",
        "slug": "中々",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E3%80%85",
        "characters": "中々",
        "meanings": [
          {
            "meaning": "Very",
            "primary": true
          },
          {
            "meaning": "Considerably",
            "primary": false
          },
          {
            "meaning": "Quite",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なかなか"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          856,
          469
        ]
      }
    },
    {
      "id": 2522,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2522",
      "data_updated_at": "2018-01-15T20:29:29.318002Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:37:58.000000Z",
        "slug": "五月",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94%E6%9C%88",
        "characters": "五月",
        "meanings": [
          {
            "meaning": "May",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          477,
          470
        ]
      }
    },
    {
      "id": 2523,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2523",
      "data_updated_at": "2017-10-18T23:11:32.915927Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:38:25.000000Z",
        "slug": "五日",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94%E6%97%A5",
        "characters": "五日",
        "meanings": [
          {
            "meaning": "Fifth Day",
            "primary": true
          },
          {
            "meaning": "Day Five",
            "primary": false
          },
          {
            "meaning": "Five Days",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いつか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          476,
          470
        ]
      }
    },
    {
      "id": 2524,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2524",
      "data_updated_at": "2017-10-18T23:11:31.425185Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:38:51.000000Z",
        "slug": "五十",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94%E5%8D%81",
        "characters": "五十",
        "meanings": [
          {
            "meaning": "Fifty",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごじゅう"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          470,
          448
        ]
      }
    },
    {
      "id": 2525,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2525",
      "data_updated_at": "2017-10-18T23:11:34.083731Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:39:00.000000Z",
        "slug": "五つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94%E3%81%A4",
        "characters": "五つ",
        "meanings": [
          {
            "meaning": "Five Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いつつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          470
        ]
      }
    },
    {
      "id": 2526,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2526",
      "data_updated_at": "2017-10-18T23:11:34.037754Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:39:13.000000Z",
        "slug": "五",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94",
        "characters": "五",
        "meanings": [
          {
            "meaning": "Five",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ご"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          470
        ]
      }
    },
    {
      "id": 2527,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2527",
      "data_updated_at": "2017-10-18T23:11:31.064521Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:39:21.000000Z",
        "slug": "六つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AD%E3%81%A4",
        "characters": "六つ",
        "meanings": [
          {
            "meaning": "Six Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むっつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          471
        ]
      }
    },
    {
      "id": 2528,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2528",
      "data_updated_at": "2017-10-18T23:11:31.252681Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:39:31.000000Z",
        "slug": "六月",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AD%E6%9C%88",
        "characters": "六月",
        "meanings": [
          {
            "meaning": "June",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ろくがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          477,
          471
        ]
      }
    },
    {
      "id": 2529,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2529",
      "data_updated_at": "2017-10-18T23:11:34.765921Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:39:41.000000Z",
        "slug": "六日",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AD%E6%97%A5",
        "characters": "六日",
        "meanings": [
          {
            "meaning": "Sixth Day",
            "primary": true
          },
          {
            "meaning": "Day Six",
            "primary": false
          },
          {
            "meaning": "Six Days",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むいか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          476,
          471
        ]
      }
    },
    {
      "id": 2530,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2530",
      "data_updated_at": "2017-12-27T18:54:58.851311Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:39:55.000000Z",
        "slug": "十六",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%81%E5%85%AD",
        "characters": "十六",
        "meanings": [
          {
            "meaning": "Sixteen",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうろく"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          471,
          448
        ]
      }
    },
    {
      "id": 2531,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2531",
      "data_updated_at": "2017-10-18T23:11:30.087779Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:40:03.000000Z",
        "slug": "六",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AD",
        "characters": "六",
        "meanings": [
          {
            "meaning": "Six",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ろく"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          471
        ]
      }
    },
    {
      "id": 2532,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2532",
      "data_updated_at": "2017-10-18T23:11:33.972127Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:40:19.000000Z",
        "slug": "円",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%86%86",
        "characters": "円",
        "meanings": [
          {
            "meaning": "Money",
            "primary": true
          },
          {
            "meaning": "Yen",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "えん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          472
        ]
      }
    },
    {
      "id": 2533,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2533",
      "data_updated_at": "2017-10-18T23:11:30.967407Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:40:31.000000Z",
        "slug": "千円",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%83%E5%86%86",
        "characters": "千円",
        "meanings": [
          {
            "meaning": "1000 Yen",
            "primary": true
          },
          {
            "meaning": "One Thousand Yen",
            "primary": false
          },
          {
            "meaning": "A Thousand Yen",
            "primary": false
          },
          {
            "meaning": "Thousand Yen",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんえん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          472,
          460
        ]
      }
    },
    {
      "id": 2534,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2534",
      "data_updated_at": "2017-10-18T23:11:34.528151Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:40:56.000000Z",
        "slug": "円い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%86%86%E3%81%84",
        "characters": "円い",
        "meanings": [
          {
            "meaning": "Round",
            "primary": true
          },
          {
            "meaning": "Circular",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まるい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          472
        ]
      }
    },
    {
      "id": 2535,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2535",
      "data_updated_at": "2017-10-18T23:11:32.015440Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:41:05.000000Z",
        "slug": "天",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A9",
        "characters": "天",
        "meanings": [
          {
            "meaning": "Heaven",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          473
        ]
      }
    },
    {
      "id": 2536,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2536",
      "data_updated_at": "2017-10-18T23:11:30.353348Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:41:25.000000Z",
        "slug": "天才",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A9%E6%89%8D",
        "characters": "天才",
        "meanings": [
          {
            "meaning": "Genius",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てんさい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          473,
          468
        ]
      }
    },
    {
      "id": 2537,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2537",
      "data_updated_at": "2017-10-18T23:11:34.492123Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:42:30.000000Z",
        "slug": "手",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%89%8B",
        "characters": "手",
        "meanings": [
          {
            "meaning": "Hand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "て"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          474
        ]
      }
    },
    {
      "id": 2538,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2538",
      "data_updated_at": "2017-10-18T23:11:32.062094Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:42:38.000000Z",
        "slug": "下手",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B%E6%89%8B",
        "characters": "下手",
        "meanings": [
          {
            "meaning": "Unskillful",
            "primary": true
          },
          {
            "meaning": "Unskilled",
            "primary": false
          },
          {
            "meaning": "Bad At",
            "primary": false
          },
          {
            "meaning": "Not Good At",
            "primary": false
          },
          {
            "meaning": "Not Skilled",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へた"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          474,
          451
        ]
      }
    },
    {
      "id": 2539,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2539",
      "data_updated_at": "2017-10-18T23:11:31.968463Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:42:46.000000Z",
        "slug": "上手",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8A%E6%89%8B",
        "characters": "上手",
        "meanings": [
          {
            "meaning": "Good At",
            "primary": true
          },
          {
            "meaning": "Skillful",
            "primary": false
          },
          {
            "meaning": "Skilled At",
            "primary": false
          },
          {
            "meaning": "Skilled",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょうず"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          474,
          450
        ]
      }
    },
    {
      "id": 2540,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2540",
      "data_updated_at": "2017-10-18T23:11:32.111592Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:42:54.000000Z",
        "slug": "文",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%87",
        "characters": "文",
        "meanings": [
          {
            "meaning": "Writing",
            "primary": true
          },
          {
            "meaning": "Sentence",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぶん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          475
        ]
      }
    },
    {
      "id": 2541,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2541",
      "data_updated_at": "2017-10-18T23:11:32.740528Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:43:02.000000Z",
        "slug": "日",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A5",
        "characters": "日",
        "meanings": [
          {
            "meaning": "Sun",
            "primary": true
          },
          {
            "meaning": "Day",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          476
        ]
      }
    },
    {
      "id": 2542,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2542",
      "data_updated_at": "2017-10-18T23:11:32.269984Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:43:10.000000Z",
        "slug": "月",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%88",
        "characters": "月",
        "meanings": [
          {
            "meaning": "Moon",
            "primary": true
          },
          {
            "meaning": "Month",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          477
        ]
      }
    },
    {
      "id": 2543,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2543",
      "data_updated_at": "2017-10-18T23:11:34.171931Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:43:23.000000Z",
        "slug": "十月",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%81%E6%9C%88",
        "characters": "十月",
        "meanings": [
          {
            "meaning": "October",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          477,
          448
        ]
      }
    },
    {
      "id": 2544,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2544",
      "data_updated_at": "2017-10-18T23:11:31.885229Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:44:13.000000Z",
        "slug": "一月",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%9C%88",
        "characters": "一月",
        "meanings": [
          {
            "meaning": "January",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          477,
          440
        ]
      }
    },
    {
      "id": 2545,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2545",
      "data_updated_at": "2017-10-18T23:11:33.594225Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:44:20.000000Z",
        "slug": "二月",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E6%9C%88",
        "characters": "二月",
        "meanings": [
          {
            "meaning": "February",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          477,
          441
        ]
      }
    },
    {
      "id": 2546,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2546",
      "data_updated_at": "2017-10-18T23:11:32.210957Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:44:29.000000Z",
        "slug": "木",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%A8",
        "characters": "木",
        "meanings": [
          {
            "meaning": "Tree",
            "primary": true
          },
          {
            "meaning": "Wood",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "き"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          478
        ]
      }
    },
    {
      "id": 2547,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2547",
      "data_updated_at": "2017-10-18T23:11:32.476374Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:44:38.000000Z",
        "slug": "水",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%B4",
        "characters": "水",
        "meanings": [
          {
            "meaning": "Water",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みず"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          479
        ]
      }
    },
    {
      "id": 2548,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2548",
      "data_updated_at": "2018-01-15T20:28:26.555285Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:44:54.000000Z",
        "slug": "火",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%81%AB",
        "characters": "火",
        "meanings": [
          {
            "meaning": "Fire",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          480
        ]
      }
    },
    {
      "id": 2549,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2549",
      "data_updated_at": "2017-11-01T23:13:53.859747Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:03.000000Z",
        "slug": "火山",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%81%AB%E5%B1%B1",
        "characters": "火山",
        "meanings": [
          {
            "meaning": "Volcano",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かざん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          480,
          455
        ]
      }
    },
    {
      "id": 2550,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2550",
      "data_updated_at": "2017-10-30T18:35:13.969324Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:14.000000Z",
        "slug": "犬",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%8A%AC",
        "characters": "犬",
        "meanings": [
          {
            "meaning": "Dog",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いぬ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          481
        ]
      }
    },
    {
      "id": 2551,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2551",
      "data_updated_at": "2017-10-18T23:11:31.840987Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:23.000000Z",
        "slug": "子犬",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%90%E7%8A%AC",
        "characters": "子犬",
        "meanings": [
          {
            "meaning": "Puppy",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こいぬ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          481,
          462
        ]
      }
    },
    {
      "id": 2552,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2552",
      "data_updated_at": "2017-10-18T23:11:30.414546Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:31.000000Z",
        "slug": "王",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%8E%8B",
        "characters": "王",
        "meanings": [
          {
            "meaning": "King",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          482
        ]
      }
    },
    {
      "id": 2553,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2553",
      "data_updated_at": "2017-10-18T23:11:30.920572Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:39.000000Z",
        "slug": "王子",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%8E%8B%E5%AD%90",
        "characters": "王子",
        "meanings": [
          {
            "meaning": "Prince",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おうじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          482,
          462
        ]
      }
    },
    {
      "id": 2554,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2554",
      "data_updated_at": "2017-10-18T23:11:34.346469Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:46.000000Z",
        "slug": "女王",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A5%B3%E7%8E%8B",
        "characters": "女王",
        "meanings": [
          {
            "meaning": "Queen",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょおう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          482,
          454
        ]
      }
    },
    {
      "id": 2555,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2555",
      "data_updated_at": "2017-10-18T23:11:32.833186Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:45:56.000000Z",
        "slug": "王女",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%8E%8B%E5%A5%B3",
        "characters": "王女",
        "meanings": [
          {
            "meaning": "Princess",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おうじょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          482,
          454
        ]
      }
    },
    {
      "id": 2556,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2556",
      "data_updated_at": "2017-10-18T23:11:31.485213Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:46:19.000000Z",
        "slug": "出す",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E3%81%99",
        "characters": "出す",
        "meanings": [
          {
            "meaning": "To Remove",
            "primary": true
          },
          {
            "meaning": "To Hand Over",
            "primary": false
          },
          {
            "meaning": "To Take Out",
            "primary": false
          },
          {
            "meaning": "To Reveal",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          483
        ]
      }
    },
    {
      "id": 2557,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2557",
      "data_updated_at": "2017-12-15T20:04:12.553797Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:46:27.000000Z",
        "slug": "出る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E3%82%8B",
        "characters": "出る",
        "meanings": [
          {
            "meaning": "To Exit",
            "primary": true
          },
          {
            "meaning": "To Leave",
            "primary": false
          },
          {
            "meaning": "To Attend",
            "primary": false
          },
          {
            "meaning": "To Come Out",
            "primary": false
          },
          {
            "meaning": "To Go Out",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          483
        ]
      }
    },
    {
      "id": 2558,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2558",
      "data_updated_at": "2017-10-18T23:11:33.768822Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:46:43.000000Z",
        "slug": "出口",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E5%8F%A3",
        "characters": "出口",
        "meanings": [
          {
            "meaning": "Exit",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でぐち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          483,
          452
        ]
      }
    },
    {
      "id": 2559,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2559",
      "data_updated_at": "2017-10-18T23:11:31.706102Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:46:51.000000Z",
        "slug": "右",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%B3",
        "characters": "右",
        "meanings": [
          {
            "meaning": "Right Direction",
            "primary": true
          },
          {
            "meaning": "Right",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みぎ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          484
        ]
      }
    },
    {
      "id": 2560,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2560",
      "data_updated_at": "2017-10-18T23:11:34.436276Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:47:19.000000Z",
        "slug": "右手",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%B3%E6%89%8B",
        "characters": "右手",
        "meanings": [
          {
            "meaning": "Right Hand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みぎて"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          484,
          474
        ]
      }
    },
    {
      "id": 2561,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2561",
      "data_updated_at": "2017-10-18T23:11:31.592426Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:47:27.000000Z",
        "slug": "四",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B",
        "characters": "四",
        "meanings": [
          {
            "meaning": "Four",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よん"
          },
          {
            "primary": false,
            "reading": "し"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          485
        ]
      }
    },
    {
      "id": 2562,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2562",
      "data_updated_at": "2017-10-18T23:11:33.540669Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:47:34.000000Z",
        "slug": "四月",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E6%9C%88",
        "characters": "四月",
        "meanings": [
          {
            "meaning": "April",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          485,
          477
        ]
      }
    },
    {
      "id": 2563,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2563",
      "data_updated_at": "2017-10-18T23:11:34.226897Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:47:46.000000Z",
        "slug": "四日",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E6%97%A5",
        "characters": "四日",
        "meanings": [
          {
            "meaning": "Fourth Day",
            "primary": true
          },
          {
            "meaning": "Day Four",
            "primary": false
          },
          {
            "meaning": "Four Days",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よっか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          485,
          476
        ]
      }
    },
    {
      "id": 2564,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2564",
      "data_updated_at": "2017-10-18T23:11:34.388597Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:47:56.000000Z",
        "slug": "四つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E3%81%A4",
        "characters": "四つ",
        "meanings": [
          {
            "meaning": "Four Things",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よっつ"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          485
        ]
      }
    },
    {
      "id": 2565,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2565",
      "data_updated_at": "2017-10-18T23:11:31.655851Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:48:03.000000Z",
        "slug": "四千",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E5%8D%83",
        "characters": "四千",
        "meanings": [
          {
            "meaning": "Four Thousand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よんせん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          485,
          460
        ]
      }
    },
    {
      "id": 2566,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2566",
      "data_updated_at": "2017-10-18T23:11:31.018279Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:48:18.000000Z",
        "slug": "四十",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E5%8D%81",
        "characters": "四十",
        "meanings": [
          {
            "meaning": "Forty",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よんじゅう"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          485,
          448
        ]
      }
    },
    {
      "id": 2567,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2567",
      "data_updated_at": "2017-10-18T23:11:30.767966Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:48:32.000000Z",
        "slug": "左",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A6",
        "characters": "左",
        "meanings": [
          {
            "meaning": "Left Direction",
            "primary": true
          },
          {
            "meaning": "Left",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひだり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          486
        ]
      }
    },
    {
      "id": 2568,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2568",
      "data_updated_at": "2017-10-18T23:11:30.726096Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:48:40.000000Z",
        "slug": "左手",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A6%E6%89%8B",
        "characters": "左手",
        "meanings": [
          {
            "meaning": "Left Hand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひだりて"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          486,
          474
        ]
      }
    },
    {
      "id": 2569,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2569",
      "data_updated_at": "2017-10-18T23:11:32.166072Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:03.000000Z",
        "slug": "本",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AC",
        "characters": "本",
        "meanings": [
          {
            "meaning": "Book",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          487
        ]
      }
    },
    {
      "id": 2570,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2570",
      "data_updated_at": "2017-10-18T23:11:34.639203Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:10.000000Z",
        "slug": "日本",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A5%E6%9C%AC",
        "characters": "日本",
        "meanings": [
          {
            "meaning": "Japan",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にほん"
          },
          {
            "primary": false,
            "reading": "にっぽん"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          487,
          476
        ]
      }
    },
    {
      "id": 2571,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2571",
      "data_updated_at": "2017-12-28T19:11:05.320117Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:20.000000Z",
        "slug": "正しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A3%E3%81%97%E3%81%84",
        "characters": "正しい",
        "meanings": [
          {
            "meaning": "Correct",
            "primary": true
          },
          {
            "meaning": "True",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ただしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          488
        ]
      }
    },
    {
      "id": 2572,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2572",
      "data_updated_at": "2017-10-18T23:11:32.530949Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:28.000000Z",
        "slug": "正す",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A3%E3%81%99",
        "characters": "正す",
        "meanings": [
          {
            "meaning": "To Correct",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ただす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          488
        ]
      }
    },
    {
      "id": 2573,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2573",
      "data_updated_at": "2017-10-18T23:11:30.576145Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:39.000000Z",
        "slug": "玉",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%8E%89",
        "characters": "玉",
        "meanings": [
          {
            "meaning": "Ball",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          489
        ]
      }
    },
    {
      "id": 2574,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2574",
      "data_updated_at": "2017-10-18T23:11:32.607110Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:48.000000Z",
        "slug": "ビー玉",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%83%93%E3%83%BC%E7%8E%89",
        "characters": "ビー玉",
        "meanings": [
          {
            "meaning": "Marble",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びーだま"
          },
          {
            "primary": false,
            "reading": "ビーだま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          489
        ]
      }
    },
    {
      "id": 2575,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2575",
      "data_updated_at": "2017-10-18T23:11:34.276320Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:49:56.000000Z",
        "slug": "玉ねぎ",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%8E%89%E3%81%AD%E3%81%8E",
        "characters": "玉ねぎ",
        "meanings": [
          {
            "meaning": "Onion",
            "primary": true
          },
          {
            "meaning": "Round Onion",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たまねぎ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          489
        ]
      }
    },
    {
      "id": 2576,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2576",
      "data_updated_at": "2017-10-18T23:11:39.009604Z",
      "data": {
        "level": 3,
        "created_at": "2012-02-29T07:50:04.000000Z",
        "slug": "生まれる",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%9F%E3%81%BE%E3%82%8C%E3%82%8B",
        "characters": "生まれる",
        "meanings": [
          {
            "meaning": "To Be Born",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うまれる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          850
        ]
      }
    },
    {
      "id": 2577,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2577",
      "data_updated_at": "2017-10-18T23:11:37.464903Z",
      "data": {
        "level": 3,
        "created_at": "2012-02-29T07:50:12.000000Z",
        "slug": "生む",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%9F%E3%82%80",
        "characters": "生む",
        "meanings": [
          {
            "meaning": "To Give Birth",
            "primary": true
          },
          {
            "meaning": "To Produce",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うむ"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          850
        ]
      }
    },
    {
      "id": 2578,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2578",
      "data_updated_at": "2017-10-18T23:11:38.417396Z",
      "data": {
        "level": 3,
        "created_at": "2012-02-29T07:50:20.000000Z",
        "slug": "生きる",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%9F%E3%81%8D%E3%82%8B",
        "characters": "生きる",
        "meanings": [
          {
            "meaning": "To Live",
            "primary": true
          },
          {
            "meaning": "To Be Alive",
            "primary": false
          },
          {
            "meaning": "To Exist",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いきる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          850
        ]
      }
    },
    {
      "id": 2579,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2579",
      "data_updated_at": "2017-10-18T23:11:35.965465Z",
      "data": {
        "level": 3,
        "created_at": "2012-02-29T07:50:29.000000Z",
        "slug": "生",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%9F",
        "characters": "生",
        "meanings": [
          {
            "meaning": "Fresh",
            "primary": true
          },
          {
            "meaning": "Raw",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なま"
          }
        ],
        "parts_of_speech": [
          "noun",
          "prefix",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          850
        ]
      }
    },
    {
      "id": 2580,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2580",
      "data_updated_at": "2017-10-18T23:11:32.329624Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:50:47.000000Z",
        "slug": "田",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%B0",
        "characters": "田",
        "meanings": [
          {
            "meaning": "Rice Field",
            "primary": true
          },
          {
            "meaning": "Rice Paddy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "た"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          490
        ]
      }
    },
    {
      "id": 2581,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2581",
      "data_updated_at": "2017-10-18T23:11:30.505697Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:51:26.000000Z",
        "slug": "白",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BD",
        "characters": "白",
        "meanings": [
          {
            "meaning": "White",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しろ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          491
        ]
      }
    },
    {
      "id": 2582,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2582",
      "data_updated_at": "2017-10-18T23:11:33.699772Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:51:35.000000Z",
        "slug": "白人",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BD%E4%BA%BA",
        "characters": "白人",
        "meanings": [
          {
            "meaning": "Caucasian",
            "primary": true
          },
          {
            "meaning": "White Person",
            "primary": false
          },
          {
            "meaning": "White People",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はくじん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          491,
          444
        ]
      }
    },
    {
      "id": 2583,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2583",
      "data_updated_at": "2017-10-18T23:11:33.829299Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:51:42.000000Z",
        "slug": "目",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%AE",
        "characters": "目",
        "meanings": [
          {
            "meaning": "Eye",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "め"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          492
        ]
      }
    },
    {
      "id": 2584,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2584",
      "data_updated_at": "2017-10-18T23:11:33.906482Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:51:51.000000Z",
        "slug": "目玉",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%AE%E7%8E%89",
        "characters": "目玉",
        "meanings": [
          {
            "meaning": "Eyeball",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "めだま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          492,
          489
        ]
      }
    },
    {
      "id": 2585,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2585",
      "data_updated_at": "2017-10-18T23:11:30.159749Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:51:59.000000Z",
        "slug": "石",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9F%B3",
        "characters": "石",
        "meanings": [
          {
            "meaning": "Stone",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          493
        ]
      }
    },
    {
      "id": 2586,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2586",
      "data_updated_at": "2017-10-18T23:11:30.448312Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:52:06.000000Z",
        "slug": "立つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%8B%E3%81%A4",
        "characters": "立つ",
        "meanings": [
          {
            "meaning": "To Stand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たつ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          494
        ]
      }
    },
    {
      "id": 2587,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2587",
      "data_updated_at": "2017-10-18T23:11:34.919303Z",
      "data": {
        "level": 2,
        "created_at": "2012-02-29T07:52:13.000000Z",
        "slug": "立てる",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%8B%E3%81%A6%E3%82%8B",
        "characters": "立てる",
        "meanings": [
          {
            "meaning": "To Stand Up",
            "primary": true
          },
          {
            "meaning": "To Stand Something Up",
            "primary": false
          },
          {
            "meaning": "To Erect",
            "primary": false
          },
          {
            "meaning": "To Erect Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たてる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          494
        ]
      }
    },
    {
      "id": 2588,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2588",
      "data_updated_at": "2017-10-18T23:11:36.041520Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:19:56.000000Z",
        "slug": "一万",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E4%B8%87",
        "characters": "一万",
        "meanings": [
          {
            "meaning": "Ten Thousand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちまん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          495,
          440
        ]
      }
    },
    {
      "id": 2589,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2589",
      "data_updated_at": "2017-10-18T23:11:36.577502Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:20:03.000000Z",
        "slug": "二万",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E4%B8%87",
        "characters": "二万",
        "meanings": [
          {
            "meaning": "Twenty Thousand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にまん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          495,
          441
        ]
      }
    },
    {
      "id": 2590,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2590",
      "data_updated_at": "2017-10-19T16:36:21.889566Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:20:11.000000Z",
        "slug": "十万",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%81%E4%B8%87",
        "characters": "十万",
        "meanings": [
          {
            "meaning": "One Hundred Thousand",
            "primary": true
          },
          {
            "meaning": "Hundred Thousand",
            "primary": false
          },
          {
            "meaning": "A Hundred Thousand",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうまん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          495,
          448
        ]
      }
    },
    {
      "id": 2591,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2591",
      "data_updated_at": "2017-10-18T23:11:36.262174Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:20:20.000000Z",
        "slug": "久しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%85%E3%81%97%E3%81%84",
        "characters": "久しい",
        "meanings": [
          {
            "meaning": "Long Time",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひさしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          496
        ]
      }
    },
    {
      "id": 2592,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2592",
      "data_updated_at": "2017-10-18T23:11:37.170655Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:20:27.000000Z",
        "slug": "久しぶり",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%85%E3%81%97%E3%81%B6%E3%82%8A",
        "characters": "久しぶり",
        "meanings": [
          {
            "meaning": "Long Time No See",
            "primary": true
          },
          {
            "meaning": "It's Been A While",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひさしぶり"
          }
        ],
        "parts_of_speech": [
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          496
        ]
      }
    },
    {
      "id": 2593,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2593",
      "data_updated_at": "2017-10-18T23:11:35.507795Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:20:49.000000Z",
        "slug": "今",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A",
        "characters": "今",
        "meanings": [
          {
            "meaning": "Now",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          497
        ]
      }
    },
    {
      "id": 2594,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2594",
      "data_updated_at": "2017-10-18T23:11:39.530356Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:21:14.000000Z",
        "slug": "今日",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E6%97%A5",
        "characters": "今日",
        "meanings": [
          {
            "meaning": "Today",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          497,
          476
        ]
      }
    },
    {
      "id": 2595,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2595",
      "data_updated_at": "2017-10-18T23:11:36.920865Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:21:20.000000Z",
        "slug": "今月",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E6%9C%88",
        "characters": "今月",
        "meanings": [
          {
            "meaning": "This Month",
            "primary": true
          },
          {
            "meaning": "Current Month",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんげつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          497,
          477
        ]
      }
    },
    {
      "id": 2596,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2596",
      "data_updated_at": "2018-01-15T20:00:51.010137Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:21:29.000000Z",
        "slug": "元",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%83",
        "characters": "元",
        "meanings": [
          {
            "meaning": "Origin",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          498
        ]
      }
    },
    {
      "id": 2597,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2597",
      "data_updated_at": "2017-10-18T23:11:35.131422Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:21:52.000000Z",
        "slug": "半分",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%8A%E5%88%86",
        "characters": "半分",
        "meanings": [
          {
            "meaning": "Half",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はんぶん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          518,
          501
        ]
      }
    },
    {
      "id": 2598,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2598",
      "data_updated_at": "2017-10-18T23:11:36.319241Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:05.000000Z",
        "slug": "分かる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%86%E3%81%8B%E3%82%8B",
        "characters": "分かる",
        "meanings": [
          {
            "meaning": "To Understand",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わかる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          501
        ]
      }
    },
    {
      "id": 2599,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2599",
      "data_updated_at": "2017-10-18T23:11:37.501322Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:13.000000Z",
        "slug": "分ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%86%E3%81%91%E3%82%8B",
        "characters": "分ける",
        "meanings": [
          {
            "meaning": "To Separate",
            "primary": true
          },
          {
            "meaning": "To Divide",
            "primary": false
          },
          {
            "meaning": "To Part",
            "primary": false
          },
          {
            "meaning": "To Split",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わける"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          501
        ]
      }
    },
    {
      "id": 2600,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2600",
      "data_updated_at": "2017-10-18T23:11:35.795154Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:19.000000Z",
        "slug": "分",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%86",
        "characters": "分",
        "meanings": [
          {
            "meaning": "Minute",
            "primary": true
          },
          {
            "meaning": "Part",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぶん"
          },
          {
            "primary": false,
            "reading": "ふん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "prefix",
          "suffix"
        ],
        "component_subject_ids": [
          501
        ]
      }
    },
    {
      "id": 2601,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2601",
      "data_updated_at": "2017-10-18T23:11:39.464229Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:25.000000Z",
        "slug": "切れる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%87%E3%82%8C%E3%82%8B",
        "characters": "切れる",
        "meanings": [
          {
            "meaning": "To Be Cut",
            "primary": true
          },
          {
            "meaning": "To Snap",
            "primary": false
          },
          {
            "meaning": "To Break",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きれる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          502
        ]
      }
    },
    {
      "id": 2602,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2602",
      "data_updated_at": "2017-10-18T23:11:37.378970Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:33.000000Z",
        "slug": "大切",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E5%88%87",
        "characters": "大切",
        "meanings": [
          {
            "meaning": "Important",
            "primary": true
          },
          {
            "meaning": "Precious",
            "primary": false
          },
          {
            "meaning": "Valuable",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいせつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          502,
          453
        ]
      }
    },
    {
      "id": 2603,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2603",
      "data_updated_at": "2017-10-18T23:11:39.144769Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:46.000000Z",
        "slug": "切る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%87%E3%82%8B",
        "characters": "切る",
        "meanings": [
          {
            "meaning": "To Cut",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きる"
          }
        ],
        "parts_of_speech": [
          "suffix",
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          502
        ]
      }
    },
    {
      "id": 2604,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2604",
      "data_updated_at": "2017-10-18T23:11:35.189491Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:53.000000Z",
        "slug": "友人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%8B%E4%BA%BA",
        "characters": "友人",
        "meanings": [
          {
            "meaning": "Friend",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆうじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          504,
          444
        ]
      }
    },
    {
      "id": 2605,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2605",
      "data_updated_at": "2017-10-18T23:11:36.465938Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:22:59.000000Z",
        "slug": "太い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%AA%E3%81%84",
        "characters": "太い",
        "meanings": [
          {
            "meaning": "Fat",
            "primary": true
          },
          {
            "meaning": "Thick",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふとい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          505
        ]
      }
    },
    {
      "id": 2606,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2606",
      "data_updated_at": "2017-10-18T23:11:37.293109Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:05.000000Z",
        "slug": "太る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%AA%E3%82%8B",
        "characters": "太る",
        "meanings": [
          {
            "meaning": "To Get Fat",
            "primary": true
          },
          {
            "meaning": "To Become Fat",
            "primary": false
          },
          {
            "meaning": "To Grow Fat",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふとる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          505
        ]
      }
    },
    {
      "id": 2607,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2607",
      "data_updated_at": "2017-10-18T23:11:36.389515Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:13.000000Z",
        "slug": "少し",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%91%E3%81%97",
        "characters": "少し",
        "meanings": [
          {
            "meaning": "A Little",
            "primary": true
          },
          {
            "meaning": "A Few",
            "primary": false
          },
          {
            "meaning": "Few",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すこし"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun"
        ],
        "component_subject_ids": [
          506
        ]
      }
    },
    {
      "id": 2608,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2608",
      "data_updated_at": "2017-10-18T23:11:38.571010Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:22.000000Z",
        "slug": "少ない",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%91%E3%81%AA%E3%81%84",
        "characters": "少ない",
        "meanings": [
          {
            "meaning": "A Few",
            "primary": true
          },
          {
            "meaning": "Few",
            "primary": false
          },
          {
            "meaning": "Scarce",
            "primary": false
          },
          {
            "meaning": "Not Much",
            "primary": false
          },
          {
            "meaning": "Not Many",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すくない"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          506
        ]
      }
    },
    {
      "id": 2609,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2609",
      "data_updated_at": "2017-10-18T23:11:39.202022Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:31.000000Z",
        "slug": "引く",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%95%E3%81%8F",
        "characters": "引く",
        "meanings": [
          {
            "meaning": "To Pull",
            "primary": true
          },
          {
            "meaning": "To Subtract",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          507
        ]
      }
    },
    {
      "id": 2610,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2610",
      "data_updated_at": "2017-10-18T23:11:37.232929Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:41.000000Z",
        "slug": "心",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%83",
        "characters": "心",
        "meanings": [
          {
            "meaning": "Heart",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こころ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          508
        ]
      }
    },
    {
      "id": 2611,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2611",
      "data_updated_at": "2017-10-18T23:11:38.680261Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:48.000000Z",
        "slug": "戸口",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%B8%E5%8F%A3",
        "characters": "戸口",
        "meanings": [
          {
            "meaning": "Doorway",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とぐち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          509,
          452
        ]
      }
    },
    {
      "id": 2612,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2612",
      "data_updated_at": "2017-10-18T23:11:35.237388Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:23:59.000000Z",
        "slug": "方",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%B9",
        "characters": "方",
        "meanings": [
          {
            "meaning": "Way",
            "primary": true
          },
          {
            "meaning": "Direction",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かた"
          },
          {
            "primary": false,
            "reading": "ほう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          510
        ]
      }
    },
    {
      "id": 2613,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2613",
      "data_updated_at": "2017-10-18T23:11:39.266178Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:07.000000Z",
        "slug": "止まる",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A2%E3%81%BE%E3%82%8B",
        "characters": "止まる",
        "meanings": [
          {
            "meaning": "To Stop",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とまる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          514
        ]
      }
    },
    {
      "id": 2614,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2614",
      "data_updated_at": "2017-10-18T23:11:36.517572Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:17.000000Z",
        "slug": "止める",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A2%E3%82%81%E3%82%8B",
        "characters": "止める",
        "meanings": [
          {
            "meaning": "To Stop Something",
            "primary": true
          },
          {
            "meaning": "To Stop",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とめる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          514
        ]
      }
    },
    {
      "id": 2615,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2615",
      "data_updated_at": "2017-10-18T23:11:37.061639Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:23.000000Z",
        "slug": "中止",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E6%AD%A2",
        "characters": "中止",
        "meanings": [
          {
            "meaning": "Suspension",
            "primary": true
          },
          {
            "meaning": "Stoppage",
            "primary": false
          },
          {
            "meaning": "Discontinuance",
            "primary": false
          },
          {
            "meaning": "Interruption",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうし"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          514,
          469
        ]
      }
    },
    {
      "id": 2616,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2616",
      "data_updated_at": "2017-10-18T23:11:39.395872Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:38.000000Z",
        "slug": "毛",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%9B",
        "characters": "毛",
        "meanings": [
          {
            "meaning": "Fur",
            "primary": true
          },
          {
            "meaning": "Hair",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "け"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          513
        ]
      }
    },
    {
      "id": 2617,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2617",
      "data_updated_at": "2017-10-18T23:11:38.040450Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:44.000000Z",
        "slug": "父",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%88%B6",
        "characters": "父",
        "meanings": [
          {
            "meaning": "Father",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          512
        ]
      }
    },
    {
      "id": 2618,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2618",
      "data_updated_at": "2017-10-18T23:11:38.222020Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:52.000000Z",
        "slug": "お父さん",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E7%88%B6%E3%81%95%E3%82%93",
        "characters": "お父さん",
        "meanings": [
          {
            "meaning": "Father",
            "primary": true
          },
          {
            "meaning": "Dad",
            "primary": false
          },
          {
            "meaning": "Papa",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おとうさん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          512
        ]
      }
    },
    {
      "id": 2619,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2619",
      "data_updated_at": "2017-10-18T23:11:38.633004Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:24:58.000000Z",
        "slug": "牛",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%89%9B",
        "characters": "牛",
        "meanings": [
          {
            "meaning": "Cow",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          511
        ]
      }
    },
    {
      "id": 2620,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2620",
      "data_updated_at": "2017-10-18T23:11:36.194495Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:25:12.000000Z",
        "slug": "兄",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%84",
        "characters": "兄",
        "meanings": [
          {
            "meaning": "Older Brother",
            "primary": true
          },
          {
            "meaning": "Big Brother",
            "primary": false
          },
          {
            "meaning": "Elder Brother",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あに"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          515
        ]
      }
    },
    {
      "id": 2621,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2621",
      "data_updated_at": "2017-10-18T23:11:38.873101Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:25:37.000000Z",
        "slug": "お兄さん",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E5%85%84%E3%81%95%E3%82%93",
        "characters": "お兄さん",
        "meanings": [
          {
            "meaning": "Older Brother",
            "primary": true
          },
          {
            "meaning": "Big Brother",
            "primary": false
          },
          {
            "meaning": "Elder Brother",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おにいさん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          515
        ]
      }
    },
    {
      "id": 2622,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2622",
      "data_updated_at": "2017-10-18T23:11:35.555306Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:25:49.000000Z",
        "slug": "冬",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%86%AC",
        "characters": "冬",
        "meanings": [
          {
            "meaning": "Winter",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふゆ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          516
        ]
      }
    },
    {
      "id": 2623,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2623",
      "data_updated_at": "2017-10-18T23:11:36.645618Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:25:56.000000Z",
        "slug": "北",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8C%97",
        "characters": "北",
        "meanings": [
          {
            "meaning": "North",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          517
        ]
      }
    },
    {
      "id": 2624,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2624",
      "data_updated_at": "2017-10-18T23:11:36.998131Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:26:40.000000Z",
        "slug": "半",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%8A",
        "characters": "半",
        "meanings": [
          {
            "meaning": "Half",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "prefix"
        ],
        "component_subject_ids": [
          518
        ]
      }
    },
    {
      "id": 2625,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2625",
      "data_updated_at": "2017-10-18T23:11:38.829420Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:26:48.000000Z",
        "slug": "古い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%A4%E3%81%84",
        "characters": "古い",
        "meanings": [
          {
            "meaning": "Old",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふるい"
          }
        ],
        "parts_of_speech": [
          "adjective"
        ],
        "component_subject_ids": [
          519
        ]
      }
    },
    {
      "id": 2626,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2626",
      "data_updated_at": "2017-10-18T23:11:38.373750Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:26:56.000000Z",
        "slug": "中古",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E5%8F%A4",
        "characters": "中古",
        "meanings": [
          {
            "meaning": "Secondhand",
            "primary": true
          },
          {
            "meaning": "Used",
            "primary": false
          },
          {
            "meaning": "Second Hand",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうこ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          519,
          469
        ]
      }
    },
    {
      "id": 2627,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2627",
      "data_updated_at": "2017-10-18T23:11:35.657087Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:04.000000Z",
        "slug": "一台",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E5%8F%B0",
        "characters": "一台",
        "meanings": [
          {
            "meaning": "One Machine",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          520,
          440
        ]
      }
    },
    {
      "id": 2628,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2628",
      "data_updated_at": "2017-10-18T23:11:36.853529Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:10.000000Z",
        "slug": "二台",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E5%8F%B0",
        "characters": "二台",
        "meanings": [
          {
            "meaning": "Two Machines",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          520,
          441
        ]
      }
    },
    {
      "id": 2629,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2629",
      "data_updated_at": "2017-10-18T23:11:35.407533Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:17.000000Z",
        "slug": "五台",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94%E5%8F%B0",
        "characters": "五台",
        "meanings": [
          {
            "meaning": "Five Machines",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          520,
          470
        ]
      }
    },
    {
      "id": 2630,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2630",
      "data_updated_at": "2017-10-18T23:11:36.768428Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:24.000000Z",
        "slug": "十台",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%81%E5%8F%B0",
        "characters": "十台",
        "meanings": [
          {
            "meaning": "Ten Machines",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          520,
          448
        ]
      }
    },
    {
      "id": 2631,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2631",
      "data_updated_at": "2017-10-18T23:11:35.599325Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:36.000000Z",
        "slug": "外",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96",
        "characters": "外",
        "meanings": [
          {
            "meaning": "Outside",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          521
        ]
      }
    },
    {
      "id": 2632,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2632",
      "data_updated_at": "2017-10-18T23:11:38.733559Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:45.000000Z",
        "slug": "外人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E4%BA%BA",
        "characters": "外人",
        "meanings": [
          {
            "meaning": "Foreigner",
            "primary": true
          },
          {
            "meaning": "Outsider",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がいじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          521,
          444
        ]
      }
    },
    {
      "id": 2633,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2633",
      "data_updated_at": "2017-10-18T23:11:37.595345Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:27:52.000000Z",
        "slug": "外れ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E3%82%8C",
        "characters": "外れ",
        "meanings": [
          {
            "meaning": "Extremity",
            "primary": true
          },
          {
            "meaning": "Furthest Point",
            "primary": false
          },
          {
            "meaning": "End",
            "primary": false
          },
          {
            "meaning": "Outskirts",
            "primary": false
          },
          {
            "meaning": "Outer Limits",
            "primary": false
          },
          {
            "meaning": "Edge",
            "primary": false
          },
          {
            "meaning": "Miss",
            "primary": false
          },
          {
            "meaning": "Failure",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はずれ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          521
        ]
      }
    },
    {
      "id": 2634,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2634",
      "data_updated_at": "2017-10-18T23:11:39.063935Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:00.000000Z",
        "slug": "外れる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E3%82%8C%E3%82%8B",
        "characters": "外れる",
        "meanings": [
          {
            "meaning": "To Be Disconnected",
            "primary": true
          },
          {
            "meaning": "To Come Off",
            "primary": false
          },
          {
            "meaning": "To Be Out",
            "primary": false
          },
          {
            "meaning": "To Be Off",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はずれる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          521
        ]
      }
    },
    {
      "id": 2635,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2635",
      "data_updated_at": "2017-10-18T23:11:35.463039Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:09.000000Z",
        "slug": "市",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B8%82",
        "characters": "市",
        "meanings": [
          {
            "meaning": "City",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "し"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          522
        ]
      }
    },
    {
      "id": 2636,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2636",
      "data_updated_at": "2017-10-18T23:11:37.124571Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:19.000000Z",
        "slug": "市立",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B8%82%E7%AB%8B",
        "characters": "市立",
        "meanings": [
          {
            "meaning": "Municipal",
            "primary": true
          },
          {
            "meaning": "City",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しりつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          522,
          494
        ]
      }
    },
    {
      "id": 2637,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2637",
      "data_updated_at": "2017-10-18T23:11:38.454001Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:26.000000Z",
        "slug": "シアトル市",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%82%B7%E3%82%A2%E3%83%88%E3%83%AB%E5%B8%82",
        "characters": "シアトル市",
        "meanings": [
          {
            "meaning": "Seattle",
            "primary": true
          },
          {
            "meaning": "City Of Seattle",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しあとるし"
          },
          {
            "primary": false,
            "reading": "シアトルし"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          522
        ]
      }
    },
    {
      "id": 2638,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2638",
      "data_updated_at": "2017-10-18T23:11:35.286185Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:33.000000Z",
        "slug": "広い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BA%83%E3%81%84",
        "characters": "広い",
        "meanings": [
          {
            "meaning": "Wide",
            "primary": true
          },
          {
            "meaning": "Spacious",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひろい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          523
        ]
      }
    },
    {
      "id": 2639,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2639",
      "data_updated_at": "2017-10-18T23:11:35.903936Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:40.000000Z",
        "slug": "母",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%8D",
        "characters": "母",
        "meanings": [
          {
            "meaning": "Mother",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はは"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          524
        ]
      }
    },
    {
      "id": 2640,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2640",
      "data_updated_at": "2017-10-18T23:11:38.318572Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:47.000000Z",
        "slug": "お母さん",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E6%AF%8D%E3%81%95%E3%82%93",
        "characters": "お母さん",
        "meanings": [
          {
            "meaning": "Mother",
            "primary": true
          },
          {
            "meaning": "Mom",
            "primary": false
          },
          {
            "meaning": "Mum",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おかあさん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          524
        ]
      }
    },
    {
      "id": 2641,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2641",
      "data_updated_at": "2017-10-18T23:11:39.331109Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:28:55.000000Z",
        "slug": "用いる",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%A8%E3%81%84%E3%82%8B",
        "characters": "用いる",
        "meanings": [
          {
            "meaning": "To Utilize",
            "primary": true
          },
          {
            "meaning": "To Use",
            "primary": false
          },
          {
            "meaning": "To Utilise",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もちいる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          525
        ]
      }
    },
    {
      "id": 2642,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2642",
      "data_updated_at": "2017-10-18T23:11:38.784650Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:29:01.000000Z",
        "slug": "公用",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AC%E7%94%A8",
        "characters": "公用",
        "meanings": [
          {
            "meaning": "Government Business",
            "primary": true
          },
          {
            "meaning": "Official Business",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうよう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          525,
          499
        ]
      }
    },
    {
      "id": 2643,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2643",
      "data_updated_at": "2017-10-18T23:11:35.086882Z",
      "data": {
        "level": 3,
        "created_at": "2012-03-01T18:29:08.000000Z",
        "slug": "矢",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9F%A2",
        "characters": "矢",
        "meanings": [
          {
            "meaning": "Arrow",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "や"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          526
        ]
      }
    },
    {
      "id": 2644,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2644",
      "data_updated_at": "2017-10-18T23:11:42.543830Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:00:48.000000Z",
        "slug": "休み",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%91%E3%81%BF",
        "characters": "休み",
        "meanings": [
          {
            "meaning": "Rest",
            "primary": true
          },
          {
            "meaning": "Break",
            "primary": false
          },
          {
            "meaning": "Vacation",
            "primary": false
          },
          {
            "meaning": "Holiday",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やすみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          542
        ]
      }
    },
    {
      "id": 2645,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2645",
      "data_updated_at": "2017-10-18T23:11:44.489215Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:01:46.000000Z",
        "slug": "休む",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%91%E3%82%80",
        "characters": "休む",
        "meanings": [
          {
            "meaning": "To Rest",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やすむ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          542
        ]
      }
    },
    {
      "id": 2646,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2646",
      "data_updated_at": "2017-10-18T23:11:44.424971Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:02:00.000000Z",
        "slug": "休止",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%91%E6%AD%A2",
        "characters": "休止",
        "meanings": [
          {
            "meaning": "Pause",
            "primary": true
          },
          {
            "meaning": "Rest",
            "primary": false
          },
          {
            "meaning": "Break",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゅうし"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          542,
          514
        ]
      }
    },
    {
      "id": 2647,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2647",
      "data_updated_at": "2017-10-18T23:11:43.663409Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:02:10.000000Z",
        "slug": "休日",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%91%E6%97%A5",
        "characters": "休日",
        "meanings": [
          {
            "meaning": "Holiday",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゅうじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          542,
          476
        ]
      }
    },
    {
      "id": 2648,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2648",
      "data_updated_at": "2017-10-18T23:11:40.824048Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:02:26.000000Z",
        "slug": "先ず",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E3%81%9A",
        "characters": "先ず",
        "meanings": [
          {
            "meaning": "First Of All",
            "primary": true
          },
          {
            "meaning": "To Start With",
            "primary": false
          },
          {
            "meaning": "Firstly",
            "primary": false
          },
          {
            "meaning": "To Begin With",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まず"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          543
        ]
      }
    },
    {
      "id": 2649,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2649",
      "data_updated_at": "2017-10-18T23:11:41.379809Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:02:33.000000Z",
        "slug": "先",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88",
        "characters": "先",
        "meanings": [
          {
            "meaning": "Previous",
            "primary": true
          },
          {
            "meaning": "Ahead",
            "primary": false
          },
          {
            "meaning": "Past",
            "primary": false
          },
          {
            "meaning": "Former",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "prefix",
          "suffix",
          "no_adjective"
        ],
        "component_subject_ids": [
          543
        ]
      }
    },
    {
      "id": 2650,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2650",
      "data_updated_at": "2017-10-18T23:11:41.156779Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:02:41.000000Z",
        "slug": "先々月",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E3%80%85%E6%9C%88",
        "characters": "先々月",
        "meanings": [
          {
            "meaning": "Month Before Last",
            "primary": true
          },
          {
            "meaning": "The Month Before Last",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんせんげつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          856,
          543,
          477
        ]
      }
    },
    {
      "id": 2651,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2651",
      "data_updated_at": "2017-10-18T23:11:42.397170Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:02:51.000000Z",
        "slug": "先月",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E6%9C%88",
        "characters": "先月",
        "meanings": [
          {
            "meaning": "Last Month",
            "primary": true
          },
          {
            "meaning": "Previous Month",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんげつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          543,
          477
        ]
      }
    },
    {
      "id": 2652,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2652",
      "data_updated_at": "2017-10-18T23:11:45.441533Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:03:04.000000Z",
        "slug": "先日",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E6%97%A5",
        "characters": "先日",
        "meanings": [
          {
            "meaning": "The Other Day",
            "primary": true
          },
          {
            "meaning": "A Few Days Ago",
            "primary": false
          },
          {
            "meaning": "Other Day",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          543,
          476
        ]
      }
    },
    {
      "id": 2653,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2653",
      "data_updated_at": "2017-10-18T23:11:42.745562Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:03:19.000000Z",
        "slug": "先生",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E7%94%9F",
        "characters": "先生",
        "meanings": [
          {
            "meaning": "Teacher",
            "primary": true
          },
          {
            "meaning": "Master",
            "primary": false
          },
          {
            "meaning": "Doctor",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          543
        ]
      }
    },
    {
      "id": 2655,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2655",
      "data_updated_at": "2017-10-18T23:11:39.586144Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:03:42.000000Z",
        "slug": "名人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E4%BA%BA",
        "characters": "名人",
        "meanings": [
          {
            "meaning": "Master",
            "primary": true
          },
          {
            "meaning": "Expert",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "めいじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          544,
          444
        ]
      }
    },
    {
      "id": 2656,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2656",
      "data_updated_at": "2017-10-18T23:11:41.552904Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:03:50.000000Z",
        "slug": "名字",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E5%AD%97",
        "characters": "名字",
        "meanings": [
          {
            "meaning": "Surname",
            "primary": true
          },
          {
            "meaning": "Last Name",
            "primary": false
          },
          {
            "meaning": "Family Name",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みょうじ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          545,
          544
        ]
      }
    },
    {
      "id": 2657,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2657",
      "data_updated_at": "2017-10-18T23:11:44.170469Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:04:02.000000Z",
        "slug": "字",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%97",
        "characters": "字",
        "meanings": [
          {
            "meaning": "Character",
            "primary": true
          },
          {
            "meaning": "Kanji Character",
            "primary": false
          },
          {
            "meaning": "Letter",
            "primary": false
          },
          {
            "meaning": "Symbol",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          545
        ]
      }
    },
    {
      "id": 2658,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2658",
      "data_updated_at": "2017-10-18T23:11:44.312809Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:04:16.000000Z",
        "slug": "太字",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%AA%E5%AD%97",
        "characters": "太字",
        "meanings": [
          {
            "meaning": "Bold Letter",
            "primary": true
          },
          {
            "meaning": "Bold",
            "primary": false
          },
          {
            "meaning": "Bold Character",
            "primary": false
          },
          {
            "meaning": "Bold Text",
            "primary": false
          },
          {
            "meaning": "Boldface",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふとじ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          545,
          505
        ]
      }
    },
    {
      "id": 2659,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2659",
      "data_updated_at": "2017-10-18T23:11:41.063015Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:04:22.000000Z",
        "slug": "文字",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%87%E5%AD%97",
        "characters": "文字",
        "meanings": [
          {
            "meaning": "Letter (Of The Alphabet)",
            "primary": true
          },
          {
            "meaning": "Character",
            "primary": false
          },
          {
            "meaning": "Letters",
            "primary": false
          },
          {
            "meaning": "Characters",
            "primary": false
          },
          {
            "meaning": "Letter",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          545,
          475
        ]
      }
    },
    {
      "id": 2660,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2660",
      "data_updated_at": "2017-10-18T23:11:42.638640Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:04:29.000000Z",
        "slug": "一文字",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%96%87%E5%AD%97",
        "characters": "一文字",
        "meanings": [
          {
            "meaning": "Straight Line",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちもんじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          545,
          475,
          440
        ]
      }
    },
    {
      "id": 2661,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2661",
      "data_updated_at": "2017-10-18T23:11:56.578136Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-03T00:04:36.000000Z",
        "slug": "大文字",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E6%96%87%E5%AD%97",
        "characters": "大文字",
        "meanings": [
          {
            "meaning": "Capital Letters",
            "primary": true
          },
          {
            "meaning": "Uppercase Letters",
            "primary": false
          },
          {
            "meaning": "Capital Letter",
            "primary": false
          },
          {
            "meaning": "Uppercase Letter",
            "primary": false
          },
          {
            "meaning": "Uppercase",
            "primary": false
          },
          {
            "meaning": "Capital",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おおもじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          545,
          475,
          453
        ]
      }
    },
    {
      "id": 2662,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2662",
      "data_updated_at": "2017-10-18T23:11:44.239211Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:04:49.000000Z",
        "slug": "２０１１年",
        "document_url": "https://www.wanikani.com/vocabulary/%EF%BC%92%EF%BC%90%EF%BC%91%EF%BC%91%E5%B9%B4",
        "characters": "２０１１年",
        "meanings": [
          {
            "meaning": "Year 2011",
            "primary": true
          },
          {
            "meaning": "2011",
            "primary": false
          },
          {
            "meaning": "The Year 2011",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にせんじゅういちねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546
        ]
      }
    },
    {
      "id": 2663,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2663",
      "data_updated_at": "2017-10-18T23:11:42.938973Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:05:14.000000Z",
        "slug": "年内",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4%E5%86%85",
        "characters": "年内",
        "meanings": [
          {
            "meaning": "Within A Year",
            "primary": true
          },
          {
            "meaning": "Within The Year",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ねんない"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546,
          500
        ]
      }
    },
    {
      "id": 2664,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2664",
      "data_updated_at": "2017-10-18T23:11:42.317985Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:05:25.000000Z",
        "slug": "年中",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4%E4%B8%AD",
        "characters": "年中",
        "meanings": [
          {
            "meaning": "Year Round",
            "primary": true
          },
          {
            "meaning": "All Year",
            "primary": false
          },
          {
            "meaning": "Whole Year",
            "primary": false
          },
          {
            "meaning": "Throughout The Year",
            "primary": false
          },
          {
            "meaning": "All Year Round",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ねんじゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546,
          469
        ]
      }
    },
    {
      "id": 2665,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2665",
      "data_updated_at": "2017-11-09T20:09:02.371047Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:05:35.000000Z",
        "slug": "一年生",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E5%B9%B4%E7%94%9F",
        "characters": "一年生",
        "meanings": [
          {
            "meaning": "First Year Student",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちねんせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          546,
          440
        ]
      }
    },
    {
      "id": 2666,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2666",
      "data_updated_at": "2017-10-18T23:11:44.129107Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:05:49.000000Z",
        "slug": "少年",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%91%E5%B9%B4",
        "characters": "少年",
        "meanings": [
          {
            "meaning": "Young Boy",
            "primary": true
          },
          {
            "meaning": "Juvenile",
            "primary": false
          },
          {
            "meaning": "Youth",
            "primary": false
          },
          {
            "meaning": "Boy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546,
          506
        ]
      }
    },
    {
      "id": 2667,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2667",
      "data_updated_at": "2017-10-18T23:11:42.687311Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:06:01.000000Z",
        "slug": "去年",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8E%BB%E5%B9%B4",
        "characters": "去年",
        "meanings": [
          {
            "meaning": "Last Year",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546,
          532
        ]
      }
    },
    {
      "id": 2668,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2668",
      "data_updated_at": "2017-10-18T23:11:39.845550Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:06:08.000000Z",
        "slug": "早い",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A9%E3%81%84",
        "characters": "早い",
        "meanings": [
          {
            "meaning": "Early",
            "primary": true
          },
          {
            "meaning": "Fast",
            "primary": false
          },
          {
            "meaning": "Quick",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はやい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          547
        ]
      }
    },
    {
      "id": 2669,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2669",
      "data_updated_at": "2017-10-18T23:11:40.637491Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:06:46.000000Z",
        "slug": "早々",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A9%E3%80%85",
        "characters": "早々",
        "meanings": [
          {
            "meaning": "As Soon As",
            "primary": true
          },
          {
            "meaning": "Just After",
            "primary": false
          },
          {
            "meaning": "Immediately After",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そうそう"
          },
          {
            "primary": false,
            "reading": "はやばや"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          856,
          547
        ]
      }
    },
    {
      "id": 2670,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2670",
      "data_updated_at": "2017-10-18T23:11:39.638832Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:07:05.000000Z",
        "slug": "気",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%97",
        "characters": "気",
        "meanings": [
          {
            "meaning": "Spirit",
            "primary": true
          },
          {
            "meaning": "Energy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "き"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          548
        ]
      }
    },
    {
      "id": 2671,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2671",
      "data_updated_at": "2017-10-18T23:11:41.694314Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:07:45.000000Z",
        "slug": "気に入る",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%97%E3%81%AB%E5%85%A5%E3%82%8B",
        "characters": "気に入る",
        "meanings": [
          {
            "meaning": "To Be Pleased With",
            "primary": true
          },
          {
            "meaning": "To Be Satisfied With",
            "primary": false
          },
          {
            "meaning": "To Be Happy With",
            "primary": false
          },
          {
            "meaning": "To Be Pleased",
            "primary": false
          },
          {
            "meaning": "To Be Satisfied",
            "primary": false
          },
          {
            "meaning": "To Be Happy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きにいる"
          }
        ],
        "parts_of_speech": [
          "expression"
        ],
        "component_subject_ids": [
          548,
          445
        ]
      }
    },
    {
      "id": 2672,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2672",
      "data_updated_at": "2017-10-18T23:11:42.885538Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:08:02.000000Z",
        "slug": "一気",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%B0%97",
        "characters": "一気",
        "meanings": [
          {
            "meaning": "One Breath",
            "primary": true
          },
          {
            "meaning": "One Go",
            "primary": false
          },
          {
            "meaning": "One Sitting",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いっき"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          548,
          440
        ]
      }
    },
    {
      "id": 2673,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2673",
      "data_updated_at": "2017-10-18T23:11:42.595135Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:09:03.000000Z",
        "slug": "気分",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%97%E5%88%86",
        "characters": "気分",
        "meanings": [
          {
            "meaning": "Feeling",
            "primary": true
          },
          {
            "meaning": "Mood",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きぶん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          548,
          501
        ]
      }
    },
    {
      "id": 2674,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2674",
      "data_updated_at": "2017-10-18T23:11:39.766621Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:09:20.000000Z",
        "slug": "人気",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA%E6%B0%97",
        "characters": "人気",
        "meanings": [
          {
            "meaning": "Popular",
            "primary": true
          },
          {
            "meaning": "Popularity",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にんき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          548,
          444
        ]
      }
    },
    {
      "id": 2675,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2675",
      "data_updated_at": "2017-10-18T23:11:39.924019Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:09:53.000000Z",
        "slug": "元気",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%83%E6%B0%97",
        "characters": "元気",
        "meanings": [
          {
            "meaning": "Energy",
            "primary": true
          },
          {
            "meaning": "Spirit",
            "primary": false
          },
          {
            "meaning": "Health",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "げんき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          548,
          498
        ]
      }
    },
    {
      "id": 2676,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2676",
      "data_updated_at": "2017-10-18T23:11:42.186237Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:00.000000Z",
        "slug": "天気",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A9%E6%B0%97",
        "characters": "天気",
        "meanings": [
          {
            "meaning": "Weather",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てんき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          548,
          473
        ]
      }
    },
    {
      "id": 2677,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2677",
      "data_updated_at": "2017-10-18T23:11:44.601979Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:10.000000Z",
        "slug": "本気",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AC%E6%B0%97",
        "characters": "本気",
        "meanings": [
          {
            "meaning": "Serious",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほんき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          548,
          487
        ]
      }
    },
    {
      "id": 2678,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2678",
      "data_updated_at": "2017-10-18T23:11:45.124091Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:16.000000Z",
        "slug": "平気",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B3%E6%B0%97",
        "characters": "平気",
        "meanings": [
          {
            "meaning": "Calm",
            "primary": true
          },
          {
            "meaning": "Cool",
            "primary": false
          },
          {
            "meaning": "All Right",
            "primary": false
          },
          {
            "meaning": "Okay",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へいき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          548,
          535
        ]
      }
    },
    {
      "id": 2679,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2679",
      "data_updated_at": "2017-10-18T23:11:41.273260Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:26.000000Z",
        "slug": "一本気",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%9C%AC%E6%B0%97",
        "characters": "一本気",
        "meanings": [
          {
            "meaning": "One Track Mind",
            "primary": true
          },
          {
            "meaning": "Single Mindedness",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いっぽんぎ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          548,
          487,
          440
        ]
      }
    },
    {
      "id": 2680,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2680",
      "data_updated_at": "2017-10-18T23:11:43.882608Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:41.000000Z",
        "slug": "百万",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BE%E4%B8%87",
        "characters": "百万",
        "meanings": [
          {
            "meaning": "Million",
            "primary": true
          },
          {
            "meaning": "One Million",
            "primary": false
          },
          {
            "meaning": "A Million",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひゃくまん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          549,
          495
        ]
      }
    },
    {
      "id": 2681,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2681",
      "data_updated_at": "2017-10-18T23:11:45.175023Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:48.000000Z",
        "slug": "四百",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E7%99%BE",
        "characters": "四百",
        "meanings": [
          {
            "meaning": "Four Hundred",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よんひゃく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          549,
          485
        ]
      }
    },
    {
      "id": 2682,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2682",
      "data_updated_at": "2017-10-18T23:11:45.299915Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:10:56.000000Z",
        "slug": "五百",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%94%E7%99%BE",
        "characters": "五百",
        "meanings": [
          {
            "meaning": "Five Hundred",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごひゃく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          549,
          470
        ]
      }
    },
    {
      "id": 2683,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2683",
      "data_updated_at": "2017-10-18T23:11:42.787475Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:11:04.000000Z",
        "slug": "二百",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E7%99%BE",
        "characters": "二百",
        "meanings": [
          {
            "meaning": "Two Hundred",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にひゃく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          549,
          441
        ]
      }
    },
    {
      "id": 2684,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2684",
      "data_updated_at": "2017-10-18T23:11:40.688705Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:11:13.000000Z",
        "slug": "竹の子",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%B9%E3%81%AE%E5%AD%90",
        "characters": "竹の子",
        "meanings": [
          {
            "meaning": "Bamboo Shoots",
            "primary": true
          },
          {
            "meaning": "Bamboo Sprouts",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たけのこ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          550,
          462
        ]
      }
    },
    {
      "id": 2685,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2685",
      "data_updated_at": "2017-10-18T23:11:43.606486Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:11:25.000000Z",
        "slug": "竹",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%B9",
        "characters": "竹",
        "meanings": [
          {
            "meaning": "Bamboo",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たけ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          550
        ]
      }
    },
    {
      "id": 2686,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2686",
      "data_updated_at": "2017-10-18T23:11:40.325802Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:11:49.000000Z",
        "slug": "糸",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B3%B8",
        "characters": "糸",
        "meanings": [
          {
            "meaning": "Thread",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          551
        ]
      }
    },
    {
      "id": 2687,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2687",
      "data_updated_at": "2017-10-18T23:11:39.681468Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:11:55.000000Z",
        "slug": "耳",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%80%B3",
        "characters": "耳",
        "meanings": [
          {
            "meaning": "Ear",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          552
        ]
      }
    },
    {
      "id": 2688,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2688",
      "data_updated_at": "2017-10-18T23:11:44.671483Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:12:09.000000Z",
        "slug": "耳打ち",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%80%B3%E6%89%93%E3%81%A1",
        "characters": "耳打ち",
        "meanings": [
          {
            "meaning": "Whisper In Ear",
            "primary": true
          },
          {
            "meaning": "Whisper In One's Ear",
            "primary": false
          },
          {
            "meaning": "Whisper In Someone's Ear",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みみうち"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          552,
          536
        ]
      }
    },
    {
      "id": 2689,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2689",
      "data_updated_at": "2017-10-18T23:11:40.734481Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:12:21.000000Z",
        "slug": "虫",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%99%AB",
        "characters": "虫",
        "meanings": [
          {
            "meaning": "Bug",
            "primary": true
          },
          {
            "meaning": "Insect",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          553
        ]
      }
    },
    {
      "id": 2690,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2690",
      "data_updated_at": "2017-10-18T23:11:42.131039Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:12:35.000000Z",
        "slug": "村",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%91",
        "characters": "村",
        "meanings": [
          {
            "meaning": "Village",
            "primary": true
          },
          {
            "meaning": "Rural Town",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むら"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          554
        ]
      }
    },
    {
      "id": 2691,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2691",
      "data_updated_at": "2017-10-18T23:11:44.014792Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:12:46.000000Z",
        "slug": "村人",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%91%E4%BA%BA",
        "characters": "村人",
        "meanings": [
          {
            "meaning": "Villager",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むらびと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          554,
          444
        ]
      }
    },
    {
      "id": 2692,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2692",
      "data_updated_at": "2017-10-18T23:11:43.323263Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:12:53.000000Z",
        "slug": "男",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%B7",
        "characters": "男",
        "meanings": [
          {
            "meaning": "Man",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おとこ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          555
        ]
      }
    },
    {
      "id": 2693,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2693",
      "data_updated_at": "2017-10-18T23:11:40.233308Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:13:42.000000Z",
        "slug": "町",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%BA",
        "characters": "町",
        "meanings": [
          {
            "meaning": "Town",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          556
        ]
      }
    },
    {
      "id": 2694,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2694",
      "data_updated_at": "2017-10-18T23:11:39.967116Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:13:55.000000Z",
        "slug": "花",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8A%B1",
        "characters": "花",
        "meanings": [
          {
            "meaning": "Flower",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          557
        ]
      }
    },
    {
      "id": 2695,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2695",
      "data_updated_at": "2017-10-18T23:11:43.269809Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:14:02.000000Z",
        "slug": "花火",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8A%B1%E7%81%AB",
        "characters": "花火",
        "meanings": [
          {
            "meaning": "Fireworks",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はなび"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          557,
          480
        ]
      }
    },
    {
      "id": 2696,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2696",
      "data_updated_at": "2017-10-18T23:11:41.999990Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:14:10.000000Z",
        "slug": "花見",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8A%B1%E8%A6%8B",
        "characters": "花見",
        "meanings": [
          {
            "meaning": "Viewing Cherry Blossoms",
            "primary": true
          },
          {
            "meaning": "Sakura Viewing",
            "primary": false
          },
          {
            "meaning": "Cherry Blossom Viewing",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はなみ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          558,
          557
        ]
      }
    },
    {
      "id": 2697,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2697",
      "data_updated_at": "2018-02-12T06:02:18.245632Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:14:17.000000Z",
        "slug": "見る",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%8B%E3%82%8B",
        "characters": "見る",
        "meanings": [
          {
            "meaning": "To See",
            "primary": true
          },
          {
            "meaning": "To Look",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          558
        ]
      }
    },
    {
      "id": 2698,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2698",
      "data_updated_at": "2017-10-18T23:11:40.780922Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:14:23.000000Z",
        "slug": "見える",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%8B%E3%81%88%E3%82%8B",
        "characters": "見える",
        "meanings": [
          {
            "meaning": "Can See",
            "primary": true
          },
          {
            "meaning": "Visible",
            "primary": false
          },
          {
            "meaning": "To Be Visible",
            "primary": false
          },
          {
            "meaning": "To Be Able To See",
            "primary": false
          },
          {
            "meaning": "Able To See",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みえる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          558
        ]
      }
    },
    {
      "id": 2699,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2699",
      "data_updated_at": "2018-03-05T20:01:56.713982Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:14:30.000000Z",
        "slug": "見せる",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%8B%E3%81%9B%E3%82%8B",
        "characters": "見せる",
        "meanings": [
          {
            "meaning": "To Show",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みせる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          558
        ]
      }
    },
    {
      "id": 2700,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2700",
      "data_updated_at": "2017-10-18T23:11:41.757396Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:08.000000Z",
        "slug": "見分ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%8B%E5%88%86%E3%81%91%E3%82%8B",
        "characters": "見分ける",
        "meanings": [
          {
            "meaning": "To Distinguish",
            "primary": true
          },
          {
            "meaning": "To Tell Apart",
            "primary": false
          },
          {
            "meaning": "To Differentiate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みわける"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          558,
          501
        ]
      }
    },
    {
      "id": 2701,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2701",
      "data_updated_at": "2017-10-18T23:11:43.154044Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:19.000000Z",
        "slug": "見方",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%8B%E6%96%B9",
        "characters": "見方",
        "meanings": [
          {
            "meaning": "Way Of Seeing",
            "primary": true
          },
          {
            "meaning": "Point Of View",
            "primary": false
          },
          {
            "meaning": "Perspective",
            "primary": false
          },
          {
            "meaning": "Viewpoint",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みかた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          558,
          510
        ]
      }
    },
    {
      "id": 2702,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2702",
      "data_updated_at": "2017-10-18T23:11:40.056985Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:26.000000Z",
        "slug": "月見",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%88%E8%A6%8B",
        "characters": "月見",
        "meanings": [
          {
            "meaning": "Moon Viewing",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つきみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          558,
          477
        ]
      }
    },
    {
      "id": 2703,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2703",
      "data_updated_at": "2017-10-18T23:11:42.262028Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:37.000000Z",
        "slug": "貝",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B2%9D",
        "characters": "貝",
        "meanings": [
          {
            "meaning": "Shell",
            "primary": true
          },
          {
            "meaning": "Shellfish",
            "primary": false
          },
          {
            "meaning": "Clam",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          559
        ]
      }
    },
    {
      "id": 2704,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2704",
      "data_updated_at": "2017-11-26T04:27:23.927503Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:43.000000Z",
        "slug": "赤",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B5%A4",
        "characters": "赤",
        "meanings": [
          {
            "meaning": "Red",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          560
        ]
      }
    },
    {
      "id": 2705,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2705",
      "data_updated_at": "2017-10-18T23:11:44.890762Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:50.000000Z",
        "slug": "赤ちゃん",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B5%A4%E3%81%A1%E3%82%83%E3%82%93",
        "characters": "赤ちゃん",
        "meanings": [
          {
            "meaning": "Baby",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あかちゃん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          560
        ]
      }
    },
    {
      "id": 2706,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2706",
      "data_updated_at": "2017-10-18T23:11:41.643332Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:15:59.000000Z",
        "slug": "足りる",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B6%B3%E3%82%8A%E3%82%8B",
        "characters": "足りる",
        "meanings": [
          {
            "meaning": "To Be Enough",
            "primary": true
          },
          {
            "meaning": "To Be Sufficient",
            "primary": false
          },
          {
            "meaning": "To Suffice",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たりる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          561
        ]
      }
    },
    {
      "id": 2707,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2707",
      "data_updated_at": "2017-10-18T23:11:40.521468Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:16:07.000000Z",
        "slug": "足",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B6%B3",
        "characters": "足",
        "meanings": [
          {
            "meaning": "Foot",
            "primary": true
          },
          {
            "meaning": "Leg",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          561
        ]
      }
    },
    {
      "id": 2708,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2708",
      "data_updated_at": "2017-10-18T23:11:45.018472Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:16:29.000000Z",
        "slug": "不足",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8D%E8%B6%B3",
        "characters": "不足",
        "meanings": [
          {
            "meaning": "Shortage",
            "primary": true
          },
          {
            "meaning": "Physical Shortage",
            "primary": false
          },
          {
            "meaning": "Insufficient",
            "primary": false
          },
          {
            "meaning": "Not Sufficient",
            "primary": false
          },
          {
            "meaning": "Not Enough",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふそく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "na_adjective"
        ],
        "component_subject_ids": [
          563,
          561
        ]
      }
    },
    {
      "id": 2709,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2709",
      "data_updated_at": "2017-10-18T23:11:43.380419Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:16:36.000000Z",
        "slug": "車",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BB%8A",
        "characters": "車",
        "meanings": [
          {
            "meaning": "Car",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くるま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          562
        ]
      }
    },
    {
      "id": 2710,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2710",
      "data_updated_at": "2017-10-18T23:11:41.001803Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:16:43.000000Z",
        "slug": "車内",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BB%8A%E5%86%85",
        "characters": "車内",
        "meanings": [
          {
            "meaning": "Inside The Car",
            "primary": true
          },
          {
            "meaning": "In The Car",
            "primary": false
          },
          {
            "meaning": "In A Car",
            "primary": false
          },
          {
            "meaning": "Inside A Car",
            "primary": false
          },
          {
            "meaning": "Within The Car",
            "primary": false
          },
          {
            "meaning": "Within A Car",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゃない"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          562,
          500
        ]
      }
    },
    {
      "id": 2711,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2711",
      "data_updated_at": "2017-10-18T23:11:42.501288Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:17:06.000000Z",
        "slug": "世",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%96",
        "characters": "世",
        "meanings": [
          {
            "meaning": "World",
            "primary": true
          },
          {
            "meaning": "Society",
            "primary": false
          },
          {
            "meaning": "Age",
            "primary": false
          },
          {
            "meaning": "Generation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          527
        ]
      }
    },
    {
      "id": 2712,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2712",
      "data_updated_at": "2017-10-18T23:11:43.733951Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:17:16.000000Z",
        "slug": "二世",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E4%B8%96",
        "characters": "二世",
        "meanings": [
          {
            "meaning": "Second Generation",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          527,
          441
        ]
      }
    },
    {
      "id": 2713,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2713",
      "data_updated_at": "2017-10-18T23:11:45.535507Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:17:33.000000Z",
        "slug": "三世",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%89%E4%B8%96",
        "characters": "三世",
        "meanings": [
          {
            "meaning": "Third Generation",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さんせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          527,
          449
        ]
      }
    },
    {
      "id": 2714,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2714",
      "data_updated_at": "2017-10-18T23:11:41.108320Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:17:40.000000Z",
        "slug": "主に",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%BB%E3%81%AB",
        "characters": "主に",
        "meanings": [
          {
            "meaning": "Mainly",
            "primary": true
          },
          {
            "meaning": "Primarily",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おもに"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          528
        ]
      }
    },
    {
      "id": 2715,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2715",
      "data_updated_at": "2017-10-18T23:11:44.071829Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:17:50.000000Z",
        "slug": "主人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%BB%E4%BA%BA",
        "characters": "主人",
        "meanings": [
          {
            "meaning": "Head Of Household",
            "primary": true
          },
          {
            "meaning": "Husband",
            "primary": false
          },
          {
            "meaning": "Head Of A Household",
            "primary": false
          },
          {
            "meaning": "Head Of The Household",
            "primary": false
          },
          {
            "meaning": "Landlord",
            "primary": false
          },
          {
            "meaning": "Master",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅじん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          528,
          444
        ]
      }
    },
    {
      "id": 2716,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2716",
      "data_updated_at": "2017-10-18T23:11:41.456560Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:17:56.000000Z",
        "slug": "仕方",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%95%E6%96%B9",
        "characters": "仕方",
        "meanings": [
          {
            "meaning": "Method",
            "primary": true
          },
          {
            "meaning": "Way",
            "primary": false
          },
          {
            "meaning": "Way Of Doing",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しかた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          564,
          510
        ]
      }
    },
    {
      "id": 2717,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2717",
      "data_updated_at": "2017-10-18T23:11:53.723056Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-03T00:18:06.000000Z",
        "slug": "仕方がない",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%95%E6%96%B9%E3%81%8C%E3%81%AA%E3%81%84",
        "characters": "仕方がない",
        "meanings": [
          {
            "meaning": "Can't Be Helped",
            "primary": true
          },
          {
            "meaning": "It Can't Be Helped",
            "primary": false
          },
          {
            "meaning": "No Use",
            "primary": false
          },
          {
            "meaning": "It's No Use",
            "primary": false
          },
          {
            "meaning": "It Is No Use",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しかたがない"
          }
        ],
        "parts_of_speech": [
          "expression"
        ],
        "component_subject_ids": [
          564,
          510
        ]
      }
    },
    {
      "id": 2718,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2718",
      "data_updated_at": "2017-10-18T23:11:41.328846Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:18:13.000000Z",
        "slug": "他",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%96",
        "characters": "他",
        "meanings": [
          {
            "meaning": "Other",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほか"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          529
        ]
      }
    },
    {
      "id": 2719,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2719",
      "data_updated_at": "2018-03-06T19:43:20.025045Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:18:20.000000Z",
        "slug": "他人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%96%E4%BA%BA",
        "characters": "他人",
        "meanings": [
          {
            "meaning": "Another Person",
            "primary": true
          },
          {
            "meaning": "Other People",
            "primary": false
          },
          {
            "meaning": "Stranger",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たにん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          529,
          444
        ]
      }
    },
    {
      "id": 2720,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2720",
      "data_updated_at": "2017-10-18T23:11:41.893758Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:18:28.000000Z",
        "slug": "代わる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A3%E3%82%8F%E3%82%8B",
        "characters": "代わる",
        "meanings": [
          {
            "meaning": "To Replace",
            "primary": true
          },
          {
            "meaning": "To Substitute For",
            "primary": false
          },
          {
            "meaning": "To Substitute",
            "primary": false
          },
          {
            "meaning": "To Be Replaced",
            "primary": false
          },
          {
            "meaning": "To Be Substituted",
            "primary": false
          },
          {
            "meaning": "To Be Substituted For",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かわる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          530
        ]
      }
    },
    {
      "id": 2721,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2721",
      "data_updated_at": "2017-10-18T23:11:45.348442Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:21:17.000000Z",
        "slug": "一代",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E4%BB%A3",
        "characters": "一代",
        "meanings": [
          {
            "meaning": "Lifetime",
            "primary": true
          },
          {
            "meaning": "One Lifetime",
            "primary": false
          },
          {
            "meaning": "Generation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          530,
          440
        ]
      }
    },
    {
      "id": 2722,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2722",
      "data_updated_at": "2017-10-18T23:11:43.943580Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:21:24.000000Z",
        "slug": "代用",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A3%E7%94%A8",
        "characters": "代用",
        "meanings": [
          {
            "meaning": "Substitution",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいよう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          530,
          525
        ]
      }
    },
    {
      "id": 2723,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2723",
      "data_updated_at": "2017-10-18T23:11:43.805568Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:21:31.000000Z",
        "slug": "写す",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%86%99%E3%81%99",
        "characters": "写す",
        "meanings": [
          {
            "meaning": "To Copy",
            "primary": true
          },
          {
            "meaning": "To Photograph",
            "primary": false
          },
          {
            "meaning": "To Take A Picture",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うつす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          531
        ]
      }
    },
    {
      "id": 2724,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2724",
      "data_updated_at": "2017-10-18T23:11:45.395197Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:21:39.000000Z",
        "slug": "写る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%86%99%E3%82%8B",
        "characters": "写る",
        "meanings": [
          {
            "meaning": "To Be Photographed",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うつる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          531
        ]
      }
    },
    {
      "id": 2725,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2725",
      "data_updated_at": "2017-10-18T23:11:41.210774Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:22:23.000000Z",
        "slug": "号",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%B7",
        "characters": "号",
        "meanings": [
          {
            "meaning": "Number",
            "primary": true
          },
          {
            "meaning": "Edition",
            "primary": false
          },
          {
            "meaning": "Model",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          533
        ]
      }
    },
    {
      "id": 2726,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2726",
      "data_updated_at": "2017-10-18T23:11:44.552095Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:22:30.000000Z",
        "slug": "中央",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E5%A4%AE",
        "characters": "中央",
        "meanings": [
          {
            "meaning": "Center",
            "primary": true
          },
          {
            "meaning": "Central",
            "primary": false
          },
          {
            "meaning": "Centre",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうおう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          534,
          469
        ]
      }
    },
    {
      "id": 2727,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2727",
      "data_updated_at": "2017-10-18T23:11:40.916594Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:22:40.000000Z",
        "slug": "平ら",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B3%E3%82%89",
        "characters": "平ら",
        "meanings": [
          {
            "meaning": "Flat",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいら"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          535
        ]
      }
    },
    {
      "id": 2728,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2728",
      "data_updated_at": "2017-10-18T23:11:44.778827Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:22:47.000000Z",
        "slug": "平日",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B3%E6%97%A5",
        "characters": "平日",
        "meanings": [
          {
            "meaning": "Weekdays",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へいじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          535,
          476
        ]
      }
    },
    {
      "id": 2729,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2729",
      "data_updated_at": "2017-10-18T23:11:43.041717Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:23:19.000000Z",
        "slug": "打つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%89%93%E3%81%A4",
        "characters": "打つ",
        "meanings": [
          {
            "meaning": "To Hit",
            "primary": true
          },
          {
            "meaning": "To Pound",
            "primary": false
          },
          {
            "meaning": "To Type",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うつ"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          536
        ]
      }
    },
    {
      "id": 2730,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2730",
      "data_updated_at": "2017-10-18T23:11:42.981672Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:23:33.000000Z",
        "slug": "一打",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%89%93",
        "characters": "一打",
        "meanings": [
          {
            "meaning": "Strike",
            "primary": true
          },
          {
            "meaning": "Stroke",
            "primary": false
          },
          {
            "meaning": "Blow",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちだ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          536,
          440
        ]
      }
    },
    {
      "id": 2731,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2731",
      "data_updated_at": "2017-10-18T23:11:42.831479Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:23:41.000000Z",
        "slug": "氷",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%B7",
        "characters": "氷",
        "meanings": [
          {
            "meaning": "Ice",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こおり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          537
        ]
      }
    },
    {
      "id": 2732,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2732",
      "data_updated_at": "2017-10-18T23:11:42.061677Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:23:53.000000Z",
        "slug": "かき氷",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8B%E3%81%8D%E6%B0%B7",
        "characters": "かき氷",
        "meanings": [
          {
            "meaning": "Shaved Ice",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かきごおり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          537
        ]
      }
    },
    {
      "id": 2733,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2733",
      "data_updated_at": "2017-10-18T23:11:41.949878Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:24:00.000000Z",
        "slug": "申す",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%B3%E3%81%99",
        "characters": "申す",
        "meanings": [
          {
            "meaning": "To Say Humbly",
            "primary": true
          },
          {
            "meaning": "To Say",
            "primary": false
          },
          {
            "meaning": "To Humbly Say",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もうす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          538
        ]
      }
    },
    {
      "id": 2734,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2734",
      "data_updated_at": "2017-10-18T23:11:45.490421Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:24:07.000000Z",
        "slug": "申し申し",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%B3%E3%81%97%E7%94%B3%E3%81%97",
        "characters": "申し申し",
        "meanings": [
          {
            "meaning": "Telephone Hello",
            "primary": true
          },
          {
            "meaning": "Hello",
            "primary": false
          },
          {
            "meaning": "Hello On Telephone",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もうしもうし"
          },
          {
            "primary": false,
            "reading": "もしもし"
          }
        ],
        "parts_of_speech": [
          "interjection"
        ],
        "component_subject_ids": [
          538
        ]
      }
    },
    {
      "id": 2735,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2735",
      "data_updated_at": "2017-10-18T23:11:43.513014Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:24:15.000000Z",
        "slug": "皮",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9A%AE",
        "characters": "皮",
        "meanings": [
          {
            "meaning": "Skin",
            "primary": true
          },
          {
            "meaning": "Hide",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かわ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          539
        ]
      }
    },
    {
      "id": 2736,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2736",
      "data_updated_at": "2017-10-18T23:11:43.097265Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:24:33.000000Z",
        "slug": "皿",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9A%BF",
        "characters": "皿",
        "meanings": [
          {
            "meaning": "Plate",
            "primary": true
          },
          {
            "meaning": "Dish",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さら"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          540
        ]
      }
    },
    {
      "id": 2737,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2737",
      "data_updated_at": "2017-10-18T23:11:43.219599Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:24:39.000000Z",
        "slug": "小皿",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%8F%E7%9A%BF",
        "characters": "小皿",
        "meanings": [
          {
            "meaning": "Small Plate",
            "primary": true
          },
          {
            "meaning": "Small Dish",
            "primary": false
          },
          {
            "meaning": "Little Plate",
            "primary": false
          },
          {
            "meaning": "Little Dish",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こざら"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          540,
          463
        ]
      }
    },
    {
      "id": 2738,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2738",
      "data_updated_at": "2017-10-18T23:11:40.281329Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:24:50.000000Z",
        "slug": "お礼",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E7%A4%BC",
        "characters": "お礼",
        "meanings": [
          {
            "meaning": "Thanks",
            "primary": true
          },
          {
            "meaning": "Gratitude",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おれい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          541
        ]
      }
    },
    {
      "id": 2739,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2739",
      "data_updated_at": "2017-10-18T23:11:42.450471Z",
      "data": {
        "level": 4,
        "created_at": "2012-03-03T00:25:32.000000Z",
        "slug": "不正",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8D%E6%AD%A3",
        "characters": "不正",
        "meanings": [
          {
            "meaning": "Injustice",
            "primary": true
          },
          {
            "meaning": "Unfairness",
            "primary": false
          },
          {
            "meaning": "Dishonesty",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふせい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          563,
          488
        ]
      }
    },
    {
      "id": 2740,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2740",
      "data_updated_at": "2017-10-18T23:11:51.758712Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:15:58.000000Z",
        "slug": "交ぜる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%A4%E3%81%9C%E3%82%8B",
        "characters": "交ぜる",
        "meanings": [
          {
            "meaning": "To Mix",
            "primary": true
          },
          {
            "meaning": "To Mix Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まぜる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          565
        ]
      }
    },
    {
      "id": 2741,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2741",
      "data_updated_at": "2017-10-18T23:11:48.696643Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:13.000000Z",
        "slug": "大会",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E4%BC%9A",
        "characters": "大会",
        "meanings": [
          {
            "meaning": "Convention",
            "primary": true
          },
          {
            "meaning": "Tournament",
            "primary": false
          },
          {
            "meaning": "Meetup",
            "primary": false
          },
          {
            "meaning": "Event",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいかい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          566,
          453
        ]
      }
    },
    {
      "id": 2742,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2742",
      "data_updated_at": "2017-10-18T23:11:49.935484Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:21.000000Z",
        "slug": "会う",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%9A%E3%81%86",
        "characters": "会う",
        "meanings": [
          {
            "meaning": "To Meet",
            "primary": true
          },
          {
            "meaning": "To Encounter",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あう"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          566
        ]
      }
    },
    {
      "id": 2743,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2743",
      "data_updated_at": "2017-10-18T23:11:48.816542Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:30.000000Z",
        "slug": "光",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%89",
        "characters": "光",
        "meanings": [
          {
            "meaning": "Light",
            "primary": true
          },
          {
            "meaning": "Sunlight",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひかり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          567
        ]
      }
    },
    {
      "id": 2744,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2744",
      "data_updated_at": "2017-11-01T23:15:27.793166Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:37.000000Z",
        "slug": "光年",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%89%E5%B9%B4",
        "characters": "光年",
        "meanings": [
          {
            "meaning": "Light Year",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          567,
          546
        ]
      }
    },
    {
      "id": 2745,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2745",
      "data_updated_at": "2017-10-18T23:11:49.312823Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:44.000000Z",
        "slug": "月光",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%88%E5%85%89",
        "characters": "月光",
        "meanings": [
          {
            "meaning": "Moonlight",
            "primary": true
          },
          {
            "meaning": "Moonbeam",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "げっこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          567,
          477
        ]
      }
    },
    {
      "id": 2746,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2746",
      "data_updated_at": "2017-10-18T23:11:49.033235Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:50.000000Z",
        "slug": "日光",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A5%E5%85%89",
        "characters": "日光",
        "meanings": [
          {
            "meaning": "Sunlight",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にっこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          567,
          476
        ]
      }
    },
    {
      "id": 2747,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2747",
      "data_updated_at": "2017-10-18T23:11:49.090347Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:16:57.000000Z",
        "slug": "同じ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8C%E3%81%98",
        "characters": "同じ",
        "meanings": [
          {
            "meaning": "Same",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おなじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          568
        ]
      }
    },
    {
      "id": 2748,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2748",
      "data_updated_at": "2017-10-18T23:11:49.158358Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:03.000000Z",
        "slug": "同日",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8C%E6%97%A5",
        "characters": "同日",
        "meanings": [
          {
            "meaning": "Same Day",
            "primary": true
          },
          {
            "meaning": "The Same Day",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どうじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          568,
          476
        ]
      }
    },
    {
      "id": 2749,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2749",
      "data_updated_at": "2017-10-18T23:11:46.557318Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:10.000000Z",
        "slug": "〜回",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E5%9B%9E",
        "characters": "〜回",
        "meanings": [
          {
            "meaning": "Times",
            "primary": true
          },
          {
            "meaning": "Number Of Times",
            "primary": false
          },
          {
            "meaning": "Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かい"
          }
        ],
        "parts_of_speech": [
          "counter"
        ],
        "component_subject_ids": [
          569
        ]
      }
    },
    {
      "id": 2750,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2750",
      "data_updated_at": "2017-10-18T23:11:52.230923Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:22.000000Z",
        "slug": "回る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9E%E3%82%8B",
        "characters": "回る",
        "meanings": [
          {
            "meaning": "To Revolve",
            "primary": true
          },
          {
            "meaning": "To Go Around",
            "primary": false
          },
          {
            "meaning": "To Rotate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まわる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          569
        ]
      }
    },
    {
      "id": 2751,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2751",
      "data_updated_at": "2017-10-18T23:11:46.604130Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:30.000000Z",
        "slug": "一回",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E5%9B%9E",
        "characters": "一回",
        "meanings": [
          {
            "meaning": "One Time",
            "primary": true
          },
          {
            "meaning": "Once",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いっかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          569,
          440
        ]
      }
    },
    {
      "id": 2752,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2752",
      "data_updated_at": "2017-10-18T23:11:45.657245Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:36.000000Z",
        "slug": "今回",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E5%9B%9E",
        "characters": "今回",
        "meanings": [
          {
            "meaning": "This Time",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          569,
          497
        ]
      }
    },
    {
      "id": 2753,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2753",
      "data_updated_at": "2017-10-18T23:11:50.749187Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:42.000000Z",
        "slug": "毎回",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%8E%E5%9B%9E",
        "characters": "毎回",
        "meanings": [
          {
            "meaning": "Every Time",
            "primary": true
          },
          {
            "meaning": "Each Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まいかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          572,
          569
        ]
      }
    },
    {
      "id": 2754,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2754",
      "data_updated_at": "2017-10-18T23:11:48.248190Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:17:56.000000Z",
        "slug": "多い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%9A%E3%81%84",
        "characters": "多い",
        "meanings": [
          {
            "meaning": "Many",
            "primary": true
          },
          {
            "meaning": "Much",
            "primary": false
          },
          {
            "meaning": "Lots Of",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おおい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          570
        ]
      }
    },
    {
      "id": 2755,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2755",
      "data_updated_at": "2017-10-18T23:11:50.369874Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:18:03.000000Z",
        "slug": "多分",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%9A%E5%88%86",
        "characters": "多分",
        "meanings": [
          {
            "meaning": "Maybe",
            "primary": true
          },
          {
            "meaning": "Perhaps",
            "primary": false
          },
          {
            "meaning": "Probably",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たぶん"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun"
        ],
        "component_subject_ids": [
          570,
          501
        ]
      }
    },
    {
      "id": 2756,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2756",
      "data_updated_at": "2017-11-17T17:59:19.238281Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:18:27.000000Z",
        "slug": "当たる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%93%E3%81%9F%E3%82%8B",
        "characters": "当たる",
        "meanings": [
          {
            "meaning": "To Be On Target",
            "primary": true
          },
          {
            "meaning": "To Hit",
            "primary": false
          },
          {
            "meaning": "To Touch",
            "primary": false
          },
          {
            "meaning": "To Guess Correctly",
            "primary": false
          },
          {
            "meaning": "To Guess Right",
            "primary": false
          },
          {
            "meaning": "To Be Right",
            "primary": false
          },
          {
            "meaning": "To Hit The Target",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あたる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          571
        ]
      }
    },
    {
      "id": 2757,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2757",
      "data_updated_at": "2017-10-18T23:11:52.188165Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:18:38.000000Z",
        "slug": "当たり",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%93%E3%81%9F%E3%82%8A",
        "characters": "当たり",
        "meanings": [
          {
            "meaning": "A Success",
            "primary": true
          },
          {
            "meaning": "Success",
            "primary": false
          },
          {
            "meaning": "Hit",
            "primary": false
          },
          {
            "meaning": "Guess",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あたり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          571
        ]
      }
    },
    {
      "id": 2758,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2758",
      "data_updated_at": "2017-10-18T23:11:47.443651Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:18:57.000000Z",
        "slug": "毎月",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%8E%E6%9C%88",
        "characters": "毎月",
        "meanings": [
          {
            "meaning": "Every Month",
            "primary": true
          },
          {
            "meaning": "Monthly",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まいげつ"
          },
          {
            "primary": false,
            "reading": "まいつき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          572,
          477
        ]
      }
    },
    {
      "id": 2759,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2759",
      "data_updated_at": "2017-10-18T23:11:46.515975Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:19:05.000000Z",
        "slug": "毎日",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%8E%E6%97%A5",
        "characters": "毎日",
        "meanings": [
          {
            "meaning": "Every Day",
            "primary": true
          },
          {
            "meaning": "Daily",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まいにち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          572,
          476
        ]
      }
    },
    {
      "id": 2760,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2760",
      "data_updated_at": "2017-10-18T23:11:47.606274Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:19:11.000000Z",
        "slug": "毎年",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%8E%E5%B9%B4",
        "characters": "毎年",
        "meanings": [
          {
            "meaning": "Every Year",
            "primary": true
          },
          {
            "meaning": "Yearly",
            "primary": false
          },
          {
            "meaning": "Annually",
            "primary": false
          },
          {
            "meaning": "Each Year",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まいとし"
          },
          {
            "primary": false,
            "reading": "まいねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          572,
          546
        ]
      }
    },
    {
      "id": 2761,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2761",
      "data_updated_at": "2017-10-18T23:11:45.784628Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:19:27.000000Z",
        "slug": "池",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B1%A0",
        "characters": "池",
        "meanings": [
          {
            "meaning": "Pond",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いけ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          573
        ]
      }
    },
    {
      "id": 2762,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2762",
      "data_updated_at": "2017-10-18T23:11:48.766854Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:19:38.000000Z",
        "slug": "米",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B1%B3",
        "characters": "米",
        "meanings": [
          {
            "meaning": "Rice",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こめ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          574
        ]
      }
    },
    {
      "id": 2763,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2763",
      "data_updated_at": "2017-10-18T23:11:47.680078Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:19:45.000000Z",
        "slug": "羽",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%BE%BD",
        "characters": "羽",
        "meanings": [
          {
            "meaning": "Feathers",
            "primary": true
          },
          {
            "meaning": "Feather",
            "primary": false
          },
          {
            "meaning": "Wing",
            "primary": false
          },
          {
            "meaning": "Wings",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はね"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          575
        ]
      }
    },
    {
      "id": 2764,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2764",
      "data_updated_at": "2017-10-18T23:11:51.112090Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:19:52.000000Z",
        "slug": "考え",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%80%83%E3%81%88",
        "characters": "考え",
        "meanings": [
          {
            "meaning": "Thought",
            "primary": true
          },
          {
            "meaning": "A Thought",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かんがえ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          576
        ]
      }
    },
    {
      "id": 2765,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2765",
      "data_updated_at": "2017-10-18T23:11:51.158948Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:00.000000Z",
        "slug": "考える",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%80%83%E3%81%88%E3%82%8B",
        "characters": "考える",
        "meanings": [
          {
            "meaning": "To Think About",
            "primary": true
          },
          {
            "meaning": "To Consider",
            "primary": false
          },
          {
            "meaning": "To Give Thought",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かんがえる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          576
        ]
      }
    },
    {
      "id": 2766,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2766",
      "data_updated_at": "2017-10-18T23:11:51.280538Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:13.000000Z",
        "slug": "考え方",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%80%83%E3%81%88%E6%96%B9",
        "characters": "考え方",
        "meanings": [
          {
            "meaning": "Way Of Thinking",
            "primary": true
          },
          {
            "meaning": "Thought Process",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かんがえかた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          576,
          510
        ]
      }
    },
    {
      "id": 2767,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2767",
      "data_updated_at": "2017-10-18T23:11:45.744773Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:22.000000Z",
        "slug": "肉",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%82%89",
        "characters": "肉",
        "meanings": [
          {
            "meaning": "Meat",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          577
        ]
      }
    },
    {
      "id": 2768,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2768",
      "data_updated_at": "2017-10-18T23:11:47.219520Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:28.000000Z",
        "slug": "牛肉",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%89%9B%E8%82%89",
        "characters": "牛肉",
        "meanings": [
          {
            "meaning": "Beef",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぎゅうにく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          577,
          511
        ]
      }
    },
    {
      "id": 2769,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2769",
      "data_updated_at": "2017-10-18T23:11:50.957207Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:34.000000Z",
        "slug": "皮肉",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9A%AE%E8%82%89",
        "characters": "皮肉",
        "meanings": [
          {
            "meaning": "Irony",
            "primary": true
          },
          {
            "meaning": "Sarcasm",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひにく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          577,
          539
        ]
      }
    },
    {
      "id": 2770,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2770",
      "data_updated_at": "2017-10-18T23:11:48.376610Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:41.000000Z",
        "slug": "自分",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%87%AA%E5%88%86",
        "characters": "自分",
        "meanings": [
          {
            "meaning": "Oneself",
            "primary": true
          },
          {
            "meaning": "Myself",
            "primary": false
          },
          {
            "meaning": "Self",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じぶん"
          }
        ],
        "parts_of_speech": [
          "pronoun",
          "no_adjective"
        ],
        "component_subject_ids": [
          578,
          501
        ]
      }
    },
    {
      "id": 2771,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2771",
      "data_updated_at": "2017-10-18T23:11:51.015146Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:20:54.000000Z",
        "slug": "自立",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%87%AA%E7%AB%8B",
        "characters": "自立",
        "meanings": [
          {
            "meaning": "Independence",
            "primary": true
          },
          {
            "meaning": "Self Reliance",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じりつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          578,
          494
        ]
      }
    },
    {
      "id": 2772,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2772",
      "data_updated_at": "2017-10-18T23:11:45.699375Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:21:00.000000Z",
        "slug": "色",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%89%B2",
        "characters": "色",
        "meanings": [
          {
            "meaning": "Color",
            "primary": true
          },
          {
            "meaning": "Colour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いろ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          579
        ]
      }
    },
    {
      "id": 2773,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2773",
      "data_updated_at": "2017-10-18T23:11:51.204189Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:21:08.000000Z",
        "slug": "色々",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%89%B2%E3%80%85",
        "characters": "色々",
        "meanings": [
          {
            "meaning": "Various",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いろいろ"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          856,
          579
        ]
      }
    },
    {
      "id": 2774,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2774",
      "data_updated_at": "2017-10-18T23:11:51.062796Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:21:15.000000Z",
        "slug": "水色",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%B4%E8%89%B2",
        "characters": "水色",
        "meanings": [
          {
            "meaning": "Sky Blue",
            "primary": true
          },
          {
            "meaning": "Light Blue",
            "primary": false
          },
          {
            "meaning": "Light Blue Color",
            "primary": false
          },
          {
            "meaning": "Light Blue Colour",
            "primary": false
          },
          {
            "meaning": "Sky Blue Color",
            "primary": false
          },
          {
            "meaning": "Sky Blue Colour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みずいろ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          579,
          479
        ]
      }
    },
    {
      "id": 2775,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2775",
      "data_updated_at": "2017-10-18T23:11:51.324249Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:21:22.000000Z",
        "slug": "行く",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A1%8C%E3%81%8F",
        "characters": "行く",
        "meanings": [
          {
            "meaning": "To Go",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          580
        ]
      }
    },
    {
      "id": 2776,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2776",
      "data_updated_at": "2017-10-18T23:11:49.876988Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:21:41.000000Z",
        "slug": "行う",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A1%8C%E3%81%86",
        "characters": "行う",
        "meanings": [
          {
            "meaning": "To Carry Out A Task",
            "primary": true
          },
          {
            "meaning": "To Carry Out",
            "primary": false
          },
          {
            "meaning": "To Perform",
            "primary": false
          },
          {
            "meaning": "To Perform A Task",
            "primary": false
          },
          {
            "meaning": "To Do A Task",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おこなう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          580
        ]
      }
    },
    {
      "id": 2777,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2777",
      "data_updated_at": "2017-10-18T23:11:51.411164Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:21:58.000000Z",
        "slug": "行き",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A1%8C%E3%81%8D",
        "characters": "行き",
        "meanings": [
          {
            "meaning": "Train Direction",
            "primary": true
          },
          {
            "meaning": "Bound For",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆき"
          },
          {
            "primary": false,
            "reading": "いき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          580
        ]
      }
    },
    {
      "id": 2778,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2778",
      "data_updated_at": "2017-10-18T23:11:51.507197Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:22:09.000000Z",
        "slug": "西",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A5%BF",
        "characters": "西",
        "meanings": [
          {
            "meaning": "West",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          581
        ]
      }
    },
    {
      "id": 2779,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2779",
      "data_updated_at": "2017-10-18T23:11:46.102325Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:22:17.000000Z",
        "slug": "北西",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8C%97%E8%A5%BF",
        "characters": "北西",
        "meanings": [
          {
            "meaning": "Northwest",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほくせい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          581,
          517
        ]
      }
    },
    {
      "id": 2780,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2780",
      "data_updated_at": "2017-10-18T23:11:49.689291Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:22:23.000000Z",
        "slug": "何千",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E5%8D%83",
        "characters": "何千",
        "meanings": [
          {
            "meaning": "Thousands",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんぜん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          582,
          460
        ]
      }
    },
    {
      "id": 2781,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2781",
      "data_updated_at": "2017-10-18T23:11:46.325260Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:22:35.000000Z",
        "slug": "何",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95",
        "characters": "何",
        "meanings": [
          {
            "meaning": "What",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なに"
          },
          {
            "primary": false,
            "reading": "なん"
          }
        ],
        "parts_of_speech": [
          "pronoun",
          "interjection",
          "no_adjective"
        ],
        "component_subject_ids": [
          582
        ]
      }
    },
    {
      "id": 2782,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2782",
      "data_updated_at": "2017-10-18T23:11:45.989551Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:22:42.000000Z",
        "slug": "何人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E4%BA%BA",
        "characters": "何人",
        "meanings": [
          {
            "meaning": "How Many People",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんにん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          582,
          444
        ]
      }
    },
    {
      "id": 2783,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2783",
      "data_updated_at": "2017-10-18T23:11:48.977984Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:22:50.000000Z",
        "slug": "何月",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E6%9C%88",
        "characters": "何月",
        "meanings": [
          {
            "meaning": "What Month",
            "primary": true
          },
          {
            "meaning": "Which Month",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんがつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          582,
          477
        ]
      }
    },
    {
      "id": 2784,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2784",
      "data_updated_at": "2017-10-18T23:11:47.945461Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:02.000000Z",
        "slug": "何日",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E6%97%A5",
        "characters": "何日",
        "meanings": [
          {
            "meaning": "How Many Days",
            "primary": true
          },
          {
            "meaning": "What Day",
            "primary": false
          },
          {
            "meaning": "Which Day",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんにち"
          }
        ],
        "parts_of_speech": [
          "expression"
        ],
        "component_subject_ids": [
          582,
          476
        ]
      }
    },
    {
      "id": 2785,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2785",
      "data_updated_at": "2017-10-18T23:11:51.803627Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:18.000000Z",
        "slug": "何年",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E5%B9%B4",
        "characters": "何年",
        "meanings": [
          {
            "meaning": "What Year",
            "primary": true
          },
          {
            "meaning": "How Many Years",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          582,
          546
        ]
      }
    },
    {
      "id": 2786,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2786",
      "data_updated_at": "2017-10-18T23:11:48.883023Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:24.000000Z",
        "slug": "何回",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E5%9B%9E",
        "characters": "何回",
        "meanings": [
          {
            "meaning": "How Many Times",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          582,
          569
        ]
      }
    },
    {
      "id": 2787,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2787",
      "data_updated_at": "2017-10-18T23:11:50.418814Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:31.000000Z",
        "slug": "学ぶ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E3%81%B6",
        "characters": "学ぶ",
        "meanings": [
          {
            "meaning": "To Learn",
            "primary": true
          },
          {
            "meaning": "To Study In Depth",
            "primary": false
          },
          {
            "meaning": "To Study",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まなぶ"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          599
        ]
      }
    },
    {
      "id": 2788,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2788",
      "data_updated_at": "2017-10-18T23:11:49.492330Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:37.000000Z",
        "slug": "学生",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E7%94%9F",
        "characters": "学生",
        "meanings": [
          {
            "meaning": "Student",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がくせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          599
        ]
      }
    },
    {
      "id": 2789,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2789",
      "data_updated_at": "2017-10-18T23:11:49.267891Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:47.000000Z",
        "slug": "学年",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E5%B9%B4",
        "characters": "学年",
        "meanings": [
          {
            "meaning": "School Grade",
            "primary": true
          },
          {
            "meaning": "Grade In School",
            "primary": false
          },
          {
            "meaning": "School Year",
            "primary": false
          },
          {
            "meaning": "Year In School",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がくねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          599,
          546
        ]
      }
    },
    {
      "id": 2790,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2790",
      "data_updated_at": "2017-10-18T23:11:49.211422Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:23:54.000000Z",
        "slug": "入学",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E5%AD%A6",
        "characters": "入学",
        "meanings": [
          {
            "meaning": "School Admission",
            "primary": true
          },
          {
            "meaning": "Entry Into School",
            "primary": false
          },
          {
            "meaning": "Admission Into School",
            "primary": false
          },
          {
            "meaning": "School Entry",
            "primary": false
          },
          {
            "meaning": "Entering A School",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にゅうがく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          599,
          445
        ]
      }
    },
    {
      "id": 2791,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2791",
      "data_updated_at": "2017-10-18T23:11:46.471722Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:24:03.000000Z",
        "slug": "工学",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A5%E5%AD%A6",
        "characters": "工学",
        "meanings": [
          {
            "meaning": "Engineering",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          599,
          457
        ]
      }
    },
    {
      "id": 2792,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2792",
      "data_updated_at": "2017-10-18T23:11:45.832307Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:24:11.000000Z",
        "slug": "大学",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E5%AD%A6",
        "characters": "大学",
        "meanings": [
          {
            "meaning": "University",
            "primary": true
          },
          {
            "meaning": "College",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          599,
          453
        ]
      }
    },
    {
      "id": 2793,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2793",
      "data_updated_at": "2017-10-18T23:11:46.907228Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:24:41.000000Z",
        "slug": "休学",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%91%E5%AD%A6",
        "characters": "休学",
        "meanings": [
          {
            "meaning": "Absent From School",
            "primary": true
          },
          {
            "meaning": "Absence From School",
            "primary": false
          },
          {
            "meaning": "School Absence",
            "primary": false
          },
          {
            "meaning": "Leave Of Absence",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゅうがく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          599,
          542
        ]
      }
    },
    {
      "id": 2794,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2794",
      "data_updated_at": "2017-10-18T23:11:49.611135Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:24:48.000000Z",
        "slug": "林",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9E%97",
        "characters": "林",
        "meanings": [
          {
            "meaning": "Forest",
            "primary": true
          },
          {
            "meaning": "Woods",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はやし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          600
        ]
      }
    },
    {
      "id": 2795,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2795",
      "data_updated_at": "2017-10-18T23:11:51.977900Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:01.000000Z",
        "slug": "空気",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A9%BA%E6%B0%97",
        "characters": "空気",
        "meanings": [
          {
            "meaning": "Air",
            "primary": true
          },
          {
            "meaning": "Atmosphere",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くうき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          601,
          548
        ]
      }
    },
    {
      "id": 2796,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2796",
      "data_updated_at": "2017-10-18T23:11:50.838958Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:08.000000Z",
        "slug": "空",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A9%BA",
        "characters": "空",
        "meanings": [
          {
            "meaning": "Sky",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そら"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          601
        ]
      }
    },
    {
      "id": 2797,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2797",
      "data_updated_at": "2017-10-18T23:11:47.777982Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:15.000000Z",
        "slug": "金",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%91",
        "characters": "金",
        "meanings": [
          {
            "meaning": "Gold",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きん"
          },
          {
            "primary": false,
            "reading": "かね"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          602
        ]
      }
    },
    {
      "id": 2798,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2798",
      "data_updated_at": "2017-10-18T23:11:49.548384Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:22.000000Z",
        "slug": "金玉",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%91%E7%8E%89",
        "characters": "金玉",
        "meanings": [
          {
            "meaning": "Testicles",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きんたま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          602,
          489
        ]
      }
    },
    {
      "id": 2799,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2799",
      "data_updated_at": "2017-10-18T23:11:52.609370Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:29.000000Z",
        "slug": "お金",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E9%87%91",
        "characters": "お金",
        "meanings": [
          {
            "meaning": "Money",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おかね"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          602
        ]
      }
    },
    {
      "id": 2800,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2800",
      "data_updated_at": "2017-10-25T18:49:16.821867Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:35.000000Z",
        "slug": "雨",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%A8",
        "characters": "雨",
        "meanings": [
          {
            "meaning": "Rain",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あめ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          603
        ]
      }
    },
    {
      "id": 2801,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2801",
      "data_updated_at": "2017-10-18T23:11:51.656110Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:42.000000Z",
        "slug": "青い",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9D%92%E3%81%84",
        "characters": "青い",
        "meanings": [
          {
            "meaning": "Blue",
            "primary": true
          },
          {
            "meaning": "Unripe",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あおい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          604
        ]
      }
    },
    {
      "id": 2802,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2802",
      "data_updated_at": "2017-10-18T23:11:51.705848Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:25:49.000000Z",
        "slug": "青年",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9D%92%E5%B9%B4",
        "characters": "青年",
        "meanings": [
          {
            "meaning": "Youth",
            "primary": true
          },
          {
            "meaning": "Young Man",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せいねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          604,
          546
        ]
      }
    },
    {
      "id": 2803,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2803",
      "data_updated_at": "2017-10-18T23:11:45.938347Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:26:06.000000Z",
        "slug": "草",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8D%89",
        "characters": "草",
        "meanings": [
          {
            "meaning": "Grass",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くさ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          605
        ]
      }
    },
    {
      "id": 2804,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2804",
      "data_updated_at": "2017-10-18T23:11:49.374537Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-06T08:26:14.000000Z",
        "slug": "音",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9F%B3",
        "characters": "音",
        "meanings": [
          {
            "meaning": "Sound",
            "primary": true
          },
          {
            "meaning": "Noise",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おと"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          606
        ]
      }
    },
    {
      "id": 2805,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2805",
      "data_updated_at": "2017-10-18T23:11:50.185592Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:28:22.000000Z",
        "slug": "作る",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E3%82%8B",
        "characters": "作る",
        "meanings": [
          {
            "meaning": "To Make",
            "primary": true
          },
          {
            "meaning": "To Build",
            "primary": false
          },
          {
            "meaning": "To Create",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つくる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          584
        ]
      }
    },
    {
      "id": 2806,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2806",
      "data_updated_at": "2017-10-18T23:11:49.763026Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:29:00.000000Z",
        "slug": "体",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%93",
        "characters": "体",
        "meanings": [
          {
            "meaning": "Body",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "からだ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          583
        ]
      }
    },
    {
      "id": 2807,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2807",
      "data_updated_at": "2017-10-18T23:11:48.926025Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:29:07.000000Z",
        "slug": "体力",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%93%E5%8A%9B",
        "characters": "体力",
        "meanings": [
          {
            "meaning": "Physical Strength",
            "primary": true
          },
          {
            "meaning": "Physical Power",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいりょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          583,
          447
        ]
      }
    },
    {
      "id": 2808,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2808",
      "data_updated_at": "2017-10-18T23:11:48.120749Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:29:16.000000Z",
        "slug": "体内",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%93%E5%86%85",
        "characters": "体内",
        "meanings": [
          {
            "meaning": "Internal",
            "primary": true
          },
          {
            "meaning": "Within The Body",
            "primary": false
          },
          {
            "meaning": "Inside The Body",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいない"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          583,
          500
        ]
      }
    },
    {
      "id": 2809,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2809",
      "data_updated_at": "2017-10-18T23:11:46.378870Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:29:36.000000Z",
        "slug": "作文",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E6%96%87",
        "characters": "作文",
        "meanings": [
          {
            "meaning": "Composition",
            "primary": true
          },
          {
            "meaning": "Writing",
            "primary": false
          },
          {
            "meaning": "Essay",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さくぶん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          584,
          475
        ]
      }
    },
    {
      "id": 2810,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2810",
      "data_updated_at": "2017-10-18T23:11:50.035481Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:29:49.000000Z",
        "slug": "作用",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E7%94%A8",
        "characters": "作用",
        "meanings": [
          {
            "meaning": "Action",
            "primary": true
          },
          {
            "meaning": "Effect",
            "primary": false
          },
          {
            "meaning": "Operation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さよう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          584,
          525
        ]
      }
    },
    {
      "id": 2811,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2811",
      "data_updated_at": "2017-10-18T23:11:50.088304Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:30:26.000000Z",
        "slug": "工作",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A5%E4%BD%9C",
        "characters": "工作",
        "meanings": [
          {
            "meaning": "Construction",
            "primary": true
          },
          {
            "meaning": "Handicraft",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうさく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          584,
          457
        ]
      }
    },
    {
      "id": 2812,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2812",
      "data_updated_at": "2017-10-18T23:11:47.078366Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:30:38.000000Z",
        "slug": "大作",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E4%BD%9C",
        "characters": "大作",
        "meanings": [
          {
            "meaning": "An Epic",
            "primary": true
          },
          {
            "meaning": "Epic",
            "primary": false
          },
          {
            "meaning": "Epic Saga",
            "primary": false
          },
          {
            "meaning": "Masterpiece",
            "primary": false
          },
          {
            "meaning": "Masterwork",
            "primary": false
          },
          {
            "meaning": "Magnum Opus",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいさく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          584,
          453
        ]
      }
    },
    {
      "id": 2813,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2813",
      "data_updated_at": "2017-10-18T23:11:47.486395Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:30:53.000000Z",
        "slug": "図",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%B3",
        "characters": "図",
        "meanings": [
          {
            "meaning": "Diagram",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ず"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          585
        ]
      }
    },
    {
      "id": 2814,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2814",
      "data_updated_at": "2017-10-18T23:11:46.282044Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:31:09.000000Z",
        "slug": "声",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A3%B0",
        "characters": "声",
        "meanings": [
          {
            "meaning": "Voice",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こえ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          586
        ]
      }
    },
    {
      "id": 2815,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2815",
      "data_updated_at": "2017-10-18T23:11:48.180610Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:31:16.000000Z",
        "slug": "大声",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E5%A3%B0",
        "characters": "大声",
        "meanings": [
          {
            "meaning": "Large Voice",
            "primary": true
          },
          {
            "meaning": "Loud Voice",
            "primary": false
          },
          {
            "meaning": "Big Voice",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おおごえ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          586,
          453
        ]
      }
    },
    {
      "id": 2816,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2816",
      "data_updated_at": "2017-10-18T23:11:46.757948Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:31:23.000000Z",
        "slug": "売る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A3%B2%E3%82%8B",
        "characters": "売る",
        "meanings": [
          {
            "meaning": "To Sell",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          587
        ]
      }
    },
    {
      "id": 2817,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2817",
      "data_updated_at": "2017-10-18T23:11:47.016709Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:31:46.000000Z",
        "slug": "売り上げ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A3%B2%E3%82%8A%E4%B8%8A%E3%81%92",
        "characters": "売り上げ",
        "meanings": [
          {
            "meaning": "Amount Sold",
            "primary": true
          },
          {
            "meaning": "Sales",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うりあげ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          587,
          450
        ]
      }
    },
    {
      "id": 2818,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2818",
      "data_updated_at": "2017-10-18T23:11:50.313143Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:31:54.000000Z",
        "slug": "売り切れ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A3%B2%E3%82%8A%E5%88%87%E3%82%8C",
        "characters": "売り切れ",
        "meanings": [
          {
            "meaning": "Sold Out",
            "primary": true
          },
          {
            "meaning": "Out Of Stock",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うりきれ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          587,
          502
        ]
      }
    },
    {
      "id": 2819,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2819",
      "data_updated_at": "2017-10-18T23:11:50.266271Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:32:02.000000Z",
        "slug": "売り手",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A3%B2%E3%82%8A%E6%89%8B",
        "characters": "売り手",
        "meanings": [
          {
            "meaning": "Seller",
            "primary": true
          },
          {
            "meaning": "Vendor",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うりて"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          587,
          474
        ]
      }
    },
    {
      "id": 2820,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2820",
      "data_updated_at": "2017-10-18T23:11:51.887889Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:32:17.000000Z",
        "slug": "弟",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%9F",
        "characters": "弟",
        "meanings": [
          {
            "meaning": "Younger Brother",
            "primary": true
          },
          {
            "meaning": "Little Brother",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おとうと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          588
        ]
      }
    },
    {
      "id": 2821,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2821",
      "data_updated_at": "2017-10-18T23:11:50.527997Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:32:23.000000Z",
        "slug": "兄弟",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%84%E5%BC%9F",
        "characters": "兄弟",
        "meanings": [
          {
            "meaning": "Siblings",
            "primary": true
          },
          {
            "meaning": "Brothers And Sisters",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          588,
          515
        ]
      }
    },
    {
      "id": 2822,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2822",
      "data_updated_at": "2017-10-18T23:12:02.085850Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-08T23:32:37.000000Z",
        "slug": "形",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%A2",
        "characters": "形",
        "meanings": [
          {
            "meaning": "Shape",
            "primary": true
          },
          {
            "meaning": "Appearance",
            "primary": false
          },
          {
            "meaning": "Form",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かたち"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          589
        ]
      }
    },
    {
      "id": 2823,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2823",
      "data_updated_at": "2017-10-18T23:12:18.913571Z",
      "data": {
        "level": 9,
        "created_at": "2012-03-08T23:33:07.000000Z",
        "slug": "ハート形",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%83%8F%E3%83%BC%E3%83%88%E5%BD%A2",
        "characters": "ハート形",
        "meanings": [
          {
            "meaning": "Heart Shaped",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ハートがた"
          },
          {
            "primary": false,
            "reading": "はーとがた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          589
        ]
      }
    },
    {
      "id": 2824,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2824",
      "data_updated_at": "2017-10-18T23:11:48.479327Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:33:21.000000Z",
        "slug": "来る",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%A5%E3%82%8B",
        "characters": "来る",
        "meanings": [
          {
            "meaning": "To Come",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb"
        ],
        "component_subject_ids": [
          590
        ]
      }
    },
    {
      "id": 2825,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2825",
      "data_updated_at": "2017-10-18T23:11:48.308256Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:33:28.000000Z",
        "slug": "来月",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%A5%E6%9C%88",
        "characters": "来月",
        "meanings": [
          {
            "meaning": "Next Month",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "らいげつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          590,
          477
        ]
      }
    },
    {
      "id": 2826,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2826",
      "data_updated_at": "2017-10-18T23:11:46.426416Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:33:34.000000Z",
        "slug": "来年",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%A5%E5%B9%B4",
        "characters": "来年",
        "meanings": [
          {
            "meaning": "Next Year",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "らいねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          590,
          546
        ]
      }
    },
    {
      "id": 2827,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2827",
      "data_updated_at": "2017-10-18T23:11:50.586073Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:34:19.000000Z",
        "slug": "古来",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%A4%E6%9D%A5",
        "characters": "古来",
        "meanings": [
          {
            "meaning": "Ancient",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こらい"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          590,
          519
        ]
      }
    },
    {
      "id": 2828,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2828",
      "data_updated_at": "2017-10-18T23:11:48.027989Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:34:26.000000Z",
        "slug": "外来",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E6%9D%A5",
        "characters": "外来",
        "meanings": [
          {
            "meaning": "Imported",
            "primary": true
          },
          {
            "meaning": "Outpatient",
            "primary": false
          },
          {
            "meaning": "Foreign",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がいらい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          590,
          521
        ]
      }
    },
    {
      "id": 2829,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2829",
      "data_updated_at": "2017-10-18T23:11:50.700582Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:34:34.000000Z",
        "slug": "〜年来",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E5%B9%B4%E6%9D%A5",
        "characters": "〜年来",
        "meanings": [
          {
            "meaning": "For Some Years",
            "primary": true
          },
          {
            "meaning": "For Years",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ねんらい"
          }
        ],
        "parts_of_speech": [
          "suffix"
        ],
        "component_subject_ids": [
          590,
          546
        ]
      }
    },
    {
      "id": 2830,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2830",
      "data_updated_at": "2017-10-18T23:11:51.845331Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:34:47.000000Z",
        "slug": "社内",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A4%BE%E5%86%85",
        "characters": "社内",
        "meanings": [
          {
            "meaning": "Within The Company",
            "primary": true
          },
          {
            "meaning": "In House",
            "primary": false
          },
          {
            "meaning": "Inside The Company",
            "primary": false
          },
          {
            "meaning": "Inside A Company",
            "primary": false
          },
          {
            "meaning": "In The Company",
            "primary": false
          },
          {
            "meaning": "Within A Company",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゃない"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          591,
          500
        ]
      }
    },
    {
      "id": 2831,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2831",
      "data_updated_at": "2017-12-28T00:04:52.651816Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:34:54.000000Z",
        "slug": "入社",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E7%A4%BE",
        "characters": "入社",
        "meanings": [
          {
            "meaning": "Joining A Company",
            "primary": true
          },
          {
            "meaning": "Entering A Company",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にゅうしゃ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          591,
          445
        ]
      }
    },
    {
      "id": 2832,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2832",
      "data_updated_at": "2017-10-18T23:11:50.638163Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:00.000000Z",
        "slug": "公社",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AC%E7%A4%BE",
        "characters": "公社",
        "meanings": [
          {
            "meaning": "Public Corporation",
            "primary": true
          },
          {
            "meaning": "Public Company",
            "primary": false
          },
          {
            "meaning": "Government Agency",
            "primary": false
          },
          {
            "meaning": "Federal Agency",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          591,
          499
        ]
      }
    },
    {
      "id": 2833,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2833",
      "data_updated_at": "2017-10-18T23:11:47.840607Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:08.000000Z",
        "slug": "本社",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AC%E7%A4%BE",
        "characters": "本社",
        "meanings": [
          {
            "meaning": "Headquarters",
            "primary": true
          },
          {
            "meaning": "Hq",
            "primary": false
          },
          {
            "meaning": "Head Office",
            "primary": false
          },
          {
            "meaning": "Company Headquarters",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほんしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          591,
          487
        ]
      }
    },
    {
      "id": 2834,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2834",
      "data_updated_at": "2017-10-18T23:11:46.857653Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:18.000000Z",
        "slug": "会社",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%9A%E7%A4%BE",
        "characters": "会社",
        "meanings": [
          {
            "meaning": "Company",
            "primary": true
          },
          {
            "meaning": "Corporation",
            "primary": false
          },
          {
            "meaning": "The Office",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          591,
          566
        ]
      }
    },
    {
      "id": 2835,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2835",
      "data_updated_at": "2017-11-01T23:14:21.345708Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:27.000000Z",
        "slug": "角",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A7%92",
        "characters": "角",
        "meanings": [
          {
            "meaning": "Angle",
            "primary": true
          },
          {
            "meaning": "Corner",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かく"
          },
          {
            "primary": false,
            "reading": "かど"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          592
        ]
      }
    },
    {
      "id": 2836,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2836",
      "data_updated_at": "2017-10-18T23:11:51.452056Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:34.000000Z",
        "slug": "三角",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%89%E8%A7%92",
        "characters": "三角",
        "meanings": [
          {
            "meaning": "Triangle",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さんかく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          592,
          449
        ]
      }
    },
    {
      "id": 2837,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2837",
      "data_updated_at": "2017-10-18T23:11:49.433905Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:40.000000Z",
        "slug": "四角",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E8%A7%92",
        "characters": "四角",
        "meanings": [
          {
            "meaning": "Square",
            "primary": true
          },
          {
            "meaning": "Rectangle",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しかく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          592,
          485
        ]
      }
    },
    {
      "id": 2838,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2838",
      "data_updated_at": "2017-10-18T23:11:51.365068Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:35:46.000000Z",
        "slug": "言う",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A8%80%E3%81%86",
        "characters": "言う",
        "meanings": [
          {
            "meaning": "To Say",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いう"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          593
        ]
      }
    },
    {
      "id": 2839,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2839",
      "data_updated_at": "2017-10-18T23:11:46.155140Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:36:04.000000Z",
        "slug": "谷",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B0%B7",
        "characters": "谷",
        "meanings": [
          {
            "meaning": "Valley",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たに"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          594
        ]
      }
    },
    {
      "id": 2840,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2840",
      "data_updated_at": "2017-10-18T23:11:52.122643Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:36:14.000000Z",
        "slug": "走る",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B5%B0%E3%82%8B",
        "characters": "走る",
        "meanings": [
          {
            "meaning": "To Run",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はしる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          595
        ]
      }
    },
    {
      "id": 2841,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2841",
      "data_updated_at": "2017-10-18T23:11:51.566249Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:36:21.000000Z",
        "slug": "走行",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B5%B0%E8%A1%8C",
        "characters": "走行",
        "meanings": [
          {
            "meaning": "Traveling",
            "primary": true
          },
          {
            "meaning": "Travelling",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そうこう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          595,
          580
        ]
      }
    },
    {
      "id": 2842,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2842",
      "data_updated_at": "2017-10-18T23:11:47.329017Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:36:34.000000Z",
        "slug": "近い",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%91%E3%81%84",
        "characters": "近い",
        "meanings": [
          {
            "meaning": "Close",
            "primary": true
          },
          {
            "meaning": "Nearby",
            "primary": false
          },
          {
            "meaning": "Near",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちかい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          596
        ]
      }
    },
    {
      "id": 2843,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2843",
      "data_updated_at": "2017-10-18T23:11:46.710464Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:37:04.000000Z",
        "slug": "近日",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%91%E6%97%A5",
        "characters": "近日",
        "meanings": [
          {
            "meaning": "Soon",
            "primary": true
          },
          {
            "meaning": "In A Few Days",
            "primary": false
          },
          {
            "meaning": "Coming Days",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きんじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          596,
          476
        ]
      }
    },
    {
      "id": 2844,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2844",
      "data_updated_at": "2017-10-18T23:11:52.665782Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:37:11.000000Z",
        "slug": "近年",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%91%E5%B9%B4",
        "characters": "近年",
        "meanings": [
          {
            "meaning": "Recent Years",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きんねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          596,
          546
        ]
      }
    },
    {
      "id": 2845,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2845",
      "data_updated_at": "2017-10-18T23:11:46.644530Z",
      "data": {
        "level": 5,
        "created_at": "2012-03-08T23:37:27.000000Z",
        "slug": "麦",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%BA%A6",
        "characters": "麦",
        "meanings": [
          {
            "meaning": "Wheat",
            "primary": true
          },
          {
            "meaning": "Barley",
            "primary": false
          },
          {
            "meaning": "Oats",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むぎ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          598
        ]
      }
    },
    {
      "id": 2846,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2846",
      "data_updated_at": "2017-10-18T23:11:58.800863Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:33:28.000000Z",
        "slug": "文化",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%87%E5%8C%96",
        "characters": "文化",
        "meanings": [
          {
            "meaning": "Culture",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぶんか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          607,
          475
        ]
      }
    },
    {
      "id": 2847,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2847",
      "data_updated_at": "2017-10-18T23:11:56.885196Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:34:12.000000Z",
        "slug": "地",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%B0",
        "characters": "地",
        "meanings": [
          {
            "meaning": "Earth",
            "primary": true
          },
          {
            "meaning": "Ground",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          608
        ]
      }
    },
    {
      "id": 2848,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2848",
      "data_updated_at": "2017-10-18T23:11:55.087505Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:34:21.000000Z",
        "slug": "地下",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%B0%E4%B8%8B",
        "characters": "地下",
        "meanings": [
          {
            "meaning": "Underground",
            "primary": true
          },
          {
            "meaning": "Basement",
            "primary": false
          },
          {
            "meaning": "Cellar",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちか"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          608,
          451
        ]
      }
    },
    {
      "id": 2849,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2849",
      "data_updated_at": "2017-10-18T23:11:52.779736Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:34:40.000000Z",
        "slug": "土地",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%9F%E5%9C%B0",
        "characters": "土地",
        "meanings": [
          {
            "meaning": "Land",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          608,
          459
        ]
      }
    },
    {
      "id": 2850,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2850",
      "data_updated_at": "2017-10-18T23:11:53.678877Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:35:27.000000Z",
        "slug": "地図",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%B0%E5%9B%B3",
        "characters": "地図",
        "meanings": [
          {
            "meaning": "Map",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちず"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          608,
          585
        ]
      }
    },
    {
      "id": 2851,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2851",
      "data_updated_at": "2017-10-18T23:11:53.521858Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:35:45.000000Z",
        "slug": "両手",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%A1%E6%89%8B",
        "characters": "両手",
        "meanings": [
          {
            "meaning": "Both Hands",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りょうて"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          609,
          474
        ]
      }
    },
    {
      "id": 2852,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2852",
      "data_updated_at": "2017-10-18T23:11:52.734396Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:35:50.000000Z",
        "slug": "両日",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%A1%E6%97%A5",
        "characters": "両日",
        "meanings": [
          {
            "meaning": "Both Days",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りょうじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          609,
          476
        ]
      }
    },
    {
      "id": 2853,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2853",
      "data_updated_at": "2017-10-18T23:11:56.358655Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:35:56.000000Z",
        "slug": "両方",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%A1%E6%96%B9",
        "characters": "両方",
        "meanings": [
          {
            "meaning": "Both",
            "primary": true
          },
          {
            "meaning": "Both Sides",
            "primary": false
          },
          {
            "meaning": "Both Ways",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りょうほう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          609,
          510
        ]
      }
    },
    {
      "id": 2854,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2854",
      "data_updated_at": "2017-12-04T19:11:34.087279Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:36:02.000000Z",
        "slug": "全て",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E3%81%A6",
        "characters": "全て",
        "meanings": [
          {
            "meaning": "All",
            "primary": true
          },
          {
            "meaning": "Entire",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すべて"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          610
        ]
      }
    },
    {
      "id": 2855,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2855",
      "data_updated_at": "2017-10-18T23:11:54.955578Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:36:22.000000Z",
        "slug": "全力",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E5%8A%9B",
        "characters": "全力",
        "meanings": [
          {
            "meaning": "Full Effort",
            "primary": true
          },
          {
            "meaning": "Every Effort",
            "primary": false
          },
          {
            "meaning": "Best Effort",
            "primary": false
          },
          {
            "meaning": "Full Power",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぜんりょく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          610,
          447
        ]
      }
    },
    {
      "id": 2856,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2856",
      "data_updated_at": "2017-10-18T23:11:54.248474Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:36:44.000000Z",
        "slug": "全日本",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E6%97%A5%E6%9C%AC",
        "characters": "全日本",
        "meanings": [
          {
            "meaning": "All Japan",
            "primary": true
          },
          {
            "meaning": "All Of Japan",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぜんにほん"
          },
          {
            "primary": false,
            "reading": "ぜんにっぽん"
          }
        ],
        "parts_of_speech": [
          "expression"
        ],
        "component_subject_ids": [
          610,
          487,
          476
        ]
      }
    },
    {
      "id": 2857,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2857",
      "data_updated_at": "2017-10-18T23:11:55.006195Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:37:13.000000Z",
        "slug": "安全",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%89%E5%85%A8",
        "characters": "安全",
        "meanings": [
          {
            "meaning": "Safety",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あんぜん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          612,
          610
        ]
      }
    },
    {
      "id": 2858,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2858",
      "data_updated_at": "2017-10-18T23:11:56.812812Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:38:15.000000Z",
        "slug": "方向",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%B9%E5%90%91",
        "characters": "方向",
        "meanings": [
          {
            "meaning": "Direction",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほうこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          611,
          510
        ]
      }
    },
    {
      "id": 2859,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2859",
      "data_updated_at": "2018-03-05T22:33:58.141801Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:38:58.000000Z",
        "slug": "安い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%89%E3%81%84",
        "characters": "安い",
        "meanings": [
          {
            "meaning": "Cheap",
            "primary": true
          },
          {
            "meaning": "Inexpensive",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やすい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          612
        ]
      }
    },
    {
      "id": 2860,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2860",
      "data_updated_at": "2017-10-18T23:11:58.111256Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:39:04.000000Z",
        "slug": "安心",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%89%E5%BF%83",
        "characters": "安心",
        "meanings": [
          {
            "meaning": "Relief",
            "primary": true
          },
          {
            "meaning": "Peace Of Mind",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あんしん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "na_adjective"
        ],
        "component_subject_ids": [
          612,
          508
        ]
      }
    },
    {
      "id": 2861,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2861",
      "data_updated_at": "2017-10-18T23:11:54.910362Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:39:34.000000Z",
        "slug": "不安",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8D%E5%AE%89",
        "characters": "不安",
        "meanings": [
          {
            "meaning": "Uneasiness",
            "primary": true
          },
          {
            "meaning": "Anxiety",
            "primary": false
          },
          {
            "meaning": "Unease",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふあん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          612,
          563
        ]
      }
    },
    {
      "id": 2862,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2862",
      "data_updated_at": "2017-10-18T23:11:59.731917Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:39:41.000000Z",
        "slug": "平安",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B3%E5%AE%89",
        "characters": "平安",
        "meanings": [
          {
            "meaning": "Peace",
            "primary": true
          },
          {
            "meaning": "Tranquility",
            "primary": false
          },
          {
            "meaning": "Heian",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へいあん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          612,
          535
        ]
      }
    },
    {
      "id": 2863,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2863",
      "data_updated_at": "2017-10-18T23:11:54.497759Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:39:48.000000Z",
        "slug": "州",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%9E",
        "characters": "州",
        "meanings": [
          {
            "meaning": "State",
            "primary": true
          },
          {
            "meaning": "Province",
            "primary": false
          },
          {
            "meaning": "County",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          613
        ]
      }
    },
    {
      "id": 2864,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2864",
      "data_updated_at": "2017-10-18T23:11:57.158888Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:39:54.000000Z",
        "slug": "九州",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%9D%E5%B7%9E",
        "characters": "九州",
        "meanings": [
          {
            "meaning": "Kyuushuu",
            "primary": true
          },
          {
            "meaning": "Kyushu",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゅうしゅう"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          613,
          442
        ]
      }
    },
    {
      "id": 2865,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2865",
      "data_updated_at": "2017-10-18T23:11:53.633299Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:40:06.000000Z",
        "slug": "本州",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AC%E5%B7%9E",
        "characters": "本州",
        "meanings": [
          {
            "meaning": "Honshuu",
            "primary": true
          },
          {
            "meaning": "Honshu",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほんしゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          613,
          487
        ]
      }
    },
    {
      "id": 2866,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2866",
      "data_updated_at": "2017-10-18T23:11:54.380442Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:40:37.000000Z",
        "slug": "曲",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9B%B2",
        "characters": "曲",
        "meanings": [
          {
            "meaning": "Tune",
            "primary": true
          },
          {
            "meaning": "Piece Of Music",
            "primary": false
          },
          {
            "meaning": "Song",
            "primary": false
          },
          {
            "meaning": "Melody",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          614
        ]
      }
    },
    {
      "id": 2867,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2867",
      "data_updated_at": "2017-10-18T23:11:57.097330Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:41:07.000000Z",
        "slug": "名曲",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E6%9B%B2",
        "characters": "名曲",
        "meanings": [
          {
            "meaning": "Famous Music",
            "primary": true
          },
          {
            "meaning": "Famous Song",
            "primary": false
          },
          {
            "meaning": "Famous Tune",
            "primary": false
          },
          {
            "meaning": "Masterpiece",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "めいきょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          614,
          544
        ]
      }
    },
    {
      "id": 2868,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2868",
      "data_updated_at": "2017-10-18T23:11:58.685306Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:41:17.000000Z",
        "slug": "有る",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%89%E3%82%8B",
        "characters": "有る",
        "meanings": [
          {
            "meaning": "To Have",
            "primary": true
          },
          {
            "meaning": "To Exist",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ある"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          615
        ]
      }
    },
    {
      "id": 2869,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2869",
      "data_updated_at": "2017-10-18T23:11:54.666785Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:41:23.000000Z",
        "slug": "有名",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%89%E5%90%8D",
        "characters": "有名",
        "meanings": [
          {
            "meaning": "Famous",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆうめい"
          }
        ],
        "parts_of_speech": [
          "na_adjective"
        ],
        "component_subject_ids": [
          615,
          544
        ]
      }
    },
    {
      "id": 2870,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2870",
      "data_updated_at": "2017-10-18T23:11:57.568218Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:41:29.000000Z",
        "slug": "次",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AC%A1",
        "characters": "次",
        "meanings": [
          {
            "meaning": "Next",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つぎ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          616
        ]
      }
    },
    {
      "id": 2871,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2871",
      "data_updated_at": "2017-10-18T23:11:55.159514Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:01.000000Z",
        "slug": "次回",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AC%A1%E5%9B%9E",
        "characters": "次回",
        "meanings": [
          {
            "meaning": "Next Time",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          616,
          569
        ]
      }
    },
    {
      "id": 2872,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2872",
      "data_updated_at": "2017-10-18T23:11:58.438242Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:17.000000Z",
        "slug": "目次",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%AE%E6%AC%A1",
        "characters": "目次",
        "meanings": [
          {
            "meaning": "Table Of Contents",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もくじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          616,
          492
        ]
      }
    },
    {
      "id": 2873,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2873",
      "data_updated_at": "2017-10-18T23:11:56.156203Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:27.000000Z",
        "slug": "年次",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4%E6%AC%A1",
        "characters": "年次",
        "meanings": [
          {
            "meaning": "Annual",
            "primary": true
          },
          {
            "meaning": "Yearly",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ねんじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          616,
          546
        ]
      }
    },
    {
      "id": 2874,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2874",
      "data_updated_at": "2017-10-18T23:11:53.202365Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:37.000000Z",
        "slug": "死ぬ",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%BB%E3%81%AC",
        "characters": "死ぬ",
        "meanings": [
          {
            "meaning": "To Die",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しぬ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          617
        ]
      }
    },
    {
      "id": 2875,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2875",
      "data_updated_at": "2017-10-18T23:11:55.525190Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:44.000000Z",
        "slug": "死体",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%BB%E4%BD%93",
        "characters": "死体",
        "meanings": [
          {
            "meaning": "Dead Body",
            "primary": true
          },
          {
            "meaning": "Corpse",
            "primary": false
          },
          {
            "meaning": "Cadaver",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "したい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          617,
          583
        ]
      }
    },
    {
      "id": 2876,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2876",
      "data_updated_at": "2017-10-18T23:11:53.050836Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:52.000000Z",
        "slug": "死亡",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%BB%E4%BA%A1",
        "characters": "死亡",
        "meanings": [
          {
            "meaning": "Mortality",
            "primary": true
          },
          {
            "meaning": "Death",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しぼう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          851,
          617
        ]
      }
    },
    {
      "id": 2877,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2877",
      "data_updated_at": "2017-10-18T23:11:58.217695Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:42:59.000000Z",
        "slug": "羊",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%BE%8A",
        "characters": "羊",
        "meanings": [
          {
            "meaning": "Sheep",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひつじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          618
        ]
      }
    },
    {
      "id": 2878,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2878",
      "data_updated_at": "2017-10-18T23:11:53.255603Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:43:07.000000Z",
        "slug": "羊毛",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%BE%8A%E6%AF%9B",
        "characters": "羊毛",
        "meanings": [
          {
            "meaning": "Wool",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようもう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          618,
          513
        ]
      }
    },
    {
      "id": 2879,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2879",
      "data_updated_at": "2017-10-18T23:11:53.586740Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:43:14.000000Z",
        "slug": "血",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A1%80",
        "characters": "血",
        "meanings": [
          {
            "meaning": "Blood",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          619
        ]
      }
    },
    {
      "id": 2880,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2880",
      "data_updated_at": "2017-10-18T23:11:56.263009Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:43:20.000000Z",
        "slug": "出血",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E8%A1%80",
        "characters": "出血",
        "meanings": [
          {
            "meaning": "Bleeding",
            "primary": true
          },
          {
            "meaning": "Bleed",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅっけつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          619,
          483
        ]
      }
    },
    {
      "id": 2881,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2881",
      "data_updated_at": "2017-10-18T23:11:55.229761Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:43:33.000000Z",
        "slug": "国",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%BD",
        "characters": "国",
        "meanings": [
          {
            "meaning": "Country",
            "primary": true
          },
          {
            "meaning": "Nation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くに"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          621
        ]
      }
    },
    {
      "id": 2882,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2882",
      "data_updated_at": "2017-10-18T23:11:54.444648Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:43:47.000000Z",
        "slug": "中国",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E5%9B%BD",
        "characters": "中国",
        "meanings": [
          {
            "meaning": "China",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうごく"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          621,
          469
        ]
      }
    },
    {
      "id": 2883,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2883",
      "data_updated_at": "2017-10-18T23:11:57.383859Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:44:31.000000Z",
        "slug": "天国",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A9%E5%9B%BD",
        "characters": "天国",
        "meanings": [
          {
            "meaning": "Kingdom Of Heaven",
            "primary": true
          },
          {
            "meaning": "Heaven",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てんごく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          621,
          473
        ]
      }
    },
    {
      "id": 2884,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2884",
      "data_updated_at": "2017-10-18T23:11:54.545013Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:44:39.000000Z",
        "slug": "全国",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E5%9B%BD",
        "characters": "全国",
        "meanings": [
          {
            "meaning": "Nationwide",
            "primary": true
          },
          {
            "meaning": "National",
            "primary": false
          },
          {
            "meaning": "Countrywide",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぜんこく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          621,
          610
        ]
      }
    },
    {
      "id": 2885,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2885",
      "data_updated_at": "2017-10-18T23:11:59.319839Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:44:55.000000Z",
        "slug": "四国",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E5%9B%BD",
        "characters": "四国",
        "meanings": [
          {
            "meaning": "Shikoku",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しこく"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          621,
          485
        ]
      }
    },
    {
      "id": 2886,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2886",
      "data_updated_at": "2017-10-18T23:11:55.296882Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:01.000000Z",
        "slug": "外国",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E5%9B%BD",
        "characters": "外国",
        "meanings": [
          {
            "meaning": "Foreign Country",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がいこく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          621,
          521
        ]
      }
    },
    {
      "id": 2887,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2887",
      "data_updated_at": "2017-10-18T23:11:55.364375Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:08.000000Z",
        "slug": "外国人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E5%9B%BD%E4%BA%BA",
        "characters": "外国人",
        "meanings": [
          {
            "meaning": "Foreign Person",
            "primary": true
          },
          {
            "meaning": "Foreigner",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がいこくじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          621,
          521,
          444
        ]
      }
    },
    {
      "id": 2888,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2888",
      "data_updated_at": "2017-10-18T23:11:56.107686Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:14.000000Z",
        "slug": "米国",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B1%B3%E5%9B%BD",
        "characters": "米国",
        "meanings": [
          {
            "meaning": "America",
            "primary": true
          },
          {
            "meaning": "United States",
            "primary": false
          },
          {
            "meaning": "United States Of America",
            "primary": false
          },
          {
            "meaning": "Usa",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べいこく"
          }
        ],
        "parts_of_speech": [
          "proper_noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          621,
          574
        ]
      }
    },
    {
      "id": 2889,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2889",
      "data_updated_at": "2017-10-18T23:11:59.156083Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:26.000000Z",
        "slug": "夜",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%9C",
        "characters": "夜",
        "meanings": [
          {
            "meaning": "Night",
            "primary": true
          },
          {
            "meaning": "Evening",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よる"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          622
        ]
      }
    },
    {
      "id": 2890,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2890",
      "data_updated_at": "2017-10-18T23:11:55.407248Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:32.000000Z",
        "slug": "今夜",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E5%A4%9C",
        "characters": "今夜",
        "meanings": [
          {
            "meaning": "Tonight",
            "primary": true
          },
          {
            "meaning": "This Evening",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          622,
          497
        ]
      }
    },
    {
      "id": 2891,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2891",
      "data_updated_at": "2017-10-18T23:11:53.159079Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:39.000000Z",
        "slug": "姉妹",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A7%89%E5%A6%B9",
        "characters": "姉妹",
        "meanings": [
          {
            "meaning": "Sisters",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しまい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          624,
          623
        ]
      }
    },
    {
      "id": 2892,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2892",
      "data_updated_at": "2017-10-18T23:11:55.465299Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:45:59.000000Z",
        "slug": "妹",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A6%B9",
        "characters": "妹",
        "meanings": [
          {
            "meaning": "Younger Sister",
            "primary": true
          },
          {
            "meaning": "Little Sister",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いもうと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          623
        ]
      }
    },
    {
      "id": 2893,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2893",
      "data_updated_at": "2017-10-18T23:11:57.877608Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:46:07.000000Z",
        "slug": "お姉さん",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E5%A7%89%E3%81%95%E3%82%93",
        "characters": "お姉さん",
        "meanings": [
          {
            "meaning": "Older Sister",
            "primary": true
          },
          {
            "meaning": "Big Sister",
            "primary": false
          },
          {
            "meaning": "Elder Sister",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おねえさん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          624
        ]
      }
    },
    {
      "id": 2894,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2894",
      "data_updated_at": "2017-10-18T23:11:58.279660Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:46:22.000000Z",
        "slug": "店",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BA%97",
        "characters": "店",
        "meanings": [
          {
            "meaning": "Shop",
            "primary": true
          },
          {
            "meaning": "Store",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みせ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          625
        ]
      }
    },
    {
      "id": 2895,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2895",
      "data_updated_at": "2017-10-18T23:11:56.479422Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:46:29.000000Z",
        "slug": "明るい",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%98%8E%E3%82%8B%E3%81%84",
        "characters": "明るい",
        "meanings": [
          {
            "meaning": "Bright",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あかるい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          626
        ]
      }
    },
    {
      "id": 2896,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2896",
      "data_updated_at": "2017-10-18T23:11:55.693257Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:46:37.000000Z",
        "slug": "不明",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8D%E6%98%8E",
        "characters": "不明",
        "meanings": [
          {
            "meaning": "Unknown",
            "primary": true
          },
          {
            "meaning": "Unclear",
            "primary": false
          },
          {
            "meaning": "Uncertain",
            "primary": false
          },
          {
            "meaning": "Unsure",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふめい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          626,
          563
        ]
      }
    },
    {
      "id": 2897,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2897",
      "data_updated_at": "2017-10-18T23:11:55.750797Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:46:50.000000Z",
        "slug": "東方",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%B1%E6%96%B9",
        "characters": "東方",
        "meanings": [
          {
            "meaning": "Eastward",
            "primary": true
          },
          {
            "meaning": "Eastern Direction",
            "primary": false
          },
          {
            "meaning": "Touhou",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とうほう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          627,
          510
        ]
      }
    },
    {
      "id": 2898,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2898",
      "data_updated_at": "2017-10-18T23:11:57.692489Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:46:57.000000Z",
        "slug": "東北",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%B1%E5%8C%97",
        "characters": "東北",
        "meanings": [
          {
            "meaning": "Northeast",
            "primary": true
          },
          {
            "meaning": "Tohoku",
            "primary": false
          },
          {
            "meaning": "Tohoku Region",
            "primary": false
          },
          {
            "meaning": "Touhoku Region",
            "primary": false
          },
          {
            "meaning": "Touhoku",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とうほく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          627,
          517
        ]
      }
    },
    {
      "id": 2899,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2899",
      "data_updated_at": "2017-10-18T23:11:53.787437Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:48:12.000000Z",
        "slug": "中東",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E6%9D%B1",
        "characters": "中東",
        "meanings": [
          {
            "meaning": "Middle East",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうとう"
          }
        ],
        "parts_of_speech": [
          "proper_noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          627,
          469
        ]
      }
    },
    {
      "id": 2900,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2900",
      "data_updated_at": "2017-10-18T23:11:53.933062Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:48:59.000000Z",
        "slug": "南東",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%97%E6%9D%B1",
        "characters": "南東",
        "meanings": [
          {
            "meaning": "Southeast",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんとう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          634,
          627
        ]
      }
    },
    {
      "id": 2901,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2901",
      "data_updated_at": "2017-10-18T23:11:58.754154Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:49:08.000000Z",
        "slug": "歩く",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A9%E3%81%8F",
        "characters": "歩く",
        "meanings": [
          {
            "meaning": "To Walk",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あるく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          628
        ]
      }
    },
    {
      "id": 2902,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2902",
      "data_updated_at": "2017-10-18T23:11:55.818495Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:49:14.000000Z",
        "slug": "直す",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%B4%E3%81%99",
        "characters": "直す",
        "meanings": [
          {
            "meaning": "To Fix",
            "primary": true
          },
          {
            "meaning": "To Repair",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なおす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          630
        ]
      }
    },
    {
      "id": 2903,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2903",
      "data_updated_at": "2017-10-18T23:11:59.537915Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:49:21.000000Z",
        "slug": "直る",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%B4%E3%82%8B",
        "characters": "直る",
        "meanings": [
          {
            "meaning": "To Be Fixed",
            "primary": true
          },
          {
            "meaning": "To Fix",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なおる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          630
        ]
      }
    },
    {
      "id": 2904,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2904",
      "data_updated_at": "2017-10-18T23:11:57.309315Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:49:27.000000Z",
        "slug": "正直",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A3%E7%9B%B4",
        "characters": "正直",
        "meanings": [
          {
            "meaning": "Honest",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうじき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          630,
          488
        ]
      }
    },
    {
      "id": 2905,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2905",
      "data_updated_at": "2017-10-18T23:11:57.630402Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:49:37.000000Z",
        "slug": "直行",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%B4%E8%A1%8C",
        "characters": "直行",
        "meanings": [
          {
            "meaning": "Nonstop",
            "primary": true
          },
          {
            "meaning": "Direct",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちょっこう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          630,
          580
        ]
      }
    },
    {
      "id": 2906,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2906",
      "data_updated_at": "2017-10-18T23:11:57.463016Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:50:10.000000Z",
        "slug": "長い",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%95%B7%E3%81%84",
        "characters": "長い",
        "meanings": [
          {
            "meaning": "Long",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ながい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          632
        ]
      }
    },
    {
      "id": 2907,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2907",
      "data_updated_at": "2017-12-21T21:58:22.742279Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:50:16.000000Z",
        "slug": "社長",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A4%BE%E9%95%B7",
        "characters": "社長",
        "meanings": [
          {
            "meaning": "Company President",
            "primary": true
          },
          {
            "meaning": "Manager",
            "primary": false
          },
          {
            "meaning": "Director",
            "primary": false
          },
          {
            "meaning": "President Of A Company",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゃちょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          632,
          591
        ]
      }
    },
    {
      "id": 2908,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2908",
      "data_updated_at": "2017-10-18T23:11:57.249974Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:50:33.000000Z",
        "slug": "前",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%89%8D",
        "characters": "前",
        "meanings": [
          {
            "meaning": "Front",
            "primary": true
          },
          {
            "meaning": "Before",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まえ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          633
        ]
      }
    },
    {
      "id": 2909,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2909",
      "data_updated_at": "2017-10-18T23:11:59.223519Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:50:47.000000Z",
        "slug": "午前",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%88%E5%89%8D",
        "characters": "午前",
        "meanings": [
          {
            "meaning": "AM",
            "primary": true
          },
          {
            "meaning": "Morning",
            "primary": false
          },
          {
            "meaning": "A.M.",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごぜん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          633,
          503
        ]
      }
    },
    {
      "id": 2910,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2910",
      "data_updated_at": "2017-10-18T23:11:58.389543Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:51:01.000000Z",
        "slug": "南",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%97",
        "characters": "南",
        "meanings": [
          {
            "meaning": "South",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みなみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          634
        ]
      }
    },
    {
      "id": 2911,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2911",
      "data_updated_at": "2017-10-18T23:11:56.203648Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:51:26.000000Z",
        "slug": "後ろ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BE%8C%E3%82%8D",
        "characters": "後ろ",
        "meanings": [
          {
            "meaning": "Behind",
            "primary": true
          },
          {
            "meaning": "Back",
            "primary": false
          },
          {
            "meaning": "Rear",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うしろ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          636
        ]
      }
    },
    {
      "id": 2912,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2912",
      "data_updated_at": "2017-10-18T23:11:55.974853Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:51:36.000000Z",
        "slug": "後で",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BE%8C%E3%81%A7",
        "characters": "後で",
        "meanings": [
          {
            "meaning": "After",
            "primary": true
          },
          {
            "meaning": "Afterwards",
            "primary": false
          },
          {
            "meaning": "Later",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あとで"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          636
        ]
      }
    },
    {
      "id": 2913,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2913",
      "data_updated_at": "2017-10-18T23:11:53.308565Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:51:45.000000Z",
        "slug": "午後",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%88%E5%BE%8C",
        "characters": "午後",
        "meanings": [
          {
            "meaning": "PM",
            "primary": true
          },
          {
            "meaning": "Afternoon",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ごご"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          636,
          503
        ]
      }
    },
    {
      "id": 2914,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2914",
      "data_updated_at": "2017-10-18T23:11:55.633099Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:53:01.000000Z",
        "slug": "思う",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%80%9D%E3%81%86",
        "characters": "思う",
        "meanings": [
          {
            "meaning": "To Think",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おもう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          637
        ]
      }
    },
    {
      "id": 2915,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2915",
      "data_updated_at": "2017-10-18T23:11:53.982122Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:53:22.000000Z",
        "slug": "星",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%98%9F",
        "characters": "星",
        "meanings": [
          {
            "meaning": "Star",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          638
        ]
      }
    },
    {
      "id": 2916,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2916",
      "data_updated_at": "2017-10-18T23:11:55.914493Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:54:04.000000Z",
        "slug": "生活",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%9F%E6%B4%BB",
        "characters": "生活",
        "meanings": [
          {
            "meaning": "Life",
            "primary": true
          },
          {
            "meaning": "Livelihood",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せいかつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          850,
          639
        ]
      }
    },
    {
      "id": 2917,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2917",
      "data_updated_at": "2017-10-18T23:11:53.887472Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:54:16.000000Z",
        "slug": "海",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B5%B7",
        "characters": "海",
        "meanings": [
          {
            "meaning": "Ocean",
            "primary": true
          },
          {
            "meaning": "Sea",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          640
        ]
      }
    },
    {
      "id": 2918,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2918",
      "data_updated_at": "2017-10-18T23:11:58.008369Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:54:24.000000Z",
        "slug": "海外",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B5%B7%E5%A4%96",
        "characters": "海外",
        "meanings": [
          {
            "meaning": "Overseas",
            "primary": true
          },
          {
            "meaning": "Foreign",
            "primary": false
          },
          {
            "meaning": "Abroad",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいがい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          640,
          521
        ]
      }
    },
    {
      "id": 2919,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2919",
      "data_updated_at": "2017-12-18T22:37:56.014323Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:54:37.000000Z",
        "slug": "点",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%82%B9",
        "characters": "点",
        "meanings": [
          {
            "meaning": "Point",
            "primary": true
          },
          {
            "meaning": "Decimal",
            "primary": false
          },
          {
            "meaning": "Decimal Point",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          641
        ]
      }
    },
    {
      "id": 2920,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2920",
      "data_updated_at": "2017-10-18T23:11:53.355315Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:55:01.000000Z",
        "slug": "科学",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A7%91%E5%AD%A6",
        "characters": "科学",
        "meanings": [
          {
            "meaning": "Science",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          642,
          599
        ]
      }
    },
    {
      "id": 2921,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2921",
      "data_updated_at": "2017-10-18T23:11:53.408182Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:55:07.000000Z",
        "slug": "お茶",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E8%8C%B6",
        "characters": "お茶",
        "meanings": [
          {
            "meaning": "Tea",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おちゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          643
        ]
      }
    },
    {
      "id": 2922,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2922",
      "data_updated_at": "2017-10-18T23:11:56.526596Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:55:14.000000Z",
        "slug": "茶色",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8C%B6%E8%89%B2",
        "characters": "茶色",
        "meanings": [
          {
            "meaning": "Brown",
            "primary": true
          },
          {
            "meaning": "Brown Colour",
            "primary": false
          },
          {
            "meaning": "Brown Color",
            "primary": false
          },
          {
            "meaning": "Color Brown",
            "primary": false
          },
          {
            "meaning": "Colour Brown",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゃいろ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          643,
          579
        ]
      }
    },
    {
      "id": 2923,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2923",
      "data_updated_at": "2017-10-18T23:11:58.595644Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:55:33.000000Z",
        "slug": "食べる",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A3%9F%E3%81%B9%E3%82%8B",
        "characters": "食べる",
        "meanings": [
          {
            "meaning": "To Eat",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たべる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          644
        ]
      }
    },
    {
      "id": 2924,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2924",
      "data_updated_at": "2017-10-18T23:11:53.104802Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:55:48.000000Z",
        "slug": "首",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A6%96",
        "characters": "首",
        "meanings": [
          {
            "meaning": "Neck",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くび"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          645
        ]
      }
    },
    {
      "id": 2925,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2925",
      "data_updated_at": "2017-10-18T23:11:53.460334Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:55:57.000000Z",
        "slug": "足首",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B6%B3%E9%A6%96",
        "characters": "足首",
        "meanings": [
          {
            "meaning": "Ankle",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あしくび"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          645,
          561
        ]
      }
    },
    {
      "id": 2926,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2926",
      "data_updated_at": "2017-10-18T23:11:58.640375Z",
      "data": {
        "level": 6,
        "created_at": "2012-03-09T00:56:05.000000Z",
        "slug": "首になる",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A6%96%E3%81%AB%E3%81%AA%E3%82%8B",
        "characters": "首になる",
        "meanings": [
          {
            "meaning": "To Get Fired",
            "primary": true
          },
          {
            "meaning": "To Be Fired",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くびになる"
          }
        ],
        "parts_of_speech": [
          "expression",
          "godan_verb"
        ],
        "component_subject_ids": [
          645
        ]
      }
    },
    {
      "id": 2927,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2927",
      "data_updated_at": "2017-10-18T23:12:05.493611Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:54:51.000000Z",
        "slug": "欠点",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AC%A0%E7%82%B9",
        "characters": "欠点",
        "meanings": [
          {
            "meaning": "Shortcoming",
            "primary": true
          },
          {
            "meaning": "Fault",
            "primary": false
          },
          {
            "meaning": "Defect",
            "primary": false
          },
          {
            "meaning": "Flaw",
            "primary": false
          },
          {
            "meaning": "Weakness",
            "primary": false
          },
          {
            "meaning": "Weak Point",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けってん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          646,
          641
        ]
      }
    },
    {
      "id": 2928,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2928",
      "data_updated_at": "2018-03-05T20:03:23.059196Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:55:02.000000Z",
        "slug": "氏",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%8F",
        "characters": "氏",
        "meanings": [
          {
            "meaning": "Mister",
            "primary": true
          },
          {
            "meaning": "Sir",
            "primary": false
          },
          {
            "meaning": "Ma'am",
            "primary": false
          },
          {
            "meaning": "Madam",
            "primary": false
          },
          {
            "meaning": "Miss",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "し"
          }
        ],
        "parts_of_speech": [
          "suffix"
        ],
        "component_subject_ids": [
          647
        ]
      }
    },
    {
      "id": 2929,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2929",
      "data_updated_at": "2017-10-18T23:12:04.400399Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:55:12.000000Z",
        "slug": "氏名",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%8F%E5%90%8D",
        "characters": "氏名",
        "meanings": [
          {
            "meaning": "Full Name",
            "primary": true
          },
          {
            "meaning": "First And Last Name",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しめい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          647,
          544
        ]
      }
    },
    {
      "id": 2930,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2930",
      "data_updated_at": "2017-10-18T23:12:00.635378Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:56:12.000000Z",
        "slug": "自由",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%87%AA%E7%94%B1",
        "characters": "自由",
        "meanings": [
          {
            "meaning": "Freedom",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゆう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          648,
          578
        ]
      }
    },
    {
      "id": 2931,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2931",
      "data_updated_at": "2017-10-18T23:12:03.860471Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:56:28.000000Z",
        "slug": "理由",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%90%86%E7%94%B1",
        "characters": "理由",
        "meanings": [
          {
            "meaning": "Reason",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りゆう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          669,
          648
        ]
      }
    },
    {
      "id": 2932,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2932",
      "data_updated_at": "2017-10-18T23:12:00.049559Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:56:36.000000Z",
        "slug": "〜札",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E6%9C%AD",
        "characters": "〜札",
        "meanings": [
          {
            "meaning": "Label",
            "primary": true
          },
          {
            "meaning": "Bill",
            "primary": false
          },
          {
            "meaning": "Note",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふだ"
          }
        ],
        "parts_of_speech": [
          "suffix"
        ],
        "component_subject_ids": [
          649
        ]
      }
    },
    {
      "id": 2933,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2933",
      "data_updated_at": "2017-10-18T23:12:01.715431Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:56:46.000000Z",
        "slug": "千円札",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%83%E5%86%86%E6%9C%AD",
        "characters": "千円札",
        "meanings": [
          {
            "meaning": "Thousand Yen Bill",
            "primary": true
          },
          {
            "meaning": "Thousand Yen Note",
            "primary": false
          },
          {
            "meaning": "One Thousand Yen Note",
            "primary": false
          },
          {
            "meaning": "One Thousand Yen Bill",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんえんさつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          649,
          472,
          460
        ]
      }
    },
    {
      "id": 2934,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2934",
      "data_updated_at": "2017-10-18T23:12:01.655278Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:57:26.000000Z",
        "slug": "国民",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%BD%E6%B0%91",
        "characters": "国民",
        "meanings": [
          {
            "meaning": "The People",
            "primary": true
          },
          {
            "meaning": "Citizens",
            "primary": false
          },
          {
            "meaning": "National",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こくみん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          650,
          621
        ]
      }
    },
    {
      "id": 2935,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2935",
      "data_updated_at": "2017-10-18T23:12:04.973511Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:58:05.000000Z",
        "slug": "辺り",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BE%BA%E3%82%8A",
        "characters": "辺り",
        "meanings": [
          {
            "meaning": "Area",
            "primary": true
          },
          {
            "meaning": "Vicinity",
            "primary": false
          },
          {
            "meaning": "Neighborhood",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あたり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          651
        ]
      }
    },
    {
      "id": 2936,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2936",
      "data_updated_at": "2017-10-18T23:11:59.967593Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:58:20.000000Z",
        "slug": "この辺",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%93%E3%81%AE%E8%BE%BA",
        "characters": "この辺",
        "meanings": [
          {
            "meaning": "Around Here",
            "primary": true
          },
          {
            "meaning": "This Area",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "このへん"
          }
        ],
        "parts_of_speech": [
          "pronoun",
          "no_adjective"
        ],
        "component_subject_ids": [
          651
        ]
      }
    },
    {
      "id": 2937,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2937",
      "data_updated_at": "2017-10-18T23:12:03.245340Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:58:28.000000Z",
        "slug": "付ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%98%E3%81%91%E3%82%8B",
        "characters": "付ける",
        "meanings": [
          {
            "meaning": "To Attach",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つける"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          652
        ]
      }
    },
    {
      "id": 2938,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2938",
      "data_updated_at": "2017-10-18T23:12:03.360633Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:59:12.000000Z",
        "slug": "以外",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A5%E5%A4%96",
        "characters": "以外",
        "meanings": [
          {
            "meaning": "Other Than",
            "primary": true
          },
          {
            "meaning": "Excepting",
            "primary": false
          },
          {
            "meaning": "Except For",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いがい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          653,
          521
        ]
      }
    },
    {
      "id": 2939,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2939",
      "data_updated_at": "2017-10-18T23:12:05.430979Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:59:21.000000Z",
        "slug": "以上",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A5%E4%B8%8A",
        "characters": "以上",
        "meanings": [
          {
            "meaning": "More Than",
            "primary": true
          },
          {
            "meaning": "Or More",
            "primary": false
          },
          {
            "meaning": "That's All",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いじょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          653,
          450
        ]
      }
    },
    {
      "id": 2940,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2940",
      "data_updated_at": "2017-10-18T23:12:00.860195Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T17:59:28.000000Z",
        "slug": "以前",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A5%E5%89%8D",
        "characters": "以前",
        "meanings": [
          {
            "meaning": "Previously",
            "primary": true
          },
          {
            "meaning": "Before",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いぜん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          653,
          633
        ]
      }
    },
    {
      "id": 2941,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2941",
      "data_updated_at": "2017-10-18T23:12:02.227049Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:00:11.000000Z",
        "slug": "失う",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%B1%E3%81%86",
        "characters": "失う",
        "meanings": [
          {
            "meaning": "To Lose",
            "primary": true
          },
          {
            "meaning": "To Part With",
            "primary": false
          },
          {
            "meaning": "To Lose Something",
            "primary": false
          },
          {
            "meaning": "To Part With Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うしなう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          654
        ]
      }
    },
    {
      "id": 2942,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2942",
      "data_updated_at": "2017-10-18T23:12:01.305549Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:00:18.000000Z",
        "slug": "失礼",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%B1%E7%A4%BC",
        "characters": "失礼",
        "meanings": [
          {
            "meaning": "Rude",
            "primary": true
          },
          {
            "meaning": "Rudeness",
            "primary": false
          },
          {
            "meaning": "Impoliteness",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しつれい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "na_adjective"
        ],
        "component_subject_ids": [
          654,
          541
        ]
      }
    },
    {
      "id": 2943,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2943",
      "data_updated_at": "2017-10-18T23:12:03.653177Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:00:29.000000Z",
        "slug": "必ず",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%85%E3%81%9A",
        "characters": "必ず",
        "meanings": [
          {
            "meaning": "Surely",
            "primary": true
          },
          {
            "meaning": "Certainly",
            "primary": false
          },
          {
            "meaning": "Without Exception",
            "primary": false
          },
          {
            "meaning": "Always",
            "primary": false
          },
          {
            "meaning": "Definitely",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かならず"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          655
        ]
      }
    },
    {
      "id": 2944,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2944",
      "data_updated_at": "2017-10-18T23:12:00.540224Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:00:39.000000Z",
        "slug": "必死",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%85%E6%AD%BB",
        "characters": "必死",
        "meanings": [
          {
            "meaning": "Frantic",
            "primary": true
          },
          {
            "meaning": "Desperate",
            "primary": false
          },
          {
            "meaning": "Certain Death",
            "primary": false
          },
          {
            "meaning": "Sure Death",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひっし"
          }
        ],
        "parts_of_speech": [
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          655,
          617
        ]
      }
    },
    {
      "id": 2945,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2945",
      "data_updated_at": "2017-11-01T23:36:14.608429Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:00:47.000000Z",
        "slug": "未だ",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AA%E3%81%A0",
        "characters": "未だ",
        "meanings": [
          {
            "meaning": "Not Yet",
            "primary": true
          },
          {
            "meaning": "Still",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まだ"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          656
        ]
      }
    },
    {
      "id": 2946,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2946",
      "data_updated_at": "2017-10-18T23:12:00.751755Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:00:56.000000Z",
        "slug": "未来",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AA%E6%9D%A5",
        "characters": "未来",
        "meanings": [
          {
            "meaning": "Future",
            "primary": true
          },
          {
            "meaning": "The Future",
            "primary": false
          },
          {
            "meaning": "Distant Future",
            "primary": false
          },
          {
            "meaning": "The Distant Future",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みらい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          656,
          590
        ]
      }
    },
    {
      "id": 2947,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2947",
      "data_updated_at": "2017-10-18T23:12:05.241231Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:01:04.000000Z",
        "slug": "末",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AB",
        "characters": "末",
        "meanings": [
          {
            "meaning": "The End",
            "primary": true
          },
          {
            "meaning": "End",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すえ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          657
        ]
      }
    },
    {
      "id": 2948,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2948",
      "data_updated_at": "2017-10-18T23:12:01.348509Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:01:11.000000Z",
        "slug": "年末",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4%E6%9C%AB",
        "characters": "年末",
        "meanings": [
          {
            "meaning": "Year End",
            "primary": true
          },
          {
            "meaning": "End Of The Year",
            "primary": false
          },
          {
            "meaning": "End Of Year",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ねんまつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          657,
          546
        ]
      }
    },
    {
      "id": 2949,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2949",
      "data_updated_at": "2017-10-18T23:12:02.534782Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:01:19.000000Z",
        "slug": "月末",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%88%E6%9C%AB",
        "characters": "月末",
        "meanings": [
          {
            "meaning": "End Of The Month",
            "primary": true
          },
          {
            "meaning": "Month End",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "げつまつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          657,
          477
        ]
      }
    },
    {
      "id": 2950,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2950",
      "data_updated_at": "2017-10-18T23:12:01.071052Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:40:12.000000Z",
        "slug": "高校",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%AB%98%E6%A0%A1",
        "characters": "高校",
        "meanings": [
          {
            "meaning": "High School",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          666,
          658
        ]
      }
    },
    {
      "id": 2951,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2951",
      "data_updated_at": "2017-10-18T23:12:00.339952Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:40:21.000000Z",
        "slug": "学校",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E6%A0%A1",
        "characters": "学校",
        "meanings": [
          {
            "meaning": "School",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がっこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          658,
          599
        ]
      }
    },
    {
      "id": 2952,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2952",
      "data_updated_at": "2017-10-18T23:12:02.954939Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:42:08.000000Z",
        "slug": "夏",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%8F",
        "characters": "夏",
        "meanings": [
          {
            "meaning": "Summer",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          659
        ]
      }
    },
    {
      "id": 2953,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2953",
      "data_updated_at": "2017-10-18T23:12:03.183515Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:42:16.000000Z",
        "slug": "夏休み",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%8F%E4%BC%91%E3%81%BF",
        "characters": "夏休み",
        "meanings": [
          {
            "meaning": "Summer Vacation",
            "primary": true
          },
          {
            "meaning": "Summer Break",
            "primary": false
          },
          {
            "meaning": "Summer Holiday",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なつやすみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          659,
          542
        ]
      }
    },
    {
      "id": 2954,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2954",
      "data_updated_at": "2017-10-18T23:12:03.413417Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:42:24.000000Z",
        "slug": "家",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%B6",
        "characters": "家",
        "meanings": [
          {
            "meaning": "Home",
            "primary": true
          },
          {
            "meaning": "House",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いえ"
          },
          {
            "primary": false,
            "reading": "うち"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          660
        ]
      }
    },
    {
      "id": 2955,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2955",
      "data_updated_at": "2017-11-30T20:08:12.963458Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:42:33.000000Z",
        "slug": "作家",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E5%AE%B6",
        "characters": "作家",
        "meanings": [
          {
            "meaning": "Author",
            "primary": true
          },
          {
            "meaning": "Writer",
            "primary": false
          },
          {
            "meaning": "Novelist",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さっか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          660,
          584
        ]
      }
    },
    {
      "id": 2956,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2956",
      "data_updated_at": "2017-10-18T23:12:02.373811Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:42:49.000000Z",
        "slug": "弱い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%B1%E3%81%84",
        "characters": "弱い",
        "meanings": [
          {
            "meaning": "Weak",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よわい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          661
        ]
      }
    },
    {
      "id": 2957,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2957",
      "data_updated_at": "2017-10-18T23:12:03.294239Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:42:57.000000Z",
        "slug": "弱点",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%B1%E7%82%B9",
        "characters": "弱点",
        "meanings": [
          {
            "meaning": "Weak Point",
            "primary": true
          },
          {
            "meaning": "Weakness",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゃくてん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          661,
          641
        ]
      }
    },
    {
      "id": 2958,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2958",
      "data_updated_at": "2017-10-18T23:12:01.776049Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:44:21.000000Z",
        "slug": "時",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%99%82",
        "characters": "時",
        "meanings": [
          {
            "meaning": "Time",
            "primary": true
          },
          {
            "meaning": "Hour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          662
        ]
      }
    },
    {
      "id": 2959,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2959",
      "data_updated_at": "2017-10-18T23:12:03.607124Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:44:31.000000Z",
        "slug": "一時",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%99%82",
        "characters": "一時",
        "meanings": [
          {
            "meaning": "One O'clock",
            "primary": true
          },
          {
            "meaning": "One Hour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          662,
          440
        ]
      }
    },
    {
      "id": 2960,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2960",
      "data_updated_at": "2017-10-18T23:12:03.720309Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:44:41.000000Z",
        "slug": "二時半",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E6%99%82%E5%8D%8A",
        "characters": "二時半",
        "meanings": [
          {
            "meaning": "Two Thirty",
            "primary": true
          },
          {
            "meaning": "Half Past Two",
            "primary": false
          },
          {
            "meaning": "Half Two",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にじはん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          662,
          518,
          441
        ]
      }
    },
    {
      "id": 2961,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2961",
      "data_updated_at": "2017-10-18T23:12:01.147880Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:44:55.000000Z",
        "slug": "何時",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%95%E6%99%82",
        "characters": "何時",
        "meanings": [
          {
            "meaning": "What Time",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          662,
          582
        ]
      }
    },
    {
      "id": 2962,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2962",
      "data_updated_at": "2017-10-18T23:12:03.472262Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:45:04.000000Z",
        "slug": "同時",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8C%E6%99%82",
        "characters": "同時",
        "meanings": [
          {
            "meaning": "Same Time",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どうじ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          662,
          568
        ]
      }
    },
    {
      "id": 2963,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2963",
      "data_updated_at": "2017-10-18T23:12:03.954581Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:46:44.000000Z",
        "slug": "紙",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B4%99",
        "characters": "紙",
        "meanings": [
          {
            "meaning": "Paper",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          663
        ]
      }
    },
    {
      "id": 2964,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2964",
      "data_updated_at": "2017-10-18T23:12:02.656799Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:46:52.000000Z",
        "slug": "手紙",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%89%8B%E7%B4%99",
        "characters": "手紙",
        "meanings": [
          {
            "meaning": "Letter",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てがみ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          663,
          474
        ]
      }
    },
    {
      "id": 2965,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2965",
      "data_updated_at": "2017-10-18T23:12:00.442037Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:46:59.000000Z",
        "slug": "日記",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A5%E8%A8%98",
        "characters": "日記",
        "meanings": [
          {
            "meaning": "Diary",
            "primary": true
          },
          {
            "meaning": "Journal",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にっき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          664,
          476
        ]
      }
    },
    {
      "id": 2966,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2966",
      "data_updated_at": "2017-10-18T23:12:04.076379Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:47:06.000000Z",
        "slug": "通る",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%9A%E3%82%8B",
        "characters": "通る",
        "meanings": [
          {
            "meaning": "To Pass",
            "primary": true
          },
          {
            "meaning": "To Pass Through",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とおる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          665
        ]
      }
    },
    {
      "id": 2967,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2967",
      "data_updated_at": "2018-03-05T20:14:44.027736Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:47:23.000000Z",
        "slug": "交通",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%A4%E9%80%9A",
        "characters": "交通",
        "meanings": [
          {
            "meaning": "Traffic",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうつう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          665,
          565
        ]
      }
    },
    {
      "id": 2968,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2968",
      "data_updated_at": "2017-10-18T23:12:01.512910Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:47:33.000000Z",
        "slug": "高い",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%AB%98%E3%81%84",
        "characters": "高い",
        "meanings": [
          {
            "meaning": "Tall",
            "primary": true
          },
          {
            "meaning": "High",
            "primary": false
          },
          {
            "meaning": "Expensive",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たかい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          666
        ]
      }
    },
    {
      "id": 2969,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2969",
      "data_updated_at": "2017-10-18T23:12:01.572102Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:47:41.000000Z",
        "slug": "強い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%B7%E3%81%84",
        "characters": "強い",
        "meanings": [
          {
            "meaning": "Strong",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つよい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          667
        ]
      }
    },
    {
      "id": 2970,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2970",
      "data_updated_at": "2017-10-18T23:12:02.766092Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:47:48.000000Z",
        "slug": "強力",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%B7%E5%8A%9B",
        "characters": "強力",
        "meanings": [
          {
            "meaning": "Strength",
            "primary": true
          },
          {
            "meaning": "Strong",
            "primary": false
          },
          {
            "meaning": "Powerful",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうりょく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          667,
          447
        ]
      }
    },
    {
      "id": 2971,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2971",
      "data_updated_at": "2017-10-18T23:12:02.263619Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:47:55.000000Z",
        "slug": "教える",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%99%E3%81%88%E3%82%8B",
        "characters": "教える",
        "meanings": [
          {
            "meaning": "To Teach",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おしえる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          668
        ]
      }
    },
    {
      "id": 2972,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2972",
      "data_updated_at": "2017-10-18T23:12:03.534052Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:48:13.000000Z",
        "slug": "教室",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%99%E5%AE%A4",
        "characters": "教室",
        "meanings": [
          {
            "meaning": "Classroom",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうしつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          668,
          635
        ]
      }
    },
    {
      "id": 2973,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2973",
      "data_updated_at": "2017-10-18T23:12:00.931237Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:48:21.000000Z",
        "slug": "心理学",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%83%E7%90%86%E5%AD%A6",
        "characters": "心理学",
        "meanings": [
          {
            "meaning": "Psychology",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんりがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          669,
          599,
          508
        ]
      }
    },
    {
      "id": 2974,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2974",
      "data_updated_at": "2017-10-18T23:12:00.801095Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:48:28.000000Z",
        "slug": "地理",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%B0%E7%90%86",
        "characters": "地理",
        "meanings": [
          {
            "meaning": "Geography",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          669,
          608
        ]
      }
    },
    {
      "id": 2975,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2975",
      "data_updated_at": "2017-10-18T23:12:00.999679Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:49:15.000000Z",
        "slug": "組",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B5%84",
        "characters": "組",
        "meanings": [
          {
            "meaning": "Group",
            "primary": true
          },
          {
            "meaning": "Team",
            "primary": false
          },
          {
            "meaning": "Class",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くみ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          670
        ]
      }
    },
    {
      "id": 2976,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2976",
      "data_updated_at": "2017-10-18T23:12:00.581705Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:49:23.000000Z",
        "slug": "船",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%88%B9",
        "characters": "船",
        "meanings": [
          {
            "meaning": "Boat",
            "primary": true
          },
          {
            "meaning": "Ship",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふね"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          671
        ]
      }
    },
    {
      "id": 2977,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2977",
      "data_updated_at": "2017-10-18T23:12:01.200920Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:49:30.000000Z",
        "slug": "風船",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A2%A8%E8%88%B9",
        "characters": "風船",
        "meanings": [
          {
            "meaning": "Balloon",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふうせん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          853,
          671
        ]
      }
    },
    {
      "id": 2978,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2978",
      "data_updated_at": "2017-10-18T23:12:05.378347Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:49:39.000000Z",
        "slug": "先週",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E9%80%B1",
        "characters": "先週",
        "meanings": [
          {
            "meaning": "Last Week",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんしゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          672,
          543
        ]
      }
    },
    {
      "id": 2979,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2979",
      "data_updated_at": "2017-10-18T23:11:59.879350Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:49:46.000000Z",
        "slug": "今週",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E9%80%B1",
        "characters": "今週",
        "meanings": [
          {
            "meaning": "This Week",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんしゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          672,
          497
        ]
      }
    },
    {
      "id": 2980,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2980",
      "data_updated_at": "2017-10-18T23:12:02.590808Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:51:59.000000Z",
        "slug": "週末",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%B1%E6%9C%AB",
        "characters": "週末",
        "meanings": [
          {
            "meaning": "Weekend",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅうまつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          672,
          657
        ]
      }
    },
    {
      "id": 2981,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2981",
      "data_updated_at": "2017-10-18T23:11:59.833652Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:52:12.000000Z",
        "slug": "雪",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%AA",
        "characters": "雪",
        "meanings": [
          {
            "meaning": "Snow",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          673
        ]
      }
    },
    {
      "id": 2982,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2982",
      "data_updated_at": "2017-10-18T23:12:00.273096Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:52:41.000000Z",
        "slug": "魚",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%AD%9A",
        "characters": "魚",
        "meanings": [
          {
            "meaning": "Fish",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さかな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          674
        ]
      }
    },
    {
      "id": 2983,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2983",
      "data_updated_at": "2017-10-18T23:12:00.695865Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:52:50.000000Z",
        "slug": "金魚",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%91%E9%AD%9A",
        "characters": "金魚",
        "meanings": [
          {
            "meaning": "Goldfish",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きんぎょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          674,
          602
        ]
      }
    },
    {
      "id": 2984,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2984",
      "data_updated_at": "2017-10-18T23:12:04.019378Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:52:58.000000Z",
        "slug": "海魚",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B5%B7%E9%AD%9A",
        "characters": "海魚",
        "meanings": [
          {
            "meaning": "Ocean Fish",
            "primary": true
          },
          {
            "meaning": "Saltwater Fish",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいぎょ"
          },
          {
            "primary": false,
            "reading": "うみざかな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          674,
          640
        ]
      }
    },
    {
      "id": 2985,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2985",
      "data_updated_at": "2017-10-18T23:12:00.137580Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:53:04.000000Z",
        "slug": "鳥",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%B3%A5",
        "characters": "鳥",
        "meanings": [
          {
            "meaning": "Bird",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          675
        ]
      }
    },
    {
      "id": 2986,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2986",
      "data_updated_at": "2017-10-18T23:12:01.416081Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:53:22.000000Z",
        "slug": "白鳥",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BD%E9%B3%A5",
        "characters": "白鳥",
        "meanings": [
          {
            "meaning": "Swan",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はくちょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          675,
          491
        ]
      }
    },
    {
      "id": 2987,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2987",
      "data_updated_at": "2017-10-18T23:12:01.879906Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:53:30.000000Z",
        "slug": "黄色",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%BB%84%E8%89%B2",
        "characters": "黄色",
        "meanings": [
          {
            "meaning": "Yellow",
            "primary": true
          },
          {
            "meaning": "Yellow Colour",
            "primary": false
          },
          {
            "meaning": "Yellow Color",
            "primary": false
          },
          {
            "meaning": "Colour Yellow",
            "primary": false
          },
          {
            "meaning": "Color Yellow",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きいろ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          676,
          579
        ]
      }
    },
    {
      "id": 2988,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2988",
      "data_updated_at": "2017-10-18T23:12:01.460586Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:54:00.000000Z",
        "slug": "黒い",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%BB%92%E3%81%84",
        "characters": "黒い",
        "meanings": [
          {
            "meaning": "Black",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くろい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          677
        ]
      }
    },
    {
      "id": 2989,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2989",
      "data_updated_at": "2017-10-18T23:12:00.181616Z",
      "data": {
        "level": 7,
        "created_at": "2012-03-27T18:54:09.000000Z",
        "slug": "黒人",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%BB%92%E4%BA%BA",
        "characters": "黒人",
        "meanings": [
          {
            "meaning": "Black Person",
            "primary": true
          },
          {
            "meaning": "Black People",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こくじん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          677,
          444
        ]
      }
    },
    {
      "id": 2990,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2990",
      "data_updated_at": "2017-10-18T23:12:08.207948Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:34:47.000000Z",
        "slug": "馬",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A6%AC",
        "characters": "馬",
        "meanings": [
          {
            "meaning": "Horse",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          692
        ]
      }
    },
    {
      "id": 2991,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2991",
      "data_updated_at": "2017-10-18T23:12:06.558491Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:34:58.000000Z",
        "slug": "馬力",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A6%AC%E5%8A%9B",
        "characters": "馬力",
        "meanings": [
          {
            "meaning": "Horsepower",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ばりき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          692,
          447
        ]
      }
    },
    {
      "id": 2992,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2992",
      "data_updated_at": "2017-10-18T23:12:13.658190Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:35:30.000000Z",
        "slug": "支える",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%94%AF%E3%81%88%E3%82%8B",
        "characters": "支える",
        "meanings": [
          {
            "meaning": "To Support",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ささえる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          678
        ]
      }
    },
    {
      "id": 2993,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2993",
      "data_updated_at": "2017-10-18T23:12:07.517696Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:35:37.000000Z",
        "slug": "支店",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%94%AF%E5%BA%97",
        "characters": "支店",
        "meanings": [
          {
            "meaning": "Branch Office",
            "primary": true
          },
          {
            "meaning": "Branch Store",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "してん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          678,
          625
        ]
      }
    },
    {
      "id": 2994,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2994",
      "data_updated_at": "2017-10-18T23:12:11.706055Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:35:44.000000Z",
        "slug": "住む",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%8F%E3%82%80",
        "characters": "住む",
        "meanings": [
          {
            "meaning": "To Live",
            "primary": true
          },
          {
            "meaning": "To Dwell",
            "primary": false
          },
          {
            "meaning": "To Reside",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すむ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          679
        ]
      }
    },
    {
      "id": 2995,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2995",
      "data_updated_at": "2017-10-18T23:12:05.785613Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:35:51.000000Z",
        "slug": "住人",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%8F%E4%BA%BA",
        "characters": "住人",
        "meanings": [
          {
            "meaning": "Resident",
            "primary": true
          },
          {
            "meaning": "Inhabitant",
            "primary": false
          },
          {
            "meaning": "Dweller",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうにん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          679,
          444
        ]
      }
    },
    {
      "id": 2996,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2996",
      "data_updated_at": "2017-10-18T23:12:16.502123Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-05T23:35:58.000000Z",
        "slug": "住民",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%8F%E6%B0%91",
        "characters": "住民",
        "meanings": [
          {
            "meaning": "Residents",
            "primary": true
          },
          {
            "meaning": "Citizens",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうみん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          679,
          650
        ]
      }
    },
    {
      "id": 2997,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2997",
      "data_updated_at": "2017-10-18T23:12:10.804579Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:13.000000Z",
        "slug": "助ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%A9%E3%81%91%E3%82%8B",
        "characters": "助ける",
        "meanings": [
          {
            "meaning": "To Help",
            "primary": true
          },
          {
            "meaning": "To Save",
            "primary": false
          },
          {
            "meaning": "To Rescue",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たすける"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          680
        ]
      }
    },
    {
      "id": 2998,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2998",
      "data_updated_at": "2017-10-18T23:12:11.755712Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:20.000000Z",
        "slug": "助力",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%A9%E5%8A%9B",
        "characters": "助力",
        "meanings": [
          {
            "meaning": "Assistance",
            "primary": true
          },
          {
            "meaning": "Support",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょりょく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          680,
          447
        ]
      }
    },
    {
      "id": 2999,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/2999",
      "data_updated_at": "2017-10-18T23:12:07.155335Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:27.000000Z",
        "slug": "助手",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%A9%E6%89%8B",
        "characters": "助手",
        "meanings": [
          {
            "meaning": "Assistant",
            "primary": true
          },
          {
            "meaning": "Helper",
            "primary": false
          },
          {
            "meaning": "Aide",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょしゅ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          680,
          474
        ]
      }
    },
    {
      "id": 3000,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3000",
      "data_updated_at": "2017-10-18T23:12:06.027207Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:35.000000Z",
        "slug": "助言",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%A9%E8%A8%80",
        "characters": "助言",
        "meanings": [
          {
            "meaning": "Advice",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょげん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          680,
          593
        ]
      }
    },
    {
      "id": 3001,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3001",
      "data_updated_at": "2017-10-18T23:12:08.416522Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:44.000000Z",
        "slug": "医大",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8C%BB%E5%A4%A7",
        "characters": "医大",
        "meanings": [
          {
            "meaning": "Medical University",
            "primary": true
          },
          {
            "meaning": "Medical School",
            "primary": false
          },
          {
            "meaning": "Med School",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いだい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          681,
          453
        ]
      }
    },
    {
      "id": 3002,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3002",
      "data_updated_at": "2017-10-18T23:12:06.611746Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:52.000000Z",
        "slug": "医学",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8C%BB%E5%AD%A6",
        "characters": "医学",
        "meanings": [
          {
            "meaning": "Medical Science",
            "primary": true
          },
          {
            "meaning": "Medicine",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          681,
          599
        ]
      }
    },
    {
      "id": 3003,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3003",
      "data_updated_at": "2017-10-18T23:12:07.729132Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:36:59.000000Z",
        "slug": "医者",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8C%BB%E8%80%85",
        "characters": "医者",
        "meanings": [
          {
            "meaning": "Doctor",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          690,
          681
        ]
      }
    },
    {
      "id": 3004,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3004",
      "data_updated_at": "2017-10-18T23:12:08.559855Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:37:21.000000Z",
        "slug": "君主国",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%9B%E4%B8%BB%E5%9B%BD",
        "characters": "君主国",
        "meanings": [
          {
            "meaning": "Monarchy",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くんしゅこく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          682,
          621,
          528
        ]
      }
    },
    {
      "id": 3005,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3005",
      "data_updated_at": "2017-10-18T23:12:11.247953Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:37:28.000000Z",
        "slug": "君",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%9B",
        "characters": "君",
        "meanings": [
          {
            "meaning": "You",
            "primary": true
          },
          {
            "meaning": "Buddy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きみ"
          }
        ],
        "parts_of_speech": [
          "pronoun"
        ],
        "component_subject_ids": [
          682
        ]
      }
    },
    {
      "id": 3006,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3006",
      "data_updated_at": "2017-10-18T23:12:11.856620Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:37:35.000000Z",
        "slug": "〜君",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E5%90%9B",
        "characters": "〜君",
        "meanings": [
          {
            "meaning": "Boy Name Ender",
            "primary": true
          },
          {
            "meaning": "Male Name Ender",
            "primary": false
          },
          {
            "meaning": "Boy Name Suffix",
            "primary": false
          },
          {
            "meaning": "Male Name Suffix",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          682
        ]
      }
    },
    {
      "id": 3007,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3007",
      "data_updated_at": "2017-12-27T18:54:07.812983Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:37:53.000000Z",
        "slug": "対する",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AF%BE%E3%81%99%E3%82%8B",
        "characters": "対する",
        "meanings": [
          {
            "meaning": "To Compare To",
            "primary": true
          },
          {
            "meaning": "To Face Each Other",
            "primary": false
          },
          {
            "meaning": "To Oppose",
            "primary": false
          },
          {
            "meaning": "To Compare",
            "primary": false
          },
          {
            "meaning": "To Contrast",
            "primary": false
          },
          {
            "meaning": "To Contrast To",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          683
        ]
      }
    },
    {
      "id": 3008,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3008",
      "data_updated_at": "2017-10-18T23:12:08.007786Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:01.000000Z",
        "slug": "対外",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AF%BE%E5%A4%96",
        "characters": "対外",
        "meanings": [
          {
            "meaning": "Foreign",
            "primary": true
          },
          {
            "meaning": "Overseas",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいがい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          683,
          521
        ]
      }
    },
    {
      "id": 3009,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3009",
      "data_updated_at": "2017-10-18T23:12:09.074536Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:15.000000Z",
        "slug": "対立",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AF%BE%E7%AB%8B",
        "characters": "対立",
        "meanings": [
          {
            "meaning": "Confrontation",
            "primary": true
          },
          {
            "meaning": "Opposition",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいりつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          683,
          494
        ]
      }
    },
    {
      "id": 3010,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3010",
      "data_updated_at": "2017-10-18T23:12:11.969318Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:22.000000Z",
        "slug": "反対",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%8D%E5%AF%BE",
        "characters": "反対",
        "meanings": [
          {
            "meaning": "Opposition",
            "primary": true
          },
          {
            "meaning": "Opposite",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はんたい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          855,
          683
        ]
      }
    },
    {
      "id": 3011,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3011",
      "data_updated_at": "2017-10-18T23:12:12.235621Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:29.000000Z",
        "slug": "局",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B1%80",
        "characters": "局",
        "meanings": [
          {
            "meaning": "Bureau",
            "primary": true
          },
          {
            "meaning": "Department",
            "primary": false
          },
          {
            "meaning": "Station",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          684
        ]
      }
    },
    {
      "id": 3012,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3012",
      "data_updated_at": "2017-10-18T23:12:07.444518Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:35.000000Z",
        "slug": "支局",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%94%AF%E5%B1%80",
        "characters": "支局",
        "meanings": [
          {
            "meaning": "Branch Office",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しきょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          684,
          678
        ]
      }
    },
    {
      "id": 3013,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3013",
      "data_updated_at": "2017-10-18T23:12:12.278053Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:43.000000Z",
        "slug": "役",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%B9",
        "characters": "役",
        "meanings": [
          {
            "meaning": "Role",
            "primary": true
          },
          {
            "meaning": "Part",
            "primary": false
          },
          {
            "meaning": "Duty",
            "primary": false
          },
          {
            "meaning": "Service",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          685
        ]
      }
    },
    {
      "id": 3014,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3014",
      "data_updated_at": "2017-10-18T23:12:09.417205Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:49.000000Z",
        "slug": "役人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%B9%E4%BA%BA",
        "characters": "役人",
        "meanings": [
          {
            "meaning": "Public Official",
            "primary": true
          },
          {
            "meaning": "Government Official",
            "primary": false
          },
          {
            "meaning": "Public Servant",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やくにん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          685,
          444
        ]
      }
    },
    {
      "id": 3015,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3015",
      "data_updated_at": "2017-10-18T23:12:10.480906Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:38:56.000000Z",
        "slug": "役に立つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%B9%E3%81%AB%E7%AB%8B%E3%81%A4",
        "characters": "役に立つ",
        "meanings": [
          {
            "meaning": "To Be Useful",
            "primary": true
          },
          {
            "meaning": "To Be Of Use",
            "primary": false
          },
          {
            "meaning": "To Be Helpful",
            "primary": false
          },
          {
            "meaning": "To Be Of Service",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やくにたつ"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          685,
          494
        ]
      }
    },
    {
      "id": 3016,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3016",
      "data_updated_at": "2017-10-18T23:12:06.117410Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:39:03.000000Z",
        "slug": "大役",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E5%BD%B9",
        "characters": "大役",
        "meanings": [
          {
            "meaning": "Important Task",
            "primary": true
          },
          {
            "meaning": "Great Duty",
            "primary": false
          },
          {
            "meaning": "Important Role",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいやく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          685,
          453
        ]
      }
    },
    {
      "id": 3017,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3017",
      "data_updated_at": "2017-10-18T23:12:12.437186Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:39:09.000000Z",
        "slug": "決",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B1%BA",
        "characters": "決",
        "meanings": [
          {
            "meaning": "Decision",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          687
        ]
      }
    },
    {
      "id": 3018,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3018",
      "data_updated_at": "2017-10-18T23:12:12.398728Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:39:16.000000Z",
        "slug": "決める",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B1%BA%E3%82%81%E3%82%8B",
        "characters": "決める",
        "meanings": [
          {
            "meaning": "To Decide",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きめる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          687
        ]
      }
    },
    {
      "id": 3019,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3019",
      "data_updated_at": "2017-10-18T23:12:07.660956Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:39:31.000000Z",
        "slug": "決心",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B1%BA%E5%BF%83",
        "characters": "決心",
        "meanings": [
          {
            "meaning": "Determination",
            "primary": true
          },
          {
            "meaning": "Resolution",
            "primary": false
          },
          {
            "meaning": "Conviction",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けっしん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          687,
          508
        ]
      }
    },
    {
      "id": 3020,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3020",
      "data_updated_at": "2017-10-18T23:12:09.013404Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:39:39.000000Z",
        "slug": "未決",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AA%E6%B1%BA",
        "characters": "未決",
        "meanings": [
          {
            "meaning": "Pending",
            "primary": true
          },
          {
            "meaning": "Unsettled",
            "primary": false
          },
          {
            "meaning": "Undecided",
            "primary": false
          },
          {
            "meaning": "Not Yet Decided",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みけつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          687,
          656
        ]
      }
    },
    {
      "id": 3021,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3021",
      "data_updated_at": "2017-10-18T23:12:12.565928Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:39:48.000000Z",
        "slug": "自決",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%87%AA%E6%B1%BA",
        "characters": "自決",
        "meanings": [
          {
            "meaning": "Suicide",
            "primary": true
          },
          {
            "meaning": "Self Determination",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じけつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          687,
          578
        ]
      }
    },
    {
      "id": 3022,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3022",
      "data_updated_at": "2017-10-18T23:12:08.264399Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:40:13.000000Z",
        "slug": "究明",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A9%B6%E6%98%8E",
        "characters": "究明",
        "meanings": [
          {
            "meaning": "Investigation",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゅうめい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          688,
          626
        ]
      }
    },
    {
      "id": 3023,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3023",
      "data_updated_at": "2017-10-18T23:12:08.352311Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:40:23.000000Z",
        "slug": "研究",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A0%94%E7%A9%B6",
        "characters": "研究",
        "meanings": [
          {
            "meaning": "Investigation",
            "primary": true
          },
          {
            "meaning": "Study",
            "primary": false
          },
          {
            "meaning": "Research",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けんきゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          691,
          688
        ]
      }
    },
    {
      "id": 3024,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3024",
      "data_updated_at": "2017-10-18T23:12:22.759898Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-05T23:40:30.000000Z",
        "slug": "研究室",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A0%94%E7%A9%B6%E5%AE%A4",
        "characters": "研究室",
        "meanings": [
          {
            "meaning": "Laboratory",
            "primary": true
          },
          {
            "meaning": "Lab",
            "primary": false
          },
          {
            "meaning": "Study Room",
            "primary": false
          },
          {
            "meaning": "Professor's Office",
            "primary": false
          },
          {
            "meaning": "Teacher's Office",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けんきゅうしつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          691,
          688,
          635
        ]
      }
    },
    {
      "id": 3025,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3025",
      "data_updated_at": "2017-10-18T23:12:10.627670Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:40:46.000000Z",
        "slug": "投げる",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%8A%95%E3%81%92%E3%82%8B",
        "characters": "投げる",
        "meanings": [
          {
            "meaning": "To Throw",
            "primary": true
          },
          {
            "meaning": "To Throw Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なげる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          686
        ]
      }
    },
    {
      "id": 3026,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3026",
      "data_updated_at": "2017-10-18T23:12:07.271358Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:41:07.000000Z",
        "slug": "心身",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%83%E8%BA%AB",
        "characters": "心身",
        "meanings": [
          {
            "meaning": "Body And Mind",
            "primary": true
          },
          {
            "meaning": "Mind And Body",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんしん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          689,
          508
        ]
      }
    },
    {
      "id": 3027,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3027",
      "data_updated_at": "2017-10-18T23:12:09.949187Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:41:13.000000Z",
        "slug": "身体",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BA%AB%E4%BD%93",
        "characters": "身体",
        "meanings": [
          {
            "meaning": "The Body",
            "primary": true
          },
          {
            "meaning": "Health",
            "primary": false
          },
          {
            "meaning": "Body",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんたい"
          },
          {
            "primary": false,
            "reading": "からだ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          689,
          583
        ]
      }
    },
    {
      "id": 3028,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3028",
      "data_updated_at": "2017-10-18T23:12:12.520730Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:41:21.000000Z",
        "slug": "全身",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E8%BA%AB",
        "characters": "全身",
        "meanings": [
          {
            "meaning": "Whole Body",
            "primary": true
          },
          {
            "meaning": "Entire Body",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぜんしん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          689,
          610
        ]
      }
    },
    {
      "id": 3029,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3029",
      "data_updated_at": "2017-10-18T23:12:06.491692Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:42:21.000000Z",
        "slug": "森",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A3%AE",
        "characters": "森",
        "meanings": [
          {
            "meaning": "Woods",
            "primary": true
          },
          {
            "meaning": "Forest",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          693
        ]
      }
    },
    {
      "id": 3030,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3030",
      "data_updated_at": "2017-10-18T23:12:07.343938Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:42:58.000000Z",
        "slug": "両者",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%A1%E8%80%85",
        "characters": "両者",
        "meanings": [
          {
            "meaning": "Both People",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りょうしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          690,
          609
        ]
      }
    },
    {
      "id": 3031,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3031",
      "data_updated_at": "2017-10-18T23:12:11.618473Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:43:05.000000Z",
        "slug": "作者",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E8%80%85",
        "characters": "作者",
        "meanings": [
          {
            "meaning": "Author",
            "primary": true
          },
          {
            "meaning": "Writer",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さくしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          690,
          584
        ]
      }
    },
    {
      "id": 3032,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3032",
      "data_updated_at": "2017-10-18T23:12:06.325255Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:43:19.000000Z",
        "slug": "学者",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E8%80%85",
        "characters": "学者",
        "meanings": [
          {
            "meaning": "Scholar",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がくしゃ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          690,
          599
        ]
      }
    },
    {
      "id": 3033,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3033",
      "data_updated_at": "2017-10-18T23:12:10.960579Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:43:27.000000Z",
        "slug": "工学者",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A5%E5%AD%A6%E8%80%85",
        "characters": "工学者",
        "meanings": [
          {
            "meaning": "Engineer",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうがくしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          690,
          599,
          457
        ]
      }
    },
    {
      "id": 3034,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3034",
      "data_updated_at": "2017-11-30T20:11:30.281519Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:45:07.000000Z",
        "slug": "場合",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A0%B4%E5%90%88",
        "characters": "場合",
        "meanings": [
          {
            "meaning": "Case",
            "primary": true
          },
          {
            "meaning": "Circumstance",
            "primary": false
          },
          {
            "meaning": "Situation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ばあい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          852,
          694
        ]
      }
    },
    {
      "id": 3035,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3035",
      "data_updated_at": "2017-10-18T23:12:06.251508Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:45:15.000000Z",
        "slug": "場所",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A0%B4%E6%89%80",
        "characters": "場所",
        "meanings": [
          {
            "meaning": "Place",
            "primary": true
          },
          {
            "meaning": "Location",
            "primary": false
          },
          {
            "meaning": "Spot",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ばしょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          707,
          694
        ]
      }
    },
    {
      "id": 3036,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3036",
      "data_updated_at": "2017-11-30T20:14:01.545624Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:45:23.000000Z",
        "slug": "入場",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E5%A0%B4",
        "characters": "入場",
        "meanings": [
          {
            "meaning": "Entrance",
            "primary": true
          },
          {
            "meaning": "Admission",
            "primary": false
          },
          {
            "meaning": "Entering",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にゅうじょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          694,
          445
        ]
      }
    },
    {
      "id": 3037,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3037",
      "data_updated_at": "2017-10-18T23:12:11.570897Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:45:33.000000Z",
        "slug": "工場",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A5%E5%A0%B4",
        "characters": "工場",
        "meanings": [
          {
            "meaning": "Factory",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうじょう"
          },
          {
            "primary": false,
            "reading": "こうば"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          694,
          457
        ]
      }
    },
    {
      "id": 3038,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3038",
      "data_updated_at": "2017-10-18T23:12:09.317761Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:45:48.000000Z",
        "slug": "所",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%89%80",
        "characters": "所",
        "meanings": [
          {
            "meaning": "Place",
            "primary": true
          },
          {
            "meaning": "Spot",
            "primary": false
          },
          {
            "meaning": "Scene",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ところ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          707
        ]
      }
    },
    {
      "id": 3039,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3039",
      "data_updated_at": "2017-10-18T23:12:13.385695Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:45:55.000000Z",
        "slug": "入所",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A5%E6%89%80",
        "characters": "入所",
        "meanings": [
          {
            "meaning": "Admission",
            "primary": true
          },
          {
            "meaning": "Entrance",
            "primary": false
          },
          {
            "meaning": "Imprisonment",
            "primary": false
          },
          {
            "meaning": "Internment",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にゅうしょ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          707,
          445
        ]
      }
    },
    {
      "id": 3040,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3040",
      "data_updated_at": "2017-10-18T23:12:12.139251Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:46:02.000000Z",
        "slug": "出所",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E6%89%80",
        "characters": "出所",
        "meanings": [
          {
            "meaning": "Source",
            "primary": true
          },
          {
            "meaning": "Origin",
            "primary": false
          },
          {
            "meaning": "Place Of Origin",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅっしょ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          707,
          483
        ]
      }
    },
    {
      "id": 3041,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3041",
      "data_updated_at": "2017-10-18T23:12:06.912382Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:46:09.000000Z",
        "slug": "他所",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%96%E6%89%80",
        "characters": "他所",
        "meanings": [
          {
            "meaning": "Another Place",
            "primary": true
          },
          {
            "meaning": "Somewhere Else",
            "primary": false
          },
          {
            "meaning": "Other Place",
            "primary": false
          },
          {
            "meaning": "Elsewhere",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たしょ"
          },
          {
            "primary": false,
            "reading": "よそ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          707,
          529
        ]
      }
    },
    {
      "id": 3042,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3042",
      "data_updated_at": "2017-10-18T23:12:05.737302Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:46:33.000000Z",
        "slug": "名所",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E6%89%80",
        "characters": "名所",
        "meanings": [
          {
            "meaning": "Famous Place",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "めいしょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          707,
          544
        ]
      }
    },
    {
      "id": 3043,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3043",
      "data_updated_at": "2017-10-18T23:12:05.984502Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:46:49.000000Z",
        "slug": "住所",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%8F%E6%89%80",
        "characters": "住所",
        "meanings": [
          {
            "meaning": "Address",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうしょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          707,
          679
        ]
      }
    },
    {
      "id": 3044,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3044",
      "data_updated_at": "2017-10-18T23:12:08.605301Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:02.000000Z",
        "slug": "朝",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%9D",
        "characters": "朝",
        "meanings": [
          {
            "meaning": "Morning",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あさ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          695
        ]
      }
    },
    {
      "id": 3045,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3045",
      "data_updated_at": "2017-10-18T23:12:12.475234Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:12.000000Z",
        "slug": "朝ごはん",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%9D%E3%81%94%E3%81%AF%E3%82%93",
        "characters": "朝ごはん",
        "meanings": [
          {
            "meaning": "Breakfast",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あさごはん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          695
        ]
      }
    },
    {
      "id": 3046,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3046",
      "data_updated_at": "2017-11-03T16:46:55.799185Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:20.000000Z",
        "slug": "朝日",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%9D%E6%97%A5",
        "characters": "朝日",
        "meanings": [
          {
            "meaning": "Morning Sun",
            "primary": true
          },
          {
            "meaning": "Rising Sun",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あさひ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          695,
          476
        ]
      }
    },
    {
      "id": 3047,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3047",
      "data_updated_at": "2017-10-18T23:12:08.845360Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:26.000000Z",
        "slug": "番号",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%95%AA%E5%8F%B7",
        "characters": "番号",
        "meanings": [
          {
            "meaning": "Number",
            "primary": true
          },
          {
            "meaning": "Series Of Digits",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ばんごう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          696,
          533
        ]
      }
    },
    {
      "id": 3048,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3048",
      "data_updated_at": "2017-10-18T23:12:09.148472Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:34.000000Z",
        "slug": "一番",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E7%95%AA",
        "characters": "一番",
        "meanings": [
          {
            "meaning": "Number One",
            "primary": true
          },
          {
            "meaning": "The First",
            "primary": false
          },
          {
            "meaning": "First",
            "primary": false
          },
          {
            "meaning": "The Best",
            "primary": false
          },
          {
            "meaning": "Best",
            "primary": false
          },
          {
            "meaning": "The Most",
            "primary": false
          },
          {
            "meaning": "Most",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちばん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          696,
          440
        ]
      }
    },
    {
      "id": 3049,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3049",
      "data_updated_at": "2017-10-18T23:12:06.727097Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:44.000000Z",
        "slug": "二番",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E7%95%AA",
        "characters": "二番",
        "meanings": [
          {
            "meaning": "Number Two",
            "primary": true
          },
          {
            "meaning": "Second",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にばん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          696,
          441
        ]
      }
    },
    {
      "id": 3050,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3050",
      "data_updated_at": "2017-10-18T23:12:06.443161Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:47:52.000000Z",
        "slug": "交番",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%A4%E7%95%AA",
        "characters": "交番",
        "meanings": [
          {
            "meaning": "Police Box",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうばん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          696,
          565
        ]
      }
    },
    {
      "id": 3051,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3051",
      "data_updated_at": "2017-10-18T23:12:07.060622Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:48:37.000000Z",
        "slug": "答え",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AD%94%E3%81%88",
        "characters": "答え",
        "meanings": [
          {
            "meaning": "Answer",
            "primary": true
          },
          {
            "meaning": "Reply",
            "primary": false
          },
          {
            "meaning": "Response",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こたえ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          697
        ]
      }
    },
    {
      "id": 3052,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3052",
      "data_updated_at": "2017-10-18T23:12:10.209946Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:48:46.000000Z",
        "slug": "答える",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AD%94%E3%81%88%E3%82%8B",
        "characters": "答える",
        "meanings": [
          {
            "meaning": "To Answer",
            "primary": true
          },
          {
            "meaning": "To Reply",
            "primary": false
          },
          {
            "meaning": "To Respond",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こたえる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          697
        ]
      }
    },
    {
      "id": 3053,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3053",
      "data_updated_at": "2017-10-18T23:12:05.845751Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:48:53.000000Z",
        "slug": "絵",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B5%B5",
        "characters": "絵",
        "meanings": [
          {
            "meaning": "Painting",
            "primary": true
          },
          {
            "meaning": "Drawing",
            "primary": false
          },
          {
            "meaning": "Picture",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "え"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          698
        ]
      }
    },
    {
      "id": 3054,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3054",
      "data_updated_at": "2017-10-18T23:12:06.164997Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:49:04.000000Z",
        "slug": "買う",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B2%B7%E3%81%86",
        "characters": "買う",
        "meanings": [
          {
            "meaning": "To Buy",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          699
        ]
      }
    },
    {
      "id": 3055,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3055",
      "data_updated_at": "2017-10-18T23:12:09.475497Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:49:18.000000Z",
        "slug": "道",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%93",
        "characters": "道",
        "meanings": [
          {
            "meaning": "Road",
            "primary": true
          },
          {
            "meaning": "Street",
            "primary": false
          },
          {
            "meaning": "Path",
            "primary": false
          },
          {
            "meaning": "Way",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          700
        ]
      }
    },
    {
      "id": 3056,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3056",
      "data_updated_at": "2017-10-18T23:12:09.551662Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:49:33.000000Z",
        "slug": "歩道",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%A9%E9%81%93",
        "characters": "歩道",
        "meanings": [
          {
            "meaning": "Sidewalk",
            "primary": true
          },
          {
            "meaning": "Footpath",
            "primary": false
          },
          {
            "meaning": "Pavement",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほどう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          700,
          628
        ]
      }
    },
    {
      "id": 3057,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3057",
      "data_updated_at": "2017-10-18T23:12:08.478053Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:49:47.000000Z",
        "slug": "〜道",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E9%81%93",
        "characters": "〜道",
        "meanings": [
          {
            "meaning": "Method Of",
            "primary": true
          },
          {
            "meaning": "Way",
            "primary": false
          },
          {
            "meaning": "Style",
            "primary": false
          },
          {
            "meaning": "Way Of",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          700
        ]
      }
    },
    {
      "id": 3058,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3058",
      "data_updated_at": "2017-12-19T23:18:30.498819Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:49:57.000000Z",
        "slug": "間",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%96%93",
        "characters": "間",
        "meanings": [
          {
            "meaning": "Interval",
            "primary": true
          },
          {
            "meaning": "Interval Of Time",
            "primary": false
          },
          {
            "meaning": "Time Interval",
            "primary": false
          },
          {
            "meaning": "Between",
            "primary": false
          },
          {
            "meaning": "Room",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あいだ"
          },
          {
            "primary": false,
            "reading": "ま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          701
        ]
      }
    },
    {
      "id": 3059,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3059",
      "data_updated_at": "2017-10-18T23:12:10.139355Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:50:04.000000Z",
        "slug": "時間",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%99%82%E9%96%93",
        "characters": "時間",
        "meanings": [
          {
            "meaning": "Time",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じかん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          701,
          662
        ]
      }
    },
    {
      "id": 3060,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3060",
      "data_updated_at": "2017-10-18T23:12:06.859728Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:50:12.000000Z",
        "slug": "〜間",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E9%96%93",
        "characters": "〜間",
        "meanings": [
          {
            "meaning": "Amount Of Time",
            "primary": true
          },
          {
            "meaning": "Interval Of Time",
            "primary": false
          },
          {
            "meaning": "Time Interval",
            "primary": false
          },
          {
            "meaning": "Period Of Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          701
        ]
      }
    },
    {
      "id": 3061,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3061",
      "data_updated_at": "2017-10-18T23:12:12.614962Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:50:20.000000Z",
        "slug": "人間",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA%E9%96%93",
        "characters": "人間",
        "meanings": [
          {
            "meaning": "Human",
            "primary": true
          },
          {
            "meaning": "Human Being",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にんげん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          701,
          444
        ]
      }
    },
    {
      "id": 3062,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3062",
      "data_updated_at": "2017-10-18T23:12:09.645659Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:50:34.000000Z",
        "slug": "間もなく",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%96%93%E3%82%82%E3%81%AA%E3%81%8F",
        "characters": "間もなく",
        "meanings": [
          {
            "meaning": "Soon",
            "primary": true
          },
          {
            "meaning": "Before Long",
            "primary": false
          },
          {
            "meaning": "In A Short Time",
            "primary": false
          },
          {
            "meaning": "Shortly",
            "primary": false
          },
          {
            "meaning": "Momentarily",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まもなく"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          701
        ]
      }
    },
    {
      "id": 3063,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3063",
      "data_updated_at": "2017-10-18T23:12:12.696428Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:50:48.000000Z",
        "slug": "空間",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A9%BA%E9%96%93",
        "characters": "空間",
        "meanings": [
          {
            "meaning": "Space",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くうかん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          701,
          601
        ]
      }
    },
    {
      "id": 3064,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3064",
      "data_updated_at": "2017-10-18T23:12:07.578968Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:50:55.000000Z",
        "slug": "雲",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%B2",
        "characters": "雲",
        "meanings": [
          {
            "meaning": "Cloud",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くも"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          702
        ]
      }
    },
    {
      "id": 3065,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3065",
      "data_updated_at": "2017-10-18T23:12:13.613138Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:51:16.000000Z",
        "slug": "数える",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%B0%E3%81%88%E3%82%8B",
        "characters": "数える",
        "meanings": [
          {
            "meaning": "To Count",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かぞえる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          703
        ]
      }
    },
    {
      "id": 3066,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3066",
      "data_updated_at": "2017-10-18T23:12:11.663686Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:51:23.000000Z",
        "slug": "数",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%B0",
        "characters": "数",
        "meanings": [
          {
            "meaning": "Number",
            "primary": true
          },
          {
            "meaning": "Count",
            "primary": false
          },
          {
            "meaning": "Amount",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かず"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          703
        ]
      }
    },
    {
      "id": 3067,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3067",
      "data_updated_at": "2017-10-18T23:12:08.905703Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:51:30.000000Z",
        "slug": "数字",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%B0%E5%AD%97",
        "characters": "数字",
        "meanings": [
          {
            "meaning": "Numeral",
            "primary": true
          },
          {
            "meaning": "Digit",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すうじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          703,
          545
        ]
      }
    },
    {
      "id": 3068,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3068",
      "data_updated_at": "2017-10-18T23:12:06.391182Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:51:39.000000Z",
        "slug": "数学",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%B0%E5%AD%A6",
        "characters": "数学",
        "meanings": [
          {
            "meaning": "Mathematics",
            "primary": true
          },
          {
            "meaning": "Math",
            "primary": false
          },
          {
            "meaning": "Maths",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すうがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          703,
          599
        ]
      }
    },
    {
      "id": 3069,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3069",
      "data_updated_at": "2017-10-18T23:12:10.078804Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:51:47.000000Z",
        "slug": "人数",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA%E6%95%B0",
        "characters": "人数",
        "meanings": [
          {
            "meaning": "The Number Of People",
            "primary": true
          },
          {
            "meaning": "Number Of People",
            "primary": false
          },
          {
            "meaning": "The Amount Of People",
            "primary": false
          },
          {
            "meaning": "Amount Of People",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にんずう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          703,
          444
        ]
      }
    },
    {
      "id": 3070,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3070",
      "data_updated_at": "2017-10-18T23:12:06.961714Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:51:54.000000Z",
        "slug": "点数",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%82%B9%E6%95%B0",
        "characters": "点数",
        "meanings": [
          {
            "meaning": "Points",
            "primary": true
          },
          {
            "meaning": "Score",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てんすう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          703,
          641
        ]
      }
    },
    {
      "id": 3071,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3071",
      "data_updated_at": "2017-10-18T23:12:08.055275Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:52:20.000000Z",
        "slug": "楽しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A5%BD%E3%81%97%E3%81%84",
        "characters": "楽しい",
        "meanings": [
          {
            "meaning": "Fun",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たのしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          704
        ]
      }
    },
    {
      "id": 3072,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3072",
      "data_updated_at": "2017-10-18T23:12:08.719629Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:52:41.000000Z",
        "slug": "音楽",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9F%B3%E6%A5%BD",
        "characters": "音楽",
        "meanings": [
          {
            "meaning": "Music",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おんがく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          704,
          606
        ]
      }
    },
    {
      "id": 3073,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3073",
      "data_updated_at": "2017-10-18T23:12:05.913920Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:52:50.000000Z",
        "slug": "楽",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A5%BD",
        "characters": "楽",
        "meanings": [
          {
            "meaning": "Comfort",
            "primary": true
          },
          {
            "meaning": "Ease",
            "primary": false
          },
          {
            "meaning": "Pleasure",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "らく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          704
        ]
      }
    },
    {
      "id": 3074,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3074",
      "data_updated_at": "2017-10-18T23:12:11.027189Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:52:59.000000Z",
        "slug": "話す",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A9%B1%E3%81%99",
        "characters": "話す",
        "meanings": [
          {
            "meaning": "To Speak",
            "primary": true
          },
          {
            "meaning": "To Talk",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はなす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          705
        ]
      }
    },
    {
      "id": 3075,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3075",
      "data_updated_at": "2017-10-18T23:12:09.868826Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:53:14.000000Z",
        "slug": "電話",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E8%A9%B1",
        "characters": "電話",
        "meanings": [
          {
            "meaning": "Telephone",
            "primary": true
          },
          {
            "meaning": "Phone",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんわ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          706,
          705
        ]
      }
    },
    {
      "id": 3076,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3076",
      "data_updated_at": "2017-10-18T23:12:12.024843Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:53:21.000000Z",
        "slug": "会話",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%9A%E8%A9%B1",
        "characters": "会話",
        "meanings": [
          {
            "meaning": "Conversation",
            "primary": true
          },
          {
            "meaning": "Dialogue",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいわ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          705,
          566
        ]
      }
    },
    {
      "id": 3077,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3077",
      "data_updated_at": "2017-10-18T23:12:13.800123Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:53:42.000000Z",
        "slug": "電車",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E8%BB%8A",
        "characters": "電車",
        "meanings": [
          {
            "meaning": "Train",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          706,
          562
        ]
      }
    },
    {
      "id": 3078,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3078",
      "data_updated_at": "2017-10-18T23:12:05.653372Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:53:49.000000Z",
        "slug": "電気",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E6%B0%97",
        "characters": "電気",
        "meanings": [
          {
            "meaning": "Electricity",
            "primary": true
          },
          {
            "meaning": "Light",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          706,
          548
        ]
      }
    },
    {
      "id": 3079,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3079",
      "data_updated_at": "2017-10-18T23:12:07.203170Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:53:57.000000Z",
        "slug": "電池",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E6%B1%A0",
        "characters": "電池",
        "meanings": [
          {
            "meaning": "Battery",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          706,
          573
        ]
      }
    },
    {
      "id": 3080,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3080",
      "data_updated_at": "2017-10-18T23:12:07.935133Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:54:15.000000Z",
        "slug": "電子",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E5%AD%90",
        "characters": "電子",
        "meanings": [
          {
            "meaning": "Electron",
            "primary": true
          },
          {
            "meaning": "Electronic",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          706,
          462
        ]
      }
    },
    {
      "id": 3081,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3081",
      "data_updated_at": "2017-10-18T23:12:07.868842Z",
      "data": {
        "level": 8,
        "created_at": "2012-04-05T23:54:21.000000Z",
        "slug": "電力",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E5%8A%9B",
        "characters": "電力",
        "meanings": [
          {
            "meaning": "Electric Power",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんりょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          706,
          447
        ]
      }
    },
    {
      "id": 3082,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3082",
      "data_updated_at": "2017-10-18T23:12:16.900659Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:49:07.000000Z",
        "slug": "事",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8B",
        "characters": "事",
        "meanings": [
          {
            "meaning": "Thing",
            "primary": true
          },
          {
            "meaning": "Matter",
            "primary": false
          },
          {
            "meaning": "Action",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          708
        ]
      }
    },
    {
      "id": 3083,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3083",
      "data_updated_at": "2017-10-18T23:12:14.309563Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:49:41.000000Z",
        "slug": "用事",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%A8%E4%BA%8B",
        "characters": "用事",
        "meanings": [
          {
            "meaning": "Errand",
            "primary": true
          },
          {
            "meaning": "Business",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          708,
          525
        ]
      }
    },
    {
      "id": 3084,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3084",
      "data_updated_at": "2017-10-18T23:12:17.063658Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:49:49.000000Z",
        "slug": "工事",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A5%E4%BA%8B",
        "characters": "工事",
        "meanings": [
          {
            "meaning": "Construction",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうじ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          708,
          457
        ]
      }
    },
    {
      "id": 3085,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3085",
      "data_updated_at": "2017-10-18T23:12:16.132548Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:49:56.000000Z",
        "slug": "大事",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E4%BA%8B",
        "characters": "大事",
        "meanings": [
          {
            "meaning": "Important",
            "primary": true
          },
          {
            "meaning": "Valuable",
            "primary": false
          },
          {
            "meaning": "Serious Matter",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいじ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          708,
          453
        ]
      }
    },
    {
      "id": 3086,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3086",
      "data_updated_at": "2017-10-18T23:12:17.121057Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:50:37.000000Z",
        "slug": "返事",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%94%E4%BA%8B",
        "characters": "返事",
        "meanings": [
          {
            "meaning": "Reply",
            "primary": true
          },
          {
            "meaning": "Response",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へんじ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          858,
          708
        ]
      }
    },
    {
      "id": 3087,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3087",
      "data_updated_at": "2017-10-18T23:12:14.797237Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:50:44.000000Z",
        "slug": "食事",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A3%9F%E4%BA%8B",
        "characters": "食事",
        "meanings": [
          {
            "meaning": "Meal",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょくじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          708,
          644
        ]
      }
    },
    {
      "id": 3088,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3088",
      "data_updated_at": "2017-10-18T23:12:18.439310Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:50:51.000000Z",
        "slug": "使う",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%BF%E3%81%86",
        "characters": "使う",
        "meanings": [
          {
            "meaning": "To Use",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つかう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          709
        ]
      }
    },
    {
      "id": 3089,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3089",
      "data_updated_at": "2017-10-18T23:12:17.303043Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:51:09.000000Z",
        "slug": "道具",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%93%E5%85%B7",
        "characters": "道具",
        "meanings": [
          {
            "meaning": "Tool",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どうぐ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          710,
          700
        ]
      }
    },
    {
      "id": 3090,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3090",
      "data_updated_at": "2017-10-18T23:12:15.884625Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:51:16.000000Z",
        "slug": "家具",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%B6%E5%85%B7",
        "characters": "家具",
        "meanings": [
          {
            "meaning": "Furniture",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かぐ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          710,
          660
        ]
      }
    },
    {
      "id": 3091,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3091",
      "data_updated_at": "2017-10-18T23:12:17.346968Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:51:23.000000Z",
        "slug": "受ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%97%E3%81%91%E3%82%8B",
        "characters": "受ける",
        "meanings": [
          {
            "meaning": "To Receive",
            "primary": true
          },
          {
            "meaning": "To Accept",
            "primary": false
          },
          {
            "meaning": "To Catch",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うける"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          711
        ]
      }
    },
    {
      "id": 3092,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3092",
      "data_updated_at": "2017-10-18T23:12:14.045812Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:51:37.000000Z",
        "slug": "和風",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%92%8C%E9%A2%A8",
        "characters": "和風",
        "meanings": [
          {
            "meaning": "Japanese Style",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わふう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          853,
          712
        ]
      }
    },
    {
      "id": 3093,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3093",
      "data_updated_at": "2017-10-18T23:12:19.170405Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:51:44.000000Z",
        "slug": "平和",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B3%E5%92%8C",
        "characters": "平和",
        "meanings": [
          {
            "meaning": "Peace",
            "primary": true
          },
          {
            "meaning": "Harmony",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へいわ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          712,
          535
        ]
      }
    },
    {
      "id": 3094,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3094",
      "data_updated_at": "2017-10-18T23:12:16.175786Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:51:51.000000Z",
        "slug": "和食",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%92%8C%E9%A3%9F",
        "characters": "和食",
        "meanings": [
          {
            "meaning": "Japanese Style Food",
            "primary": true
          },
          {
            "meaning": "Japanese Food",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わしょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          712,
          644
        ]
      }
    },
    {
      "id": 3095,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3095",
      "data_updated_at": "2017-10-18T23:12:16.751812Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:52:02.000000Z",
        "slug": "和室",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%92%8C%E5%AE%A4",
        "characters": "和室",
        "meanings": [
          {
            "meaning": "Japanese Style Room",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わしつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          712,
          635
        ]
      }
    },
    {
      "id": 3096,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3096",
      "data_updated_at": "2017-10-18T23:12:17.262626Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:52:11.000000Z",
        "slug": "和服",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%92%8C%E6%9C%8D",
        "characters": "和服",
        "meanings": [
          {
            "meaning": "Japanese Style Clothes",
            "primary": true
          },
          {
            "meaning": "Japanese Clothing",
            "primary": false
          },
          {
            "meaning": "Japanese Style Clothing",
            "primary": false
          },
          {
            "meaning": "Japanese Clothes",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わふく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          716,
          712
        ]
      }
    },
    {
      "id": 3097,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3097",
      "data_updated_at": "2017-10-18T23:12:17.570713Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:52:55.000000Z",
        "slug": "始める",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A7%8B%E3%82%81%E3%82%8B",
        "characters": "始める",
        "meanings": [
          {
            "meaning": "To Begin",
            "primary": true
          },
          {
            "meaning": "To Start",
            "primary": false
          },
          {
            "meaning": "To Begin Something",
            "primary": false
          },
          {
            "meaning": "To Start Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はじめる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          713
        ]
      }
    },
    {
      "id": 3098,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3098",
      "data_updated_at": "2017-10-18T23:12:17.456998Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:53:03.000000Z",
        "slug": "始まる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A7%8B%E3%81%BE%E3%82%8B",
        "characters": "始まる",
        "meanings": [
          {
            "meaning": "To Begin",
            "primary": true
          },
          {
            "meaning": "Something Begins",
            "primary": false
          },
          {
            "meaning": "To Start",
            "primary": false
          },
          {
            "meaning": "Something Starts",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はじまる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          713
        ]
      }
    },
    {
      "id": 3099,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3099",
      "data_updated_at": "2017-10-18T23:12:17.220823Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:53:10.000000Z",
        "slug": "始めに",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A7%8B%E3%82%81%E3%81%AB",
        "characters": "始めに",
        "meanings": [
          {
            "meaning": "In The Beginning",
            "primary": true
          },
          {
            "meaning": "To Begin With",
            "primary": false
          },
          {
            "meaning": "To Start With",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はじめに"
          }
        ],
        "parts_of_speech": [
          "expression"
        ],
        "component_subject_ids": [
          713
        ]
      }
    },
    {
      "id": 3100,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3100",
      "data_updated_at": "2017-10-18T23:12:13.841734Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:53:17.000000Z",
        "slug": "予定",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%88%E5%AE%9A",
        "characters": "予定",
        "meanings": [
          {
            "meaning": "A Plan",
            "primary": true
          },
          {
            "meaning": "Plan",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よてい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          854,
          714
        ]
      }
    },
    {
      "id": 3101,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3101",
      "data_updated_at": "2017-10-18T23:12:15.458884Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:53:24.000000Z",
        "slug": "決定",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B1%BA%E5%AE%9A",
        "characters": "決定",
        "meanings": [
          {
            "meaning": "Decision",
            "primary": true
          },
          {
            "meaning": "Determination",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けってい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          714,
          687
        ]
      }
    },
    {
      "id": 3102,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3102",
      "data_updated_at": "2017-10-18T23:12:18.529049Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:53:40.000000Z",
        "slug": "実",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%9F",
        "characters": "実",
        "meanings": [
          {
            "meaning": "Truth",
            "primary": true
          },
          {
            "meaning": "Reality",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          715
        ]
      }
    },
    {
      "id": 3103,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3103",
      "data_updated_at": "2017-10-18T23:12:18.483844Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:53:46.000000Z",
        "slug": "事実",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8B%E5%AE%9F",
        "characters": "事実",
        "meanings": [
          {
            "meaning": "Truth",
            "primary": true
          },
          {
            "meaning": "Fact",
            "primary": false
          },
          {
            "meaning": "Reality",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じじつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          715,
          708
        ]
      }
    },
    {
      "id": 3104,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3104",
      "data_updated_at": "2017-10-18T23:12:17.015023Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:54:04.000000Z",
        "slug": "実力",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%9F%E5%8A%9B",
        "characters": "実力",
        "meanings": [
          {
            "meaning": "True Strength",
            "primary": true
          },
          {
            "meaning": "True Ability",
            "primary": false
          },
          {
            "meaning": "True Power",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じつりょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          715,
          447
        ]
      }
    },
    {
      "id": 3105,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3105",
      "data_updated_at": "2017-10-18T23:12:14.224514Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:54:30.000000Z",
        "slug": "服",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%8D",
        "characters": "服",
        "meanings": [
          {
            "meaning": "Clothes",
            "primary": true
          },
          {
            "meaning": "Clothing",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          716
        ]
      }
    },
    {
      "id": 3106,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3106",
      "data_updated_at": "2017-10-18T23:12:13.944959Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:54:36.000000Z",
        "slug": "泳ぐ",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B3%B3%E3%81%90",
        "characters": "泳ぐ",
        "meanings": [
          {
            "meaning": "To Swim",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "およぐ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          717
        ]
      }
    },
    {
      "id": 3107,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3107",
      "data_updated_at": "2017-10-18T23:12:13.900886Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:55:10.000000Z",
        "slug": "物",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%89%A9",
        "characters": "物",
        "meanings": [
          {
            "meaning": "Thing",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もの"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          718
        ]
      }
    },
    {
      "id": 3108,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3108",
      "data_updated_at": "2017-10-18T23:12:16.815081Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:55:23.000000Z",
        "slug": "本物",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AC%E7%89%A9",
        "characters": "本物",
        "meanings": [
          {
            "meaning": "The Real Thing",
            "primary": true
          },
          {
            "meaning": "Real Deal",
            "primary": false
          },
          {
            "meaning": "The Real Deal",
            "primary": false
          },
          {
            "meaning": "Real Thing",
            "primary": false
          },
          {
            "meaning": "Genuine Article",
            "primary": false
          },
          {
            "meaning": "The Genuine Article",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほんもの"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          718,
          487
        ]
      }
    },
    {
      "id": 3109,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3109",
      "data_updated_at": "2017-11-30T23:03:44.610677Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:55:30.000000Z",
        "slug": "名物",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E7%89%A9",
        "characters": "名物",
        "meanings": [
          {
            "meaning": "Local Specialty",
            "primary": true
          },
          {
            "meaning": "Famous Product",
            "primary": false
          },
          {
            "meaning": "Specialty",
            "primary": false
          },
          {
            "meaning": "Famous Goods",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "めいぶつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          718,
          544
        ]
      }
    },
    {
      "id": 3110,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3110",
      "data_updated_at": "2017-10-18T23:12:15.284531Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:55:44.000000Z",
        "slug": "苦い",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8B%A6%E3%81%84",
        "characters": "苦い",
        "meanings": [
          {
            "meaning": "Bitter Tasting",
            "primary": true
          },
          {
            "meaning": "Bitter",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にがい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          719
        ]
      }
    },
    {
      "id": 3111,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3111",
      "data_updated_at": "2017-10-18T23:12:16.346261Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:55:50.000000Z",
        "slug": "苦しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8B%A6%E3%81%97%E3%81%84",
        "characters": "苦しい",
        "meanings": [
          {
            "meaning": "Painful",
            "primary": true
          },
          {
            "meaning": "Agonizing",
            "primary": false
          },
          {
            "meaning": "Agonising",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くるしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          719
        ]
      }
    },
    {
      "id": 3112,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3112",
      "data_updated_at": "2017-11-01T23:18:42.204349Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:57:01.000000Z",
        "slug": "乗る",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%97%E3%82%8B",
        "characters": "乗る",
        "meanings": [
          {
            "meaning": "To Ride",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          722
        ]
      }
    },
    {
      "id": 3113,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3113",
      "data_updated_at": "2017-10-18T23:12:18.178901Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:57:08.000000Z",
        "slug": "乗せる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%97%E3%81%9B%E3%82%8B",
        "characters": "乗せる",
        "meanings": [
          {
            "meaning": "To Give A Ride",
            "primary": true
          },
          {
            "meaning": "To Give Someone A Ride",
            "primary": false
          },
          {
            "meaning": "To Place On",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のせる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          722
        ]
      }
    },
    {
      "id": 3114,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3114",
      "data_updated_at": "2017-10-18T23:12:18.579767Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:57:17.000000Z",
        "slug": "乗り物",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B9%97%E3%82%8A%E7%89%A9",
        "characters": "乗り物",
        "meanings": [
          {
            "meaning": "Vehicle",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のりもの"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          722,
          718
        ]
      }
    },
    {
      "id": 3115,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3115",
      "data_updated_at": "2017-10-18T23:12:14.266178Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:58:12.000000Z",
        "slug": "お客さん",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E5%AE%A2%E3%81%95%E3%82%93",
        "characters": "お客さん",
        "meanings": [
          {
            "meaning": "Guest",
            "primary": true
          },
          {
            "meaning": "Visitor",
            "primary": false
          },
          {
            "meaning": "Customer",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おきゃくさん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          723
        ]
      }
    },
    {
      "id": 3116,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3116",
      "data_updated_at": "2017-10-18T23:12:15.937726Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:58:22.000000Z",
        "slug": "客室",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%A2%E5%AE%A4",
        "characters": "客室",
        "meanings": [
          {
            "meaning": "Guest Room",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きゃくしつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          723,
          635
        ]
      }
    },
    {
      "id": 3117,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3117",
      "data_updated_at": "2017-10-18T23:12:16.538863Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:58:29.000000Z",
        "slug": "〜屋",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E5%B1%8B",
        "characters": "〜屋",
        "meanings": [
          {
            "meaning": "Store",
            "primary": true
          },
          {
            "meaning": "Shop",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "や"
          }
        ],
        "parts_of_speech": [
          "suffix"
        ],
        "component_subject_ids": [
          724
        ]
      }
    },
    {
      "id": 3118,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3118",
      "data_updated_at": "2017-10-18T23:12:17.423247Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:58:35.000000Z",
        "slug": "部屋",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%83%A8%E5%B1%8B",
        "characters": "部屋",
        "meanings": [
          {
            "meaning": "Room",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "へや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          724,
          721
        ]
      }
    },
    {
      "id": 3119,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3119",
      "data_updated_at": "2017-10-18T23:12:15.379063Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:58:43.000000Z",
        "slug": "肉屋",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%82%89%E5%B1%8B",
        "characters": "肉屋",
        "meanings": [
          {
            "meaning": "Butcher Shop",
            "primary": true
          },
          {
            "meaning": "Meat Shop",
            "primary": false
          },
          {
            "meaning": "Meat Store",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にくや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          724,
          577
        ]
      }
    },
    {
      "id": 3120,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3120",
      "data_updated_at": "2017-10-18T23:12:16.663376Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:58:54.000000Z",
        "slug": "茶屋",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8C%B6%E5%B1%8B",
        "characters": "茶屋",
        "meanings": [
          {
            "meaning": "Tea Shop",
            "primary": true
          },
          {
            "meaning": "Tea Store",
            "primary": false
          },
          {
            "meaning": "Tea House",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゃや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          724,
          643
        ]
      }
    },
    {
      "id": 3121,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3121",
      "data_updated_at": "2017-10-18T23:12:15.757748Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:03.000000Z",
        "slug": "魚屋",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%AD%9A%E5%B1%8B",
        "characters": "魚屋",
        "meanings": [
          {
            "meaning": "Fish Shop",
            "primary": true
          },
          {
            "meaning": "Fish Market",
            "primary": false
          },
          {
            "meaning": "Fish Dealer",
            "primary": false
          },
          {
            "meaning": "Fish Store",
            "primary": false
          },
          {
            "meaning": "Fishmonger",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さかなや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          724,
          674
        ]
      }
    },
    {
      "id": 3122,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3122",
      "data_updated_at": "2017-10-18T23:12:19.130335Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:10.000000Z",
        "slug": "名古屋",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E5%8F%A4%E5%B1%8B",
        "characters": "名古屋",
        "meanings": [
          {
            "meaning": "Nagoya",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なごや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          724,
          544,
          519
        ]
      }
    },
    {
      "id": 3123,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3123",
      "data_updated_at": "2017-10-18T23:12:16.965235Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:16.000000Z",
        "slug": "今度",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E5%BA%A6",
        "characters": "今度",
        "meanings": [
          {
            "meaning": "This Time",
            "primary": true
          },
          {
            "meaning": "Next Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんど"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          725,
          497
        ]
      }
    },
    {
      "id": 3124,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3124",
      "data_updated_at": "2017-10-18T23:12:18.955542Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:22.000000Z",
        "slug": "丁度",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%81%E5%BA%A6",
        "characters": "丁度",
        "meanings": [
          {
            "meaning": "Exactly",
            "primary": true
          },
          {
            "meaning": "Just",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちょうど"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          725,
          464
        ]
      }
    },
    {
      "id": 3125,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3125",
      "data_updated_at": "2017-10-18T23:12:14.511537Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:32.000000Z",
        "slug": "毎度",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%8E%E5%BA%A6",
        "characters": "毎度",
        "meanings": [
          {
            "meaning": "Each Time",
            "primary": true
          },
          {
            "meaning": "Frequently",
            "primary": false
          },
          {
            "meaning": "Every Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まいど"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          725,
          572
        ]
      }
    },
    {
      "id": 3126,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3126",
      "data_updated_at": "2017-10-18T23:12:17.527549Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:40.000000Z",
        "slug": "角度",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A7%92%E5%BA%A6",
        "characters": "角度",
        "meanings": [
          {
            "meaning": "Angle",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かくど"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          725,
          592
        ]
      }
    },
    {
      "id": 3127,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3127",
      "data_updated_at": "2017-10-18T23:12:15.498210Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:47.000000Z",
        "slug": "〜度",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E5%BA%A6",
        "characters": "〜度",
        "meanings": [
          {
            "meaning": "Degrees",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ど"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          725
        ]
      }
    },
    {
      "id": 3128,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3128",
      "data_updated_at": "2017-10-18T23:12:14.088581Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-23T23:59:56.000000Z",
        "slug": "待つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BE%85%E3%81%A4",
        "characters": "待つ",
        "meanings": [
          {
            "meaning": "To Wait",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まつ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          726
        ]
      }
    },
    {
      "id": 3129,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3129",
      "data_updated_at": "2017-10-18T23:12:14.459164Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:00:03.000000Z",
        "slug": "待たせる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BE%85%E3%81%9F%E3%81%9B%E3%82%8B",
        "characters": "待たせる",
        "meanings": [
          {
            "meaning": "To Make Someone Wait",
            "primary": true
          },
          {
            "meaning": "To Keep Someone Waiting",
            "primary": false
          },
          {
            "meaning": "To Make Wait",
            "primary": false
          },
          {
            "meaning": "To Keep Waiting",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "またせる"
          }
        ],
        "parts_of_speech": [
          "ichidan_verb"
        ],
        "component_subject_ids": [
          726
        ]
      }
    },
    {
      "id": 3130,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3130",
      "data_updated_at": "2017-10-18T23:12:16.855996Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:11.000000Z",
        "slug": "持つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%8C%81%E3%81%A4",
        "characters": "持つ",
        "meanings": [
          {
            "meaning": "To Hold",
            "primary": true
          },
          {
            "meaning": "To Carry",
            "primary": false
          },
          {
            "meaning": "To Own",
            "primary": false
          },
          {
            "meaning": "To Keep",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もつ"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          727
        ]
      }
    },
    {
      "id": 3131,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3131",
      "data_updated_at": "2017-10-18T23:12:19.253431Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:18.000000Z",
        "slug": "金持ち",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%91%E6%8C%81%E3%81%A1",
        "characters": "金持ち",
        "meanings": [
          {
            "meaning": "Rich Person",
            "primary": true
          },
          {
            "meaning": "Rich",
            "primary": false
          },
          {
            "meaning": "Wealthy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かねもち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          727,
          602
        ]
      }
    },
    {
      "id": 3132,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3132",
      "data_updated_at": "2017-10-18T23:12:17.742936Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:24.000000Z",
        "slug": "気持ち",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%97%E6%8C%81%E3%81%A1",
        "characters": "気持ち",
        "meanings": [
          {
            "meaning": "Feeling",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きもち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          727,
          548
        ]
      }
    },
    {
      "id": 3133,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3133",
      "data_updated_at": "2017-10-18T23:12:17.815795Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:31.000000Z",
        "slug": "世界",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%96%E7%95%8C",
        "characters": "世界",
        "meanings": [
          {
            "meaning": "The World",
            "primary": true
          },
          {
            "meaning": "Society",
            "primary": false
          },
          {
            "meaning": "The Universe",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          728,
          527
        ]
      }
    },
    {
      "id": 3134,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3134",
      "data_updated_at": "2018-03-05T22:39:38.142416Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:37.000000Z",
        "slug": "発売",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BA%E5%A3%B2",
        "characters": "発売",
        "meanings": [
          {
            "meaning": "For Sale",
            "primary": true
          },
          {
            "meaning": "Selling",
            "primary": false
          },
          {
            "meaning": "Item For Sale",
            "primary": false
          },
          {
            "meaning": "Sale",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はつばい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          729,
          587
        ]
      }
    },
    {
      "id": 3135,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3135",
      "data_updated_at": "2017-10-18T23:12:18.636721Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:43.000000Z",
        "slug": "発音",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BA%E9%9F%B3",
        "characters": "発音",
        "meanings": [
          {
            "meaning": "Pronunciation",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はつおん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          729,
          606
        ]
      }
    },
    {
      "id": 3136,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3136",
      "data_updated_at": "2017-11-01T23:35:02.927330Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:49.000000Z",
        "slug": "発見",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BA%E8%A6%8B",
        "characters": "発見",
        "meanings": [
          {
            "meaning": "Discovery",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はっけん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          729,
          558
        ]
      }
    },
    {
      "id": 3137,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3137",
      "data_updated_at": "2017-10-18T23:12:14.661739Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:01:55.000000Z",
        "slug": "相談",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%B8%E8%AB%87",
        "characters": "相談",
        "meanings": [
          {
            "meaning": "Consultation",
            "primary": true
          },
          {
            "meaning": "Discussion",
            "primary": false
          },
          {
            "meaning": "Advice",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そうだん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          736,
          730
        ]
      }
    },
    {
      "id": 3138,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3138",
      "data_updated_at": "2018-03-05T20:24:46.530550Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:02:01.000000Z",
        "slug": "相手",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9B%B8%E6%89%8B",
        "characters": "相手",
        "meanings": [
          {
            "meaning": "Partner",
            "primary": true
          },
          {
            "meaning": "Companion",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あいて"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          730,
          474
        ]
      }
    },
    {
      "id": 3139,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3139",
      "data_updated_at": "2017-10-18T23:12:14.413443Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:02:08.000000Z",
        "slug": "〜県",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E7%9C%8C",
        "characters": "〜県",
        "meanings": [
          {
            "meaning": "Prefecture",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          731
        ]
      }
    },
    {
      "id": 3140,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3140",
      "data_updated_at": "2017-10-18T23:12:17.999670Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:02:15.000000Z",
        "slug": "美しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%BE%8E%E3%81%97%E3%81%84",
        "characters": "美しい",
        "meanings": [
          {
            "meaning": "Beautiful",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うつくしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          732
        ]
      }
    },
    {
      "id": 3141,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3141",
      "data_updated_at": "2017-10-18T23:12:14.177801Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:02:22.000000Z",
        "slug": "美人",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%BE%8E%E4%BA%BA",
        "characters": "美人",
        "meanings": [
          {
            "meaning": "Beautiful Woman",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          732,
          444
        ]
      }
    },
    {
      "id": 3142,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3142",
      "data_updated_at": "2017-10-18T23:12:17.961118Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:02:46.000000Z",
        "slug": "負ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B2%A0%E3%81%91%E3%82%8B",
        "characters": "負ける",
        "meanings": [
          {
            "meaning": "To Lose",
            "primary": true
          },
          {
            "meaning": "To Be Defeated",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まける"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          733
        ]
      }
    },
    {
      "id": 3143,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3143",
      "data_updated_at": "2017-10-18T23:12:14.563378Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:02:59.000000Z",
        "slug": "勝負",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8B%9D%E8%B2%A0",
        "characters": "勝負",
        "meanings": [
          {
            "meaning": "Match",
            "primary": true
          },
          {
            "meaning": "Showdown",
            "primary": false
          },
          {
            "meaning": "Contest",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうぶ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          738,
          733
        ]
      }
    },
    {
      "id": 3144,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3144",
      "data_updated_at": "2017-10-18T23:12:17.382456Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:03:07.000000Z",
        "slug": "勝つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8B%9D%E3%81%A4",
        "characters": "勝つ",
        "meanings": [
          {
            "meaning": "To Win",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かつ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          738
        ]
      }
    },
    {
      "id": 3145,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3145",
      "data_updated_at": "2017-10-18T23:12:13.999760Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:03:48.000000Z",
        "slug": "勝者",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8B%9D%E8%80%85",
        "characters": "勝者",
        "meanings": [
          {
            "meaning": "Winner",
            "primary": true
          },
          {
            "meaning": "Victor",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          738,
          690
        ]
      }
    },
    {
      "id": 3146,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3146",
      "data_updated_at": "2017-10-18T23:12:16.579738Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:04:00.000000Z",
        "slug": "必勝",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%85%E5%8B%9D",
        "characters": "必勝",
        "meanings": [
          {
            "meaning": "Sure Victory",
            "primary": true
          },
          {
            "meaning": "Certain Victory",
            "primary": false
          },
          {
            "meaning": "Sure Win",
            "primary": false
          },
          {
            "meaning": "Sure Victory",
            "primary": false
          },
          {
            "meaning": "Certain Win",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひっしょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          738,
          655
        ]
      }
    },
    {
      "id": 3147,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3147",
      "data_updated_at": "2017-10-18T23:12:15.677667Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:04:16.000000Z",
        "slug": "楽勝",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A5%BD%E5%8B%9D",
        "characters": "楽勝",
        "meanings": [
          {
            "meaning": "Easy Victory",
            "primary": true
          },
          {
            "meaning": "Easy Win",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "らくしょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          738,
          704
        ]
      }
    },
    {
      "id": 3148,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3148",
      "data_updated_at": "2017-10-18T23:12:19.084465Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:04:23.000000Z",
        "slug": "送る",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%81%E3%82%8B",
        "characters": "送る",
        "meanings": [
          {
            "meaning": "To Send",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おくる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          734
        ]
      }
    },
    {
      "id": 3149,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3149",
      "data_updated_at": "2017-09-22T00:29:41.651479Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-24T00:04:30.000000Z",
        "slug": "放送する",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%94%BE%E9%80%81%E3%81%99%E3%82%8B",
        "characters": "放送する",
        "meanings": [
          {
            "meaning": "To Broadcast",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほうそうする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          791,
          734
        ]
      }
    },
    {
      "id": 3150,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3150",
      "data_updated_at": "2017-10-18T23:12:18.040289Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:05:05.000000Z",
        "slug": "重い",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%8D%E3%81%84",
        "characters": "重い",
        "meanings": [
          {
            "meaning": "Heavy",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おもい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          735
        ]
      }
    },
    {
      "id": 3151,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3151",
      "data_updated_at": "2017-10-18T23:12:15.718582Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:05:14.000000Z",
        "slug": "重要",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%8D%E8%A6%81",
        "characters": "重要",
        "meanings": [
          {
            "meaning": "Essential",
            "primary": true
          },
          {
            "meaning": "Important",
            "primary": false
          },
          {
            "meaning": "Necessary",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じゅうよう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          737,
          735
        ]
      }
    },
    {
      "id": 3152,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3152",
      "data_updated_at": "2017-10-18T23:12:15.338278Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:05:22.000000Z",
        "slug": "体重",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%93%E9%87%8D",
        "characters": "体重",
        "meanings": [
          {
            "meaning": "Body Weight",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいじゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          735,
          583
        ]
      }
    },
    {
      "id": 3153,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3153",
      "data_updated_at": "2017-10-18T23:12:15.635215Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:05:29.000000Z",
        "slug": "二重",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E9%87%8D",
        "characters": "二重",
        "meanings": [
          {
            "meaning": "Double",
            "primary": true
          },
          {
            "meaning": "Dual",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にじゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          735,
          441
        ]
      }
    },
    {
      "id": 3154,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3154",
      "data_updated_at": "2017-10-18T23:12:16.264595Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:05:36.000000Z",
        "slug": "必要",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BF%85%E8%A6%81",
        "characters": "必要",
        "meanings": [
          {
            "meaning": "Necessary",
            "primary": true
          },
          {
            "meaning": "Needed",
            "primary": false
          },
          {
            "meaning": "Essential",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひつよう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          737,
          655
        ]
      }
    },
    {
      "id": 3155,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3155",
      "data_updated_at": "2017-10-18T23:12:17.911240Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:06:06.000000Z",
        "slug": "要点",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%81%E7%82%B9",
        "characters": "要点",
        "meanings": [
          {
            "meaning": "Main Point",
            "primary": true
          },
          {
            "meaning": "Gist",
            "primary": false
          },
          {
            "meaning": "Main Idea",
            "primary": false
          },
          {
            "meaning": "Essence",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようてん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          737,
          641
        ]
      }
    },
    {
      "id": 3156,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3156",
      "data_updated_at": "2017-10-18T23:12:14.608060Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:07:46.000000Z",
        "slug": "仮に",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%AE%E3%81%AB",
        "characters": "仮に",
        "meanings": [
          {
            "meaning": "Temporarily",
            "primary": true
          },
          {
            "meaning": "Supposing",
            "primary": false
          },
          {
            "meaning": "For Argument's Sake",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かりに"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          739
        ]
      }
    },
    {
      "id": 3157,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3157",
      "data_updated_at": "2017-10-18T23:12:16.220579Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:08:15.000000Z",
        "slug": "仮名",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%AE%E5%90%8D",
        "characters": "仮名",
        "meanings": [
          {
            "meaning": "Kana",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かな"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          739,
          544
        ]
      }
    },
    {
      "id": 3158,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3158",
      "data_updated_at": "2017-10-18T23:12:15.156218Z",
      "data": {
        "level": 9,
        "created_at": "2012-04-24T00:08:23.000000Z",
        "slug": "仮定",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%AE%E5%AE%9A",
        "characters": "仮定",
        "meanings": [
          {
            "meaning": "Assumption",
            "primary": true
          },
          {
            "meaning": "Hypothesis",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かてい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          739,
          714
        ]
      }
    },
    {
      "id": 3159,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3159",
      "data_updated_at": "2017-10-18T23:12:19.428425Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:51:39.000000Z",
        "slug": "起きる",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B5%B7%E3%81%8D%E3%82%8B",
        "characters": "起きる",
        "meanings": [
          {
            "meaning": "To Wake Up",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おきる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          740
        ]
      }
    },
    {
      "id": 3160,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3160",
      "data_updated_at": "2017-10-18T23:12:21.172843Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:51:47.000000Z",
        "slug": "早速",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A9%E9%80%9F",
        "characters": "早速",
        "meanings": [
          {
            "meaning": "At Once",
            "primary": true
          },
          {
            "meaning": "Immediately",
            "primary": false
          },
          {
            "meaning": "Without Delay",
            "primary": false
          },
          {
            "meaning": "Right Away",
            "primary": false
          },
          {
            "meaning": "Right Now",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さっそく"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          741,
          547
        ]
      }
    },
    {
      "id": 3161,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3161",
      "data_updated_at": "2017-10-18T23:12:19.386062Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:51:53.000000Z",
        "slug": "速度",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%9F%E5%BA%A6",
        "characters": "速度",
        "meanings": [
          {
            "meaning": "Speed",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そくど"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          741,
          725
        ]
      }
    },
    {
      "id": 3162,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3162",
      "data_updated_at": "2017-10-18T23:12:20.241271Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:52:00.000000Z",
        "slug": "配る",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%85%8D%E3%82%8B",
        "characters": "配る",
        "meanings": [
          {
            "meaning": "To Distribute",
            "primary": true
          },
          {
            "meaning": "To Pass Out",
            "primary": false
          },
          {
            "meaning": "To Deliver",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くばる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          742
        ]
      }
    },
    {
      "id": 3163,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3163",
      "data_updated_at": "2017-10-18T23:12:22.994446Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:52:28.000000Z",
        "slug": "お酒",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E9%85%92",
        "characters": "お酒",
        "meanings": [
          {
            "meaning": "Sake",
            "primary": true
          },
          {
            "meaning": "Alcohol",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おさけ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          743
        ]
      }
    },
    {
      "id": 3164,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3164",
      "data_updated_at": "2017-10-18T23:12:22.213286Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:52:35.000000Z",
        "slug": "日本酒",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A5%E6%9C%AC%E9%85%92",
        "characters": "日本酒",
        "meanings": [
          {
            "meaning": "Japanese Style Alcohol",
            "primary": true
          },
          {
            "meaning": "Japanese Alcohol",
            "primary": false
          },
          {
            "meaning": "Sake",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にほんしゅ"
          },
          {
            "primary": false,
            "reading": "にっぽんしゅ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          743,
          487,
          476
        ]
      }
    },
    {
      "id": 3165,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3165",
      "data_updated_at": "2017-10-18T23:12:21.270372Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:53:12.000000Z",
        "slug": "病院",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%97%85%E9%99%A2",
        "characters": "病院",
        "meanings": [
          {
            "meaning": "Hospital",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びょういん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          773,
          744
        ]
      }
    },
    {
      "id": 3166,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3166",
      "data_updated_at": "2017-10-18T23:12:24.360600Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:53:20.000000Z",
        "slug": "学院",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E9%99%A2",
        "characters": "学院",
        "meanings": [
          {
            "meaning": "Academy",
            "primary": true
          },
          {
            "meaning": "Institute",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がくいん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          744,
          599
        ]
      }
    },
    {
      "id": 3167,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3167",
      "data_updated_at": "2017-10-18T23:12:20.440364Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:53:29.000000Z",
        "slug": "終わる",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B5%82%E3%82%8F%E3%82%8B",
        "characters": "終わる",
        "meanings": [
          {
            "meaning": "To End",
            "primary": true
          },
          {
            "meaning": "To Finish",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おわる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          745
        ]
      }
    },
    {
      "id": 3168,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3168",
      "data_updated_at": "2017-10-18T23:12:20.480401Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:53:50.000000Z",
        "slug": "終点",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B5%82%E7%82%B9",
        "characters": "終点",
        "meanings": [
          {
            "meaning": "Last Stop",
            "primary": true
          },
          {
            "meaning": "Final Stop",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅうてん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          745,
          641
        ]
      }
    },
    {
      "id": 3169,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3169",
      "data_updated_at": "2017-10-18T23:12:20.850331Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:53:57.000000Z",
        "slug": "終了",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B5%82%E4%BA%86",
        "characters": "終了",
        "meanings": [
          {
            "meaning": "End",
            "primary": true
          },
          {
            "meaning": "Finish",
            "primary": false
          },
          {
            "meaning": "Close",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅうりょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          745,
          465
        ]
      }
    },
    {
      "id": 3170,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3170",
      "data_updated_at": "2017-10-18T23:12:20.079948Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:54:03.000000Z",
        "slug": "最終",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E7%B5%82",
        "characters": "最終",
        "meanings": [
          {
            "meaning": "Last",
            "primary": true
          },
          {
            "meaning": "Final",
            "primary": false
          },
          {
            "meaning": "The Last",
            "primary": false
          },
          {
            "meaning": "The Final",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいしゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          774,
          745
        ]
      }
    },
    {
      "id": 3171,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3171",
      "data_updated_at": "2017-10-18T23:12:24.107856Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:54:10.000000Z",
        "slug": "習う",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%BF%92%E3%81%86",
        "characters": "習う",
        "meanings": [
          {
            "meaning": "To Learn",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ならう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          746
        ]
      }
    },
    {
      "id": 3172,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3172",
      "data_updated_at": "2017-10-18T23:12:19.924058Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:54:33.000000Z",
        "slug": "転がる",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BB%A2%E3%81%8C%E3%82%8B",
        "characters": "転がる",
        "meanings": [
          {
            "meaning": "To Roll",
            "primary": true
          },
          {
            "meaning": "To Tumble",
            "primary": false
          },
          {
            "meaning": "To Lie Down",
            "primary": false
          },
          {
            "meaning": "To Be Scattered About",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ころがる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          747
        ]
      }
    },
    {
      "id": 3173,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3173",
      "data_updated_at": "2017-10-18T23:12:21.111240Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:54:42.000000Z",
        "slug": "自転車",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%87%AA%E8%BB%A2%E8%BB%8A",
        "characters": "自転車",
        "meanings": [
          {
            "meaning": "Bicycle",
            "primary": true
          },
          {
            "meaning": "Bike",
            "primary": false
          },
          {
            "meaning": "Pushbike",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じてんしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          747,
          578,
          562
        ]
      }
    },
    {
      "id": 3174,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3174",
      "data_updated_at": "2017-10-18T23:12:23.956277Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:54:51.000000Z",
        "slug": "運転する",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%8B%E8%BB%A2%E3%81%99%E3%82%8B",
        "characters": "運転する",
        "meanings": [
          {
            "meaning": "To Drive",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うんてんする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          752,
          747
        ]
      }
    },
    {
      "id": 3175,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3175",
      "data_updated_at": "2017-10-18T23:12:21.056986Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:55:00.000000Z",
        "slug": "転送",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BB%A2%E9%80%81",
        "characters": "転送",
        "meanings": [
          {
            "meaning": "Transfer",
            "primary": true
          },
          {
            "meaning": "Forwarding",
            "primary": false
          },
          {
            "meaning": "Transmission",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てんそう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          747,
          734
        ]
      }
    },
    {
      "id": 3176,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3176",
      "data_updated_at": "2017-10-18T23:12:22.840457Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:55:07.000000Z",
        "slug": "回転",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9E%E8%BB%A2",
        "characters": "回転",
        "meanings": [
          {
            "meaning": "Rotation",
            "primary": true
          },
          {
            "meaning": "Revolution",
            "primary": false
          },
          {
            "meaning": "Revolve",
            "primary": false
          },
          {
            "meaning": "Rotate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいてん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          747,
          569
        ]
      }
    },
    {
      "id": 3177,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3177",
      "data_updated_at": "2017-10-18T23:12:23.835052Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:55:20.000000Z",
        "slug": "進む",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%B2%E3%82%80",
        "characters": "進む",
        "meanings": [
          {
            "meaning": "To Advance",
            "primary": true
          },
          {
            "meaning": "To Go Forward",
            "primary": false
          },
          {
            "meaning": "To Progress",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すすむ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          748
        ]
      }
    },
    {
      "id": 3178,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3178",
      "data_updated_at": "2017-10-18T23:12:21.903816Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:55:33.000000Z",
        "slug": "進化",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%B2%E5%8C%96",
        "characters": "進化",
        "meanings": [
          {
            "meaning": "Evolution",
            "primary": true
          },
          {
            "meaning": "Progress",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんか"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          748,
          607
        ]
      }
    },
    {
      "id": 3179,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3179",
      "data_updated_at": "2017-10-18T23:12:20.119974Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:55:40.000000Z",
        "slug": "進行",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%80%B2%E8%A1%8C",
        "characters": "進行",
        "meanings": [
          {
            "meaning": "Advance",
            "primary": true
          },
          {
            "meaning": "Progress",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんこう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          748,
          580
        ]
      }
    },
    {
      "id": 3180,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3180",
      "data_updated_at": "2017-10-18T23:12:24.052327Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:55:48.000000Z",
        "slug": "落ちる",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%90%BD%E3%81%A1%E3%82%8B",
        "characters": "落ちる",
        "meanings": [
          {
            "meaning": "To Fall Down",
            "primary": true
          },
          {
            "meaning": "To Drop",
            "primary": false
          },
          {
            "meaning": "To Fall",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おちる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          749
        ]
      }
    },
    {
      "id": 3181,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3181",
      "data_updated_at": "2017-10-18T23:12:20.954358Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:57:02.000000Z",
        "slug": "青葉",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9D%92%E8%91%89",
        "characters": "青葉",
        "meanings": [
          {
            "meaning": "Fresh Leaves",
            "primary": true
          },
          {
            "meaning": "Greenery",
            "primary": false
          },
          {
            "meaning": "Young Leaves",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あおば"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          750,
          604
        ]
      }
    },
    {
      "id": 3182,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3182",
      "data_updated_at": "2017-10-18T23:12:21.213016Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:57:09.000000Z",
        "slug": "軽い",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BB%BD%E3%81%84",
        "characters": "軽い",
        "meanings": [
          {
            "meaning": "Lightweight",
            "primary": true
          },
          {
            "meaning": "Light",
            "primary": false
          },
          {
            "meaning": "Light Weight",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かるい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          751
        ]
      }
    },
    {
      "id": 3183,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3183",
      "data_updated_at": "2017-10-18T23:12:20.279069Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:57:36.000000Z",
        "slug": "運ぶ",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%8B%E3%81%B6",
        "characters": "運ぶ",
        "meanings": [
          {
            "meaning": "To Carry",
            "primary": true
          },
          {
            "meaning": "To Transport",
            "primary": false
          },
          {
            "meaning": "To Move",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はこぶ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          752
        ]
      }
    },
    {
      "id": 3184,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3184",
      "data_updated_at": "2017-10-18T23:12:19.656016Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:58:10.000000Z",
        "slug": "運がいい",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%8B%E3%81%8C%E3%81%84%E3%81%84",
        "characters": "運がいい",
        "meanings": [
          {
            "meaning": "Lucky",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うんがいい"
          }
        ],
        "parts_of_speech": [
          "expression",
          "i_adjective"
        ],
        "component_subject_ids": [
          752
        ]
      }
    },
    {
      "id": 3185,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3185",
      "data_updated_at": "2017-10-18T23:12:21.314434Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:58:23.000000Z",
        "slug": "開ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%96%8B%E3%81%91%E3%82%8B",
        "characters": "開ける",
        "meanings": [
          {
            "meaning": "To Open",
            "primary": true
          },
          {
            "meaning": "To Open Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あける"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          753
        ]
      }
    },
    {
      "id": 3186,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3186",
      "data_updated_at": "2017-10-18T23:12:19.845393Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:58:30.000000Z",
        "slug": "公開",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AC%E9%96%8B",
        "characters": "公開",
        "meanings": [
          {
            "meaning": "Open To The Public",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうかい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          753,
          499
        ]
      }
    },
    {
      "id": 3187,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3187",
      "data_updated_at": "2017-10-18T23:12:22.581507Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:58:37.000000Z",
        "slug": "開業",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%96%8B%E6%A5%AD",
        "characters": "開業",
        "meanings": [
          {
            "meaning": "Opening A Business",
            "primary": true
          },
          {
            "meaning": "Opening Of Business",
            "primary": false
          },
          {
            "meaning": "Starting A Business",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいぎょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          756,
          753
        ]
      }
    },
    {
      "id": 3188,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3188",
      "data_updated_at": "2017-10-18T23:12:21.770103Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:58:44.000000Z",
        "slug": "開発",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%96%8B%E7%99%BA",
        "characters": "開発",
        "meanings": [
          {
            "meaning": "Development",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいはつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          753,
          729
        ]
      }
    },
    {
      "id": 3189,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3189",
      "data_updated_at": "2017-10-18T23:12:23.912729Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:58:57.000000Z",
        "slug": "集める",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%86%E3%82%81%E3%82%8B",
        "characters": "集める",
        "meanings": [
          {
            "meaning": "To Collect",
            "primary": true
          },
          {
            "meaning": "To Gather",
            "primary": false
          },
          {
            "meaning": "To Assemble",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あつめる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          754
        ]
      }
    },
    {
      "id": 3190,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3190",
      "data_updated_at": "2017-10-18T23:12:21.688618Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:59:04.000000Z",
        "slug": "集中",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%86%E4%B8%AD",
        "characters": "集中",
        "meanings": [
          {
            "meaning": "Concentration",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅうちゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          754,
          469
        ]
      }
    },
    {
      "id": 3191,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3191",
      "data_updated_at": "2017-10-18T23:12:21.646044Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:59:17.000000Z",
        "slug": "集金",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%86%E9%87%91",
        "characters": "集金",
        "meanings": [
          {
            "meaning": "Collecting Money",
            "primary": true
          },
          {
            "meaning": "Money Collection",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅうきん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          754,
          602
        ]
      }
    },
    {
      "id": 3192,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3192",
      "data_updated_at": "2017-10-18T23:12:19.569609Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:59:25.000000Z",
        "slug": "飲む",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A3%B2%E3%82%80",
        "characters": "飲む",
        "meanings": [
          {
            "meaning": "To Drink",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のむ"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          755
        ]
      }
    },
    {
      "id": 3193,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3193",
      "data_updated_at": "2017-10-18T23:12:22.173956Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T18:59:56.000000Z",
        "slug": "工業",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B7%A5%E6%A5%AD",
        "characters": "工業",
        "meanings": [
          {
            "meaning": "Industry",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうぎょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          756,
          457
        ]
      }
    },
    {
      "id": 3194,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3194",
      "data_updated_at": "2017-10-18T23:12:21.440473Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:00:42.000000Z",
        "slug": "漢字",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%BC%A2%E5%AD%97",
        "characters": "漢字",
        "meanings": [
          {
            "meaning": "Kanji",
            "primary": true
          },
          {
            "meaning": "Chinese Letters",
            "primary": false
          },
          {
            "meaning": "Chinese Characters",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かんじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          757,
          545
        ]
      }
    },
    {
      "id": 3195,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3195",
      "data_updated_at": "2017-10-18T23:12:19.803250Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:00:50.000000Z",
        "slug": "道路",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%93%E8%B7%AF",
        "characters": "道路",
        "meanings": [
          {
            "meaning": "Paved Road",
            "primary": true
          },
          {
            "meaning": "Road",
            "primary": false
          },
          {
            "meaning": "Sealed Road",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どうろ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          758,
          700
        ]
      }
    },
    {
      "id": 3196,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3196",
      "data_updated_at": "2017-10-18T23:12:19.340350Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:00:58.000000Z",
        "slug": "線路",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B7%9A%E8%B7%AF",
        "characters": "線路",
        "meanings": [
          {
            "meaning": "Railroad Track",
            "primary": true
          },
          {
            "meaning": "Train Track",
            "primary": false
          },
          {
            "meaning": "Railway Track",
            "primary": false
          },
          {
            "meaning": "Track",
            "primary": false
          },
          {
            "meaning": "Line",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんろ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          767,
          758
        ]
      }
    },
    {
      "id": 3197,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3197",
      "data_updated_at": "2017-10-18T23:12:22.309052Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:04.000000Z",
        "slug": "路地",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B7%AF%E5%9C%B0",
        "characters": "路地",
        "meanings": [
          {
            "meaning": "Alley",
            "primary": true
          },
          {
            "meaning": "Path",
            "primary": false
          },
          {
            "meaning": "Dirt Road",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ろじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          758,
          608
        ]
      }
    },
    {
      "id": 3199,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3199",
      "data_updated_at": "2017-10-18T23:12:19.519924Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:18.000000Z",
        "slug": "農民",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BE%B2%E6%B0%91",
        "characters": "農民",
        "meanings": [
          {
            "meaning": "Peasants",
            "primary": true
          },
          {
            "meaning": "Farmers",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のうみん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          759,
          650
        ]
      }
    },
    {
      "id": 3200,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3200",
      "data_updated_at": "2017-10-18T23:12:20.594787Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:24.000000Z",
        "slug": "農業",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BE%B2%E6%A5%AD",
        "characters": "農業",
        "meanings": [
          {
            "meaning": "Agriculture",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のうぎょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          759,
          756
        ]
      }
    },
    {
      "id": 3201,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3201",
      "data_updated_at": "2017-10-18T23:12:24.482591Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:30.000000Z",
        "slug": "地下鉄",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9C%B0%E4%B8%8B%E9%89%84",
        "characters": "地下鉄",
        "meanings": [
          {
            "meaning": "Subway",
            "primary": true
          },
          {
            "meaning": "The Underground",
            "primary": false
          },
          {
            "meaning": "The Metro",
            "primary": false
          },
          {
            "meaning": "The Tube",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちかてつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          760,
          608,
          451
        ]
      }
    },
    {
      "id": 3202,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3202",
      "data_updated_at": "2017-10-18T23:12:23.754049Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:36.000000Z",
        "slug": "鉄人",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%89%84%E4%BA%BA",
        "characters": "鉄人",
        "meanings": [
          {
            "meaning": "Strong Man",
            "primary": true
          },
          {
            "meaning": "Badass",
            "primary": false
          },
          {
            "meaning": "Iron Man",
            "primary": false
          },
          {
            "meaning": "Macho Man",
            "primary": false
          },
          {
            "meaning": "Tough Guy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てつじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          760,
          444
        ]
      }
    },
    {
      "id": 3203,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3203",
      "data_updated_at": "2017-10-18T23:12:19.295045Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:42.000000Z",
        "slug": "電鉄",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E9%89%84",
        "characters": "電鉄",
        "meanings": [
          {
            "meaning": "Electric Railway",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんてつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          760,
          706
        ]
      }
    },
    {
      "id": 3204,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3204",
      "data_updated_at": "2017-10-18T23:12:22.531617Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:01:55.000000Z",
        "slug": "歌",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%8C",
        "characters": "歌",
        "meanings": [
          {
            "meaning": "Song",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          761
        ]
      }
    },
    {
      "id": 3205,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3205",
      "data_updated_at": "2017-10-18T23:12:23.334740Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:02:02.000000Z",
        "slug": "歌手",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%8C%E6%89%8B",
        "characters": "歌手",
        "meanings": [
          {
            "meaning": "Singer",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かしゅ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          761,
          474
        ]
      }
    },
    {
      "id": 3206,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3206",
      "data_updated_at": "2017-10-18T23:12:21.477672Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:02:24.000000Z",
        "slug": "算数",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AE%97%E6%95%B0",
        "characters": "算数",
        "meanings": [
          {
            "meaning": "Arithmetic",
            "primary": true
          },
          {
            "meaning": "Math",
            "primary": false
          },
          {
            "meaning": "Mathematics",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さんすう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          762,
          703
        ]
      }
    },
    {
      "id": 3207,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3207",
      "data_updated_at": "2017-10-18T23:12:23.194274Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:02:38.000000Z",
        "slug": "算定する",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AE%97%E5%AE%9A%E3%81%99%E3%82%8B",
        "characters": "算定する",
        "meanings": [
          {
            "meaning": "To Calculate",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さんていする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          762,
          714
        ]
      }
    },
    {
      "id": 3208,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3208",
      "data_updated_at": "2017-10-18T23:12:23.667068Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:02:46.000000Z",
        "slug": "聞く",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%81%9E%E3%81%8F",
        "characters": "聞く",
        "meanings": [
          {
            "meaning": "To Hear",
            "primary": true
          },
          {
            "meaning": "To Ask",
            "primary": false
          },
          {
            "meaning": "To Listen",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きく"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          763
        ]
      }
    },
    {
      "id": 3209,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3209",
      "data_updated_at": "2017-10-18T23:12:23.435346Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:02:58.000000Z",
        "slug": "新聞",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%B0%E8%81%9E",
        "characters": "新聞",
        "meanings": [
          {
            "meaning": "Newspaper",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんぶん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          857,
          763
        ]
      }
    },
    {
      "id": 3210,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3210",
      "data_updated_at": "2017-10-18T23:12:20.404280Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:03:04.000000Z",
        "slug": "日本語",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A5%E6%9C%AC%E8%AA%9E",
        "characters": "日本語",
        "meanings": [
          {
            "meaning": "Japanese Language",
            "primary": true
          },
          {
            "meaning": "Japanese",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にほんご"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          764,
          487,
          476
        ]
      }
    },
    {
      "id": 3211,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3211",
      "data_updated_at": "2017-10-18T23:12:20.901954Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:03:10.000000Z",
        "slug": "フランス語",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%83%95%E3%83%A9%E3%83%B3%E3%82%B9%E8%AA%9E",
        "characters": "フランス語",
        "meanings": [
          {
            "meaning": "French Language",
            "primary": true
          },
          {
            "meaning": "French",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふらんすご"
          },
          {
            "primary": false,
            "reading": "フランスご"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          764
        ]
      }
    },
    {
      "id": 3212,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3212",
      "data_updated_at": "2017-10-18T23:12:23.389066Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:03:25.000000Z",
        "slug": "スペイン語",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%82%B9%E3%83%9A%E3%82%A4%E3%83%B3%E8%AA%9E",
        "characters": "スペイン語",
        "meanings": [
          {
            "meaning": "Spanish Language",
            "primary": true
          },
          {
            "meaning": "Spanish",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すぺいんご"
          },
          {
            "primary": false,
            "reading": "スペインご"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          764
        ]
      }
    },
    {
      "id": 3213,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3213",
      "data_updated_at": "2017-10-18T23:12:21.012048Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:03:49.000000Z",
        "slug": "物語",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%89%A9%E8%AA%9E",
        "characters": "物語",
        "meanings": [
          {
            "meaning": "Tale",
            "primary": true
          },
          {
            "meaning": "Story",
            "primary": false
          },
          {
            "meaning": "Legend",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ものがたり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          764,
          718
        ]
      }
    },
    {
      "id": 3214,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3214",
      "data_updated_at": "2017-10-18T23:12:23.795953Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:03:55.000000Z",
        "slug": "主語",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%BB%E8%AA%9E",
        "characters": "主語",
        "meanings": [
          {
            "meaning": "Subject",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅご"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          764,
          528
        ]
      }
    },
    {
      "id": 3215,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3215",
      "data_updated_at": "2017-10-18T23:12:19.977084Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:04:03.000000Z",
        "slug": "読む",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%AA%AD%E3%82%80",
        "characters": "読む",
        "meanings": [
          {
            "meaning": "To Read",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よむ"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          765
        ]
      }
    },
    {
      "id": 3216,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3216",
      "data_updated_at": "2017-11-26T04:31:33.489670Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:04:19.000000Z",
        "slug": "読み方",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%AA%AD%E3%81%BF%E6%96%B9",
        "characters": "読み方",
        "meanings": [
          {
            "meaning": "Reading",
            "primary": true
          },
          {
            "meaning": "Pronunciation",
            "primary": false
          },
          {
            "meaning": "Way Of Reading",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よみかた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          765,
          510
        ]
      }
    },
    {
      "id": 3217,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3217",
      "data_updated_at": "2017-10-18T23:12:23.871824Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:04:32.000000Z",
        "slug": "鳴く",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%B3%B4%E3%81%8F",
        "characters": "鳴く",
        "meanings": [
          {
            "meaning": "To Chirp",
            "primary": true
          },
          {
            "meaning": "To Bark",
            "primary": false
          },
          {
            "meaning": "To Make An Animal Sound",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なく"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          766
        ]
      }
    },
    {
      "id": 3218,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3218",
      "data_updated_at": "2017-10-18T23:12:20.631988Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:04:51.000000Z",
        "slug": "線",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%B7%9A",
        "characters": "線",
        "meanings": [
          {
            "meaning": "Line",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          767
        ]
      }
    },
    {
      "id": 3219,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3219",
      "data_updated_at": "2017-10-18T23:12:23.249165Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:05:08.000000Z",
        "slug": "横",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A8%AA",
        "characters": "横",
        "meanings": [
          {
            "meaning": "Side",
            "primary": true
          },
          {
            "meaning": "Beside",
            "primary": false
          },
          {
            "meaning": "Next To",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よこ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          768
        ]
      }
    },
    {
      "id": 3220,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3220",
      "data_updated_at": "2017-10-18T23:12:21.727678Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:05:28.000000Z",
        "slug": "調子",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%AA%BF%E5%AD%90",
        "characters": "調子",
        "meanings": [
          {
            "meaning": "Condition",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちょうし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          769,
          462
        ]
      }
    },
    {
      "id": 3221,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3221",
      "data_updated_at": "2017-10-18T23:12:21.814579Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:05:35.000000Z",
        "slug": "強調",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%B7%E8%AA%BF",
        "characters": "強調",
        "meanings": [
          {
            "meaning": "Emphasis",
            "primary": true
          },
          {
            "meaning": "Highlight",
            "primary": false
          },
          {
            "meaning": "Stress",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうちょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          769,
          667
        ]
      }
    },
    {
      "id": 3222,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3222",
      "data_updated_at": "2017-10-18T23:12:23.629427Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:05:42.000000Z",
        "slug": "調べる",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%AA%BF%E3%81%B9%E3%82%8B",
        "characters": "調べる",
        "meanings": [
          {
            "meaning": "To Investigate",
            "primary": true
          },
          {
            "meaning": "To Examine",
            "primary": false
          },
          {
            "meaning": "To Research",
            "primary": false
          },
          {
            "meaning": "To Look Into",
            "primary": false
          },
          {
            "meaning": "To Search",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しらべる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          769
        ]
      }
    },
    {
      "id": 3223,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3223",
      "data_updated_at": "2017-10-18T23:12:20.358968Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:05:48.000000Z",
        "slug": "親",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%AA",
        "characters": "親",
        "meanings": [
          {
            "meaning": "Parent",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          770
        ]
      }
    },
    {
      "id": 3224,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3224",
      "data_updated_at": "2017-10-18T23:12:19.609400Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:05:55.000000Z",
        "slug": "親しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%AA%E3%81%97%E3%81%84",
        "characters": "親しい",
        "meanings": [
          {
            "meaning": "Intimate",
            "primary": true
          },
          {
            "meaning": "Friendly",
            "primary": false
          },
          {
            "meaning": "Close",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "したしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          770
        ]
      }
    },
    {
      "id": 3225,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3225",
      "data_updated_at": "2017-10-18T23:12:22.269267Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:06:01.000000Z",
        "slug": "親切",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%AA%E5%88%87",
        "characters": "親切",
        "meanings": [
          {
            "meaning": "Kind",
            "primary": true
          },
          {
            "meaning": "Kindness",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんせつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          770,
          502
        ]
      }
    },
    {
      "id": 3226,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3226",
      "data_updated_at": "2017-10-18T23:12:21.600092Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:06:28.000000Z",
        "slug": "親友",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%AA%E5%8F%8B",
        "characters": "親友",
        "meanings": [
          {
            "meaning": "Close Friend",
            "primary": true
          },
          {
            "meaning": "Best Friend",
            "primary": false
          },
          {
            "meaning": "Good Friend",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんゆう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          770,
          504
        ]
      }
    },
    {
      "id": 3227,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3227",
      "data_updated_at": "2017-10-18T23:12:19.475092Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:06:34.000000Z",
        "slug": "頭",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A0%AD",
        "characters": "頭",
        "meanings": [
          {
            "meaning": "Head",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あたま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          771
        ]
      }
    },
    {
      "id": 3228,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3228",
      "data_updated_at": "2017-10-18T23:12:21.994465Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:07:35.000000Z",
        "slug": "顔",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A1%94",
        "characters": "顔",
        "meanings": [
          {
            "meaning": "Face",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かお"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          772
        ]
      }
    },
    {
      "id": 3229,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3229",
      "data_updated_at": "2017-10-18T23:12:21.949751Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:07:48.000000Z",
        "slug": "顔付き",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A1%94%E4%BB%98%E3%81%8D",
        "characters": "顔付き",
        "meanings": [
          {
            "meaning": "Expression",
            "primary": true
          },
          {
            "meaning": "Facial Expression",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かおつき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          772,
          652
        ]
      }
    },
    {
      "id": 3230,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3230",
      "data_updated_at": "2017-10-18T23:12:20.161274Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:07:54.000000Z",
        "slug": "病気",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%97%85%E6%B0%97",
        "characters": "病気",
        "meanings": [
          {
            "meaning": "Sick",
            "primary": true
          },
          {
            "meaning": "Illness",
            "primary": false
          },
          {
            "meaning": "Sickness",
            "primary": false
          },
          {
            "meaning": "Disease",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びょうき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          773,
          548
        ]
      }
    },
    {
      "id": 3231,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3231",
      "data_updated_at": "2017-10-18T23:12:24.316717Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:08:01.000000Z",
        "slug": "〜病",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E7%97%85",
        "characters": "〜病",
        "meanings": [
          {
            "meaning": "Disease",
            "primary": true
          },
          {
            "meaning": "Sickness",
            "primary": false
          },
          {
            "meaning": "Illness",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          773
        ]
      }
    },
    {
      "id": 3232,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3232",
      "data_updated_at": "2017-10-18T23:12:22.495309Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:08:22.000000Z",
        "slug": "病人",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%97%85%E4%BA%BA",
        "characters": "病人",
        "meanings": [
          {
            "meaning": "Sick Person",
            "primary": true
          },
          {
            "meaning": "Patient",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びょうにん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          773,
          444
        ]
      }
    },
    {
      "id": 3233,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3233",
      "data_updated_at": "2017-10-18T23:12:24.397350Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:08:29.000000Z",
        "slug": "最も",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E3%82%82",
        "characters": "最も",
        "meanings": [
          {
            "meaning": "The Most",
            "primary": true
          },
          {
            "meaning": "Most",
            "primary": false
          },
          {
            "meaning": "Extremely",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "もっとも"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          774
        ]
      }
    },
    {
      "id": 3234,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3234",
      "data_updated_at": "2017-10-18T23:12:20.796054Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:08:37.000000Z",
        "slug": "最高",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E9%AB%98",
        "characters": "最高",
        "meanings": [
          {
            "meaning": "The Best",
            "primary": true
          },
          {
            "meaning": "Best",
            "primary": false
          },
          {
            "meaning": "Supreme",
            "primary": false
          },
          {
            "meaning": "The Most",
            "primary": false
          },
          {
            "meaning": "Most",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいこう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          774,
          666
        ]
      }
    },
    {
      "id": 3235,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3235",
      "data_updated_at": "2017-10-18T23:12:22.453534Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:08:43.000000Z",
        "slug": "最後",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E5%BE%8C",
        "characters": "最後",
        "meanings": [
          {
            "meaning": "Last",
            "primary": true
          },
          {
            "meaning": "The Last",
            "primary": false
          },
          {
            "meaning": "End",
            "primary": false
          },
          {
            "meaning": "Conclusion",
            "primary": false
          },
          {
            "meaning": "Final",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいご"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          774,
          636
        ]
      }
    },
    {
      "id": 3236,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3236",
      "data_updated_at": "2017-10-18T23:12:20.674403Z",
      "data": {
        "level": 10,
        "created_at": "2012-04-24T19:08:50.000000Z",
        "slug": "最近",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E8%BF%91",
        "characters": "最近",
        "meanings": [
          {
            "meaning": "Recent",
            "primary": true
          },
          {
            "meaning": "Latest",
            "primary": false
          },
          {
            "meaning": "Lately",
            "primary": false
          },
          {
            "meaning": "Recently",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいきん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          774,
          596
        ]
      }
    },
    {
      "id": 3237,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3237",
      "data_updated_at": "2017-10-18T23:11:31.762934Z",
      "data": {
        "level": 2,
        "created_at": "2012-04-25T17:33:34.000000Z",
        "slug": "四十二",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E5%8D%81%E4%BA%8C",
        "characters": "四十二",
        "meanings": [
          {
            "meaning": "Forty Two",
            "primary": true
          },
          {
            "meaning": "The Answer",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よんじゅうに"
          }
        ],
        "parts_of_speech": [
          "numeral"
        ],
        "component_subject_ids": [
          485,
          448,
          441
        ]
      }
    },
    {
      "id": 3238,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3238",
      "data_updated_at": "2017-12-08T19:27:47.362540Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:26:21.000000Z",
        "slug": "争う",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%89%E3%81%86",
        "characters": "争う",
        "meanings": [
          {
            "meaning": "To Compete",
            "primary": true
          },
          {
            "meaning": "To Argue",
            "primary": false
          },
          {
            "meaning": "To Quarrel",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あらそう"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          775
        ]
      }
    },
    {
      "id": 3239,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3239",
      "data_updated_at": "2017-09-22T00:31:10.099715Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:26:52.000000Z",
        "slug": "戦争",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%A6%E4%BA%89",
        "characters": "戦争",
        "meanings": [
          {
            "meaning": "War",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんそう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          803,
          775
        ]
      }
    },
    {
      "id": 3240,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3240",
      "data_updated_at": "2017-09-22T00:31:11.050261Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:27:05.000000Z",
        "slug": "競争",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%B6%E4%BA%89",
        "characters": "競争",
        "meanings": [
          {
            "meaning": "Competition",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうそう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          804,
          775
        ]
      }
    },
    {
      "id": 3241,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3241",
      "data_updated_at": "2017-09-22T00:31:11.745401Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:27:37.000000Z",
        "slug": "仲間",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%B2%E9%96%93",
        "characters": "仲間",
        "meanings": [
          {
            "meaning": "Companion",
            "primary": true
          },
          {
            "meaning": "Comrade",
            "primary": false
          },
          {
            "meaning": "Associate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なかま"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          776,
          701
        ]
      }
    },
    {
      "id": 3242,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3242",
      "data_updated_at": "2017-09-22T00:31:12.448325Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:27:44.000000Z",
        "slug": "仲",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%B2",
        "characters": "仲",
        "meanings": [
          {
            "meaning": "Relationship",
            "primary": true
          },
          {
            "meaning": "Relation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          776
        ]
      }
    },
    {
      "id": 3243,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3243",
      "data_updated_at": "2017-09-22T00:31:13.481334Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:27:59.000000Z",
        "slug": "仲直り",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%B2%E7%9B%B4%E3%82%8A",
        "characters": "仲直り",
        "meanings": [
          {
            "meaning": "Reconciliation",
            "primary": true
          },
          {
            "meaning": "Make Peace With",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なかなおり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          776,
          630
        ]
      }
    },
    {
      "id": 3244,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3244",
      "data_updated_at": "2017-12-08T20:20:17.644154Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:28:08.000000Z",
        "slug": "仲良し",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%B2%E8%89%AF%E3%81%97",
        "characters": "仲良し",
        "meanings": [
          {
            "meaning": "Good Friend",
            "primary": true
          },
          {
            "meaning": "Intimate Friend",
            "primary": false
          },
          {
            "meaning": "Close Friend",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なかよし"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          805,
          776
        ]
      }
    },
    {
      "id": 3245,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3245",
      "data_updated_at": "2017-12-29T19:39:06.652615Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:28:22.000000Z",
        "slug": "伝える",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%9D%E3%81%88%E3%82%8B",
        "characters": "伝える",
        "meanings": [
          {
            "meaning": "To Transmit",
            "primary": true
          },
          {
            "meaning": "To Tell",
            "primary": false
          },
          {
            "meaning": "To Pass Down",
            "primary": false
          },
          {
            "meaning": "To Pass Along",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つたえる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          777
        ]
      }
    },
    {
      "id": 3246,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3246",
      "data_updated_at": "2017-09-22T00:31:16.021252Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:28:35.000000Z",
        "slug": "共通点",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%B1%E9%80%9A%E7%82%B9",
        "characters": "共通点",
        "meanings": [
          {
            "meaning": "Common Point",
            "primary": true
          },
          {
            "meaning": "Common Feature",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうつうてん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          778,
          665,
          641
        ]
      }
    },
    {
      "id": 3247,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3247",
      "data_updated_at": "2017-10-19T17:19:25.618734Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:28:41.000000Z",
        "slug": "共同",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%B1%E5%90%8C",
        "characters": "共同",
        "meanings": [
          {
            "meaning": "Cooperation",
            "primary": true
          },
          {
            "meaning": "Collaboration",
            "primary": false
          },
          {
            "meaning": "Joint",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうどう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          778,
          568
        ]
      }
    },
    {
      "id": 3248,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3248",
      "data_updated_at": "2017-09-22T00:31:17.477160Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:28:48.000000Z",
        "slug": "公共",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%AC%E5%85%B1",
        "characters": "公共",
        "meanings": [
          {
            "meaning": "Public",
            "primary": true
          },
          {
            "meaning": "Community",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうきょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          778,
          499
        ]
      }
    },
    {
      "id": 3249,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3249",
      "data_updated_at": "2017-09-22T00:31:18.189072Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:28:55.000000Z",
        "slug": "共有",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%B1%E6%9C%89",
        "characters": "共有",
        "meanings": [
          {
            "meaning": "Shared",
            "primary": true
          },
          {
            "meaning": "Co Ownership",
            "primary": false
          },
          {
            "meaning": "Joint Ownership",
            "primary": false
          },
          {
            "meaning": "Share",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうゆう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          778,
          615
        ]
      }
    },
    {
      "id": 3250,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3250",
      "data_updated_at": "2017-09-22T00:31:19.276497Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:29:02.000000Z",
        "slug": "好き",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A5%BD%E3%81%8D",
        "characters": "好き",
        "meanings": [
          {
            "meaning": "Like",
            "primary": true
          },
          {
            "meaning": "Fondness",
            "primary": false
          },
          {
            "meaning": "Love",
            "primary": false
          },
          {
            "meaning": "To Like",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          779
        ]
      }
    },
    {
      "id": 3251,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3251",
      "data_updated_at": "2017-09-22T00:31:20.333209Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:29:22.000000Z",
        "slug": "友好",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8F%8B%E5%A5%BD",
        "characters": "友好",
        "meanings": [
          {
            "meaning": "Friendship",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆうこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          779,
          504
        ]
      }
    },
    {
      "id": 3252,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3252",
      "data_updated_at": "2017-09-22T00:31:21.241144Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:29:41.000000Z",
        "slug": "成る",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%90%E3%82%8B",
        "characters": "成る",
        "meanings": [
          {
            "meaning": "To Become",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          780
        ]
      }
    },
    {
      "id": 3253,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3253",
      "data_updated_at": "2017-09-22T00:31:22.413462Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:29:55.000000Z",
        "slug": "成功",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%90%E5%8A%9F",
        "characters": "成功",
        "meanings": [
          {
            "meaning": "Success",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せいこう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          806,
          780
        ]
      }
    },
    {
      "id": 3254,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3254",
      "data_updated_at": "2017-09-22T00:31:23.644673Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:30:02.000000Z",
        "slug": "老人",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%80%81%E4%BA%BA",
        "characters": "老人",
        "meanings": [
          {
            "meaning": "Old Person",
            "primary": true
          },
          {
            "meaning": "Elderly Person",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ろうじん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          781,
          444
        ]
      }
    },
    {
      "id": 3255,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3255",
      "data_updated_at": "2017-12-15T22:04:29.833934Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:30:08.000000Z",
        "slug": "〜位",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E4%BD%8D",
        "characters": "〜位",
        "meanings": [
          {
            "meaning": "Rank",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "い"
          }
        ],
        "parts_of_speech": [
          "counter",
          "suffix"
        ],
        "component_subject_ids": [
          782
        ]
      }
    },
    {
      "id": 3256,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3256",
      "data_updated_at": "2017-09-22T00:31:27.053065Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:30:15.000000Z",
        "slug": "一位",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E4%BD%8D",
        "characters": "一位",
        "meanings": [
          {
            "meaning": "First Place",
            "primary": true
          },
          {
            "meaning": "First Ranked",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          782,
          440
        ]
      }
    },
    {
      "id": 3257,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3257",
      "data_updated_at": "2017-09-22T00:31:27.741245Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:30:40.000000Z",
        "slug": "主位",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%BB%E4%BD%8D",
        "characters": "主位",
        "meanings": [
          {
            "meaning": "Leading Person",
            "primary": true
          },
          {
            "meaning": "First Place",
            "primary": false
          },
          {
            "meaning": "Leading Position",
            "primary": false
          },
          {
            "meaning": "First Position",
            "primary": false
          },
          {
            "meaning": "Head Position",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          782,
          528
        ]
      }
    },
    {
      "id": 3258,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3258",
      "data_updated_at": "2017-09-22T00:31:28.570741Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:30:47.000000Z",
        "slug": "低い",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%8E%E3%81%84",
        "characters": "低い",
        "meanings": [
          {
            "meaning": "Low",
            "primary": true
          },
          {
            "meaning": "Short",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひくい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          783
        ]
      }
    },
    {
      "id": 3259,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3259",
      "data_updated_at": "2017-09-22T00:31:29.653164Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:30:54.000000Z",
        "slug": "最低",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E4%BD%8E",
        "characters": "最低",
        "meanings": [
          {
            "meaning": "The Lowest",
            "primary": true
          },
          {
            "meaning": "The Worst",
            "primary": false
          },
          {
            "meaning": "Lowest",
            "primary": false
          },
          {
            "meaning": "Worst",
            "primary": false
          },
          {
            "meaning": "Nasty",
            "primary": false
          },
          {
            "meaning": "Terrible",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいてい"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          783,
          774
        ]
      }
    },
    {
      "id": 3260,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3260",
      "data_updated_at": "2017-09-22T00:31:30.734117Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:31:07.000000Z",
        "slug": "初回",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%9D%E5%9B%9E",
        "characters": "初回",
        "meanings": [
          {
            "meaning": "The First Time",
            "primary": true
          },
          {
            "meaning": "First Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          784,
          569
        ]
      }
    },
    {
      "id": 3261,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3261",
      "data_updated_at": "2017-09-22T00:31:31.652860Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:31:24.000000Z",
        "slug": "最初",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E5%88%9D",
        "characters": "最初",
        "meanings": [
          {
            "meaning": "The First",
            "primary": true
          },
          {
            "meaning": "First",
            "primary": false
          },
          {
            "meaning": "Beginning",
            "primary": false
          },
          {
            "meaning": "Outset",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいしょ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          784,
          774
        ]
      }
    },
    {
      "id": 3262,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3262",
      "data_updated_at": "2017-12-08T20:19:19.831305Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:31:31.000000Z",
        "slug": "別の",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%A5%E3%81%AE",
        "characters": "別の",
        "meanings": [
          {
            "meaning": "Separate",
            "primary": true
          },
          {
            "meaning": "Different",
            "primary": false
          },
          {
            "meaning": "Another",
            "primary": false
          },
          {
            "meaning": "Separate Thing",
            "primary": false
          },
          {
            "meaning": "Different Thing",
            "primary": false
          },
          {
            "meaning": "Another Thing",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べつの"
          }
        ],
        "parts_of_speech": [
          "no_adjective"
        ],
        "component_subject_ids": [
          785
        ]
      }
    },
    {
      "id": 3263,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3263",
      "data_updated_at": "2017-09-22T00:31:33.453247Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:31:38.000000Z",
        "slug": "別に",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%A5%E3%81%AB",
        "characters": "別に",
        "meanings": [
          {
            "meaning": "Not Particularly",
            "primary": true
          },
          {
            "meaning": "Separately",
            "primary": false
          },
          {
            "meaning": "Not Really",
            "primary": false
          },
          {
            "meaning": "Not Exactly",
            "primary": false
          },
          {
            "meaning": "Not Especially",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べつに"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          785
        ]
      }
    },
    {
      "id": 3264,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3264",
      "data_updated_at": "2017-12-08T20:24:41.372235Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:31:45.000000Z",
        "slug": "別人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%A5%E4%BA%BA",
        "characters": "別人",
        "meanings": [
          {
            "meaning": "Different Person",
            "primary": true
          },
          {
            "meaning": "Changed Person",
            "primary": false
          },
          {
            "meaning": "Changed Man",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べつじん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          785,
          444
        ]
      }
    },
    {
      "id": 3265,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3265",
      "data_updated_at": "2017-09-22T00:31:35.078788Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:31:53.000000Z",
        "slug": "別々",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%A5%E3%80%85",
        "characters": "別々",
        "meanings": [
          {
            "meaning": "Separately",
            "primary": true
          },
          {
            "meaning": "Individually",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べつべつ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          856,
          785
        ]
      }
    },
    {
      "id": 3266,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3266",
      "data_updated_at": "2017-09-22T00:31:36.022255Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:32:02.000000Z",
        "slug": "特別",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%89%B9%E5%88%A5",
        "characters": "特別",
        "meanings": [
          {
            "meaning": "Special",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とくべつ"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          807,
          785
        ]
      }
    },
    {
      "id": 3267,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3267",
      "data_updated_at": "2017-09-22T00:31:36.884579Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:32:10.000000Z",
        "slug": "利く",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%A9%E3%81%8F",
        "characters": "利く",
        "meanings": [
          {
            "meaning": "To Be Effective",
            "primary": true
          },
          {
            "meaning": "To Show Effect",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          786
        ]
      }
    },
    {
      "id": 3268,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3268",
      "data_updated_at": "2017-12-08T20:18:05.451908Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:32:18.000000Z",
        "slug": "便利",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BE%BF%E5%88%A9",
        "characters": "便利",
        "meanings": [
          {
            "meaning": "Convenient",
            "primary": true
          },
          {
            "meaning": "Handy",
            "primary": false
          },
          {
            "meaning": "Useful",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べんり"
          }
        ],
        "parts_of_speech": [
          "na_adjective"
        ],
        "component_subject_ids": [
          808,
          786
        ]
      }
    },
    {
      "id": 3269,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3269",
      "data_updated_at": "2017-09-22T00:31:38.385364Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:32:44.000000Z",
        "slug": "努力",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%AA%E5%8A%9B",
        "characters": "努力",
        "meanings": [
          {
            "meaning": "Great Effort",
            "primary": true
          },
          {
            "meaning": "Exertion",
            "primary": false
          },
          {
            "meaning": "Grueling Effort",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どりょく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          787,
          447
        ]
      }
    },
    {
      "id": 3270,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3270",
      "data_updated_at": "2017-12-08T20:33:11.024370Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:32:51.000000Z",
        "slug": "労働",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%B4%E5%83%8D",
        "characters": "労働",
        "meanings": [
          {
            "meaning": "Manual Labor",
            "primary": true
          },
          {
            "meaning": "Manual Labour",
            "primary": false
          },
          {
            "meaning": "Labor",
            "primary": false
          },
          {
            "meaning": "Labour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ろうどう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          809,
          788
        ]
      }
    },
    {
      "id": 3271,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3271",
      "data_updated_at": "2017-09-22T00:31:41.240095Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:32:58.000000Z",
        "slug": "苦労",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8B%A6%E5%8A%B4",
        "characters": "苦労",
        "meanings": [
          {
            "meaning": "Hardship",
            "primary": true
          },
          {
            "meaning": "Troubles",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くろう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "na_adjective"
        ],
        "component_subject_ids": [
          788,
          719
        ]
      }
    },
    {
      "id": 3272,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3272",
      "data_updated_at": "2017-09-22T00:31:42.161770Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:33:04.000000Z",
        "slug": "労働者",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8A%B4%E5%83%8D%E8%80%85",
        "characters": "労働者",
        "meanings": [
          {
            "meaning": "Laborer",
            "primary": true
          },
          {
            "meaning": "Blue Collar Worker",
            "primary": false
          },
          {
            "meaning": "Manual Laborer",
            "primary": false
          },
          {
            "meaning": "Labourer",
            "primary": false
          },
          {
            "meaning": "Manual Labourer",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ろうどうしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          809,
          788,
          690
        ]
      }
    },
    {
      "id": 3273,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3273",
      "data_updated_at": "2017-12-08T20:36:16.440397Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:33:12.000000Z",
        "slug": "命",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%91%BD",
        "characters": "命",
        "meanings": [
          {
            "meaning": "Life",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いのち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          789
        ]
      }
    },
    {
      "id": 3274,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3274",
      "data_updated_at": "2017-09-22T00:31:44.089692Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:33:20.000000Z",
        "slug": "運命",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%8B%E5%91%BD",
        "characters": "運命",
        "meanings": [
          {
            "meaning": "Fate",
            "primary": true
          },
          {
            "meaning": "Destiny",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うんめい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          789,
          752
        ]
      }
    },
    {
      "id": 3275,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3275",
      "data_updated_at": "2017-09-22T00:31:46.544820Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:33:29.000000Z",
        "slug": "命令",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%91%BD%E4%BB%A4",
        "characters": "命令",
        "meanings": [
          {
            "meaning": "Order",
            "primary": true
          },
          {
            "meaning": "Command",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "めいれい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          810,
          789
        ]
      }
    },
    {
      "id": 3276,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3276",
      "data_updated_at": "2017-09-22T00:31:47.487793Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:33:50.000000Z",
        "slug": "海岸",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B5%B7%E5%B2%B8",
        "characters": "海岸",
        "meanings": [
          {
            "meaning": "Seashore",
            "primary": true
          },
          {
            "meaning": "Coast",
            "primary": false
          },
          {
            "meaning": "Seacoast",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいがん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          790,
          640
        ]
      }
    },
    {
      "id": 3277,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3277",
      "data_updated_at": "2017-09-22T00:31:48.297394Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:34:09.000000Z",
        "slug": "放す",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%94%BE%E3%81%99",
        "characters": "放す",
        "meanings": [
          {
            "meaning": "To Release",
            "primary": true
          },
          {
            "meaning": "To Let Go",
            "primary": false
          },
          {
            "meaning": "To Release Something",
            "primary": false
          },
          {
            "meaning": "To Let Go Of Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はなす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          791
        ]
      }
    },
    {
      "id": 3278,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3278",
      "data_updated_at": "2017-12-15T22:18:49.834349Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:34:32.000000Z",
        "slug": "開放する",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%96%8B%E6%94%BE%E3%81%99%E3%82%8B",
        "characters": "開放する",
        "meanings": [
          {
            "meaning": "To Open Up",
            "primary": true
          },
          {
            "meaning": "To Throw Open",
            "primary": false
          },
          {
            "meaning": "To Open To The Public",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいほうする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          791,
          753
        ]
      }
    },
    {
      "id": 3279,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3279",
      "data_updated_at": "2017-09-22T00:31:52.039652Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:34:39.000000Z",
        "slug": "昔",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%98%94",
        "characters": "昔",
        "meanings": [
          {
            "meaning": "Long Ago",
            "primary": true
          },
          {
            "meaning": "Long Time Ago",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むかし"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          792
        ]
      }
    },
    {
      "id": 3280,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3280",
      "data_updated_at": "2017-09-22T00:31:52.821005Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:34:47.000000Z",
        "slug": "電波",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%BB%E6%B3%A2",
        "characters": "電波",
        "meanings": [
          {
            "meaning": "Reception",
            "primary": true
          },
          {
            "meaning": "Radio Wave",
            "primary": false
          },
          {
            "meaning": "Electromagnetic Wave",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "でんぱ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          793,
          706
        ]
      }
    },
    {
      "id": 3281,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3281",
      "data_updated_at": "2017-09-22T00:31:53.986438Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:34:53.000000Z",
        "slug": "注ぐ",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B3%A8%E3%81%90",
        "characters": "注ぐ",
        "meanings": [
          {
            "meaning": "To Pour",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そそぐ"
          },
          {
            "primary": false,
            "reading": "つぐ"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          794
        ]
      }
    },
    {
      "id": 3282,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3282",
      "data_updated_at": "2017-09-22T00:31:55.323058Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:35:01.000000Z",
        "slug": "注意",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B3%A8%E6%84%8F",
        "characters": "注意",
        "meanings": [
          {
            "meaning": "Caution",
            "primary": true
          },
          {
            "meaning": "Attention",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          811,
          794
        ]
      }
    },
    {
      "id": 3283,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3283",
      "data_updated_at": "2017-09-22T00:31:56.310910Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:35:12.000000Z",
        "slug": "注文",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B3%A8%E6%96%87",
        "characters": "注文",
        "meanings": [
          {
            "meaning": "Order",
            "primary": true
          },
          {
            "meaning": "Request",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうもん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          794,
          475
        ]
      }
    },
    {
      "id": 3284,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3284",
      "data_updated_at": "2017-09-22T00:31:57.376994Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:35:45.000000Z",
        "slug": "集中する",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9B%86%E4%B8%AD%E3%81%99%E3%82%8B",
        "characters": "集中する",
        "meanings": [
          {
            "meaning": "To Concentrate",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゅうちゅうする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          754,
          469
        ]
      }
    },
    {
      "id": 3285,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3285",
      "data_updated_at": "2017-09-22T00:31:58.315234Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:35:55.000000Z",
        "slug": "育つ",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%82%B2%E3%81%A4",
        "characters": "育つ",
        "meanings": [
          {
            "meaning": "To Be Raised",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "そだつ"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          795
        ]
      }
    },
    {
      "id": 3286,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3286",
      "data_updated_at": "2017-09-22T00:31:59.493364Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:36:19.000000Z",
        "slug": "教育",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%95%99%E8%82%B2",
        "characters": "教育",
        "meanings": [
          {
            "meaning": "Education",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょういく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          795,
          668
        ]
      }
    },
    {
      "id": 3287,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3287",
      "data_updated_at": "2017-09-22T00:32:00.397320Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:36:46.000000Z",
        "slug": "拾う",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%8B%BE%E3%81%86",
        "characters": "拾う",
        "meanings": [
          {
            "meaning": "To Pick Up",
            "primary": true
          },
          {
            "meaning": "To Find",
            "primary": false
          },
          {
            "meaning": "To Gather",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひろう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          796
        ]
      }
    },
    {
      "id": 3288,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3288",
      "data_updated_at": "2017-09-22T00:32:01.373409Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:37:01.000000Z",
        "slug": "指す",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%8C%87%E3%81%99",
        "characters": "指す",
        "meanings": [
          {
            "meaning": "To Point",
            "primary": true
          },
          {
            "meaning": "To Point At",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          797
        ]
      }
    },
    {
      "id": 3289,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3289",
      "data_updated_at": "2017-09-22T00:32:02.217531Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:37:13.000000Z",
        "slug": "指",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%8C%87",
        "characters": "指",
        "meanings": [
          {
            "meaning": "Finger",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆび"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          797
        ]
      }
    },
    {
      "id": 3290,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3290",
      "data_updated_at": "2017-09-22T00:32:03.005419Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:37:22.000000Z",
        "slug": "小指",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%8F%E6%8C%87",
        "characters": "小指",
        "meanings": [
          {
            "meaning": "Little Finger",
            "primary": true
          },
          {
            "meaning": "Pinky Finger",
            "primary": false
          },
          {
            "meaning": "Pinky",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こゆび"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          797,
          463
        ]
      }
    },
    {
      "id": 3291,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3291",
      "data_updated_at": "2017-09-22T00:32:03.837276Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:37:32.000000Z",
        "slug": "指定する",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%8C%87%E5%AE%9A%E3%81%99%E3%82%8B",
        "characters": "指定する",
        "meanings": [
          {
            "meaning": "To Appoint",
            "primary": true
          },
          {
            "meaning": "To Assign",
            "primary": false
          },
          {
            "meaning": "To Designate",
            "primary": false
          },
          {
            "meaning": "To Specify",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "していする"
          }
        ],
        "parts_of_speech": [
          "suru_verb"
        ],
        "component_subject_ids": [
          797,
          714
        ]
      }
    },
    {
      "id": 3292,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3292",
      "data_updated_at": "2017-09-22T00:32:04.512014Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:37:52.000000Z",
        "slug": "洋風",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B4%8B%E9%A2%A8",
        "characters": "洋風",
        "meanings": [
          {
            "meaning": "Western Style",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようふう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          853,
          798
        ]
      }
    },
    {
      "id": 3293,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3293",
      "data_updated_at": "2017-12-08T19:49:51.303361Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:00.000000Z",
        "slug": "洋服",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B4%8B%E6%9C%8D",
        "characters": "洋服",
        "meanings": [
          {
            "meaning": "Clothes",
            "primary": true
          },
          {
            "meaning": "Western Clothing",
            "primary": false
          },
          {
            "meaning": "Western Style Clothes",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようふく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          798,
          716
        ]
      }
    },
    {
      "id": 3294,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3294",
      "data_updated_at": "2017-09-22T00:32:06.202881Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:07.000000Z",
        "slug": "太平洋",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%AA%E5%B9%B3%E6%B4%8B",
        "characters": "太平洋",
        "meanings": [
          {
            "meaning": "Pacific Ocean",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいへいよう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          798,
          535,
          505
        ]
      }
    },
    {
      "id": 3295,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3295",
      "data_updated_at": "2017-09-22T00:32:07.041749Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:17.000000Z",
        "slug": "洋食",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B4%8B%E9%A3%9F",
        "characters": "洋食",
        "meanings": [
          {
            "meaning": "Western Food",
            "primary": true
          },
          {
            "meaning": "Western Style Food",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようしょく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          798,
          644
        ]
      }
    },
    {
      "id": 3296,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3296",
      "data_updated_at": "2017-09-22T00:32:07.998631Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:33.000000Z",
        "slug": "洋室",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B4%8B%E5%AE%A4",
        "characters": "洋室",
        "meanings": [
          {
            "meaning": "Western Style Room",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ようしつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          798,
          635
        ]
      }
    },
    {
      "id": 3297,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3297",
      "data_updated_at": "2017-09-22T00:32:08.974640Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:40.000000Z",
        "slug": "神",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A5%9E",
        "characters": "神",
        "meanings": [
          {
            "meaning": "God",
            "primary": true
          },
          {
            "meaning": "Gods",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          799
        ]
      }
    },
    {
      "id": 3298,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3298",
      "data_updated_at": "2017-09-22T00:32:09.767234Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:47.000000Z",
        "slug": "神道",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A5%9E%E9%81%93",
        "characters": "神道",
        "meanings": [
          {
            "meaning": "Shinto",
            "primary": true
          },
          {
            "meaning": "Shintou",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんとう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          799,
          700
        ]
      }
    },
    {
      "id": 3299,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3299",
      "data_updated_at": "2017-09-22T00:32:10.579087Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:38:54.000000Z",
        "slug": "神社",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A5%9E%E7%A4%BE",
        "characters": "神社",
        "meanings": [
          {
            "meaning": "Shinto Shrine",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じんじゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          799,
          591
        ]
      }
    },
    {
      "id": 3300,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3300",
      "data_updated_at": "2017-12-08T21:39:50.857049Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:39:02.000000Z",
        "slug": "秒",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A7%92",
        "characters": "秒",
        "meanings": [
          {
            "meaning": "Second",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "びょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          800
        ]
      }
    },
    {
      "id": 3301,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3301",
      "data_updated_at": "2017-09-22T00:32:12.933510Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:39:10.000000Z",
        "slug": "高級",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%AB%98%E7%B4%9A",
        "characters": "高級",
        "meanings": [
          {
            "meaning": "High Class",
            "primary": true
          },
          {
            "meaning": "High Grade",
            "primary": false
          },
          {
            "meaning": "High Level",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうきゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          801,
          666
        ]
      }
    },
    {
      "id": 3302,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3302",
      "data_updated_at": "2017-09-22T00:32:13.965787Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:39:20.000000Z",
        "slug": "初級",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%9D%E7%B4%9A",
        "characters": "初級",
        "meanings": [
          {
            "meaning": "Beginner Level",
            "primary": true
          },
          {
            "meaning": "Elementary Level",
            "primary": false
          },
          {
            "meaning": "Beginning Level",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょきゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          801,
          784
        ]
      }
    },
    {
      "id": 3303,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3303",
      "data_updated_at": "2017-09-22T00:32:14.911089Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:39:32.000000Z",
        "slug": "中級",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E7%B4%9A",
        "characters": "中級",
        "meanings": [
          {
            "meaning": "Intermediate Level",
            "primary": true
          },
          {
            "meaning": "Intermediate Rank",
            "primary": false
          },
          {
            "meaning": "Intermediate Grade",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうきゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          801,
          469
        ]
      }
    },
    {
      "id": 3304,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3304",
      "data_updated_at": "2017-09-22T00:32:15.709525Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:39:40.000000Z",
        "slug": "上級",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8A%E7%B4%9A",
        "characters": "上級",
        "meanings": [
          {
            "meaning": "Advanced Level",
            "primary": true
          },
          {
            "meaning": "High Grade",
            "primary": false
          },
          {
            "meaning": "Advanced Grade",
            "primary": false
          },
          {
            "meaning": "High Level",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じょうきゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          801,
          450
        ]
      }
    },
    {
      "id": 3305,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3305",
      "data_updated_at": "2017-09-22T00:32:16.876246Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:39:47.000000Z",
        "slug": "追う",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%BD%E3%81%86",
        "characters": "追う",
        "meanings": [
          {
            "meaning": "To Chase",
            "primary": true
          },
          {
            "meaning": "To Follow",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おう"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          802
        ]
      }
    },
    {
      "id": 3306,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3306",
      "data_updated_at": "2017-09-22T00:32:17.647192Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:40:12.000000Z",
        "slug": "戦い",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%A6%E3%81%84",
        "characters": "戦い",
        "meanings": [
          {
            "meaning": "Battle",
            "primary": true
          },
          {
            "meaning": "Fight",
            "primary": false
          },
          {
            "meaning": "Conflict",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たたかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          803
        ]
      }
    },
    {
      "id": 3307,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3307",
      "data_updated_at": "2017-09-22T00:32:18.465681Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:40:35.000000Z",
        "slug": "作戦",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E6%88%A6",
        "characters": "作戦",
        "meanings": [
          {
            "meaning": "Tactics",
            "primary": true
          },
          {
            "meaning": "Strategy",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さくせん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          803,
          584
        ]
      }
    },
    {
      "id": 3308,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3308",
      "data_updated_at": "2017-09-22T00:32:19.137744Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:40:45.000000Z",
        "slug": "戦車",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%A6%E8%BB%8A",
        "characters": "戦車",
        "meanings": [
          {
            "meaning": "Tank",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          803,
          562
        ]
      }
    },
    {
      "id": 3309,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3309",
      "data_updated_at": "2017-09-22T00:32:20.225319Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:40:53.000000Z",
        "slug": "戦場",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%88%A6%E5%A0%B4",
        "characters": "戦場",
        "meanings": [
          {
            "meaning": "Battlefield",
            "primary": true
          },
          {
            "meaning": "Battleground",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "せんじょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          803,
          694
        ]
      }
    },
    {
      "id": 3310,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3310",
      "data_updated_at": "2017-09-22T00:32:21.297030Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:41:03.000000Z",
        "slug": "競う",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%B6%E3%81%86",
        "characters": "競う",
        "meanings": [
          {
            "meaning": "To Compete",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きそう"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          804
        ]
      }
    },
    {
      "id": 3311,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3311",
      "data_updated_at": "2017-09-22T00:32:22.118514Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:41:11.000000Z",
        "slug": "良い",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%89%AF%E3%81%84",
        "characters": "良い",
        "meanings": [
          {
            "meaning": "Good",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よい"
          },
          {
            "primary": false,
            "reading": "いい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          805
        ]
      }
    },
    {
      "id": 3312,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3312",
      "data_updated_at": "2017-09-22T00:32:23.207134Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:41:36.000000Z",
        "slug": "仲良く",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%B2%E8%89%AF%E3%81%8F",
        "characters": "仲良く",
        "meanings": [
          {
            "meaning": "Friendly",
            "primary": true
          },
          {
            "meaning": "Good Terms",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なかよく"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          805,
          776
        ]
      }
    },
    {
      "id": 3313,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3313",
      "data_updated_at": "2017-09-22T00:32:24.165401Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:42:05.000000Z",
        "slug": "特に",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%89%B9%E3%81%AB",
        "characters": "特に",
        "meanings": [
          {
            "meaning": "Especially",
            "primary": true
          },
          {
            "meaning": "Particularly",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とくに"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          807
        ]
      }
    },
    {
      "id": 3314,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3314",
      "data_updated_at": "2017-09-22T00:32:25.121346Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:42:32.000000Z",
        "slug": "不便",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8D%E4%BE%BF",
        "characters": "不便",
        "meanings": [
          {
            "meaning": "Inconvenient",
            "primary": true
          },
          {
            "meaning": "Not Convenient",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふべん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          808,
          563
        ]
      }
    },
    {
      "id": 3315,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3315",
      "data_updated_at": "2017-09-22T00:32:26.101177Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:42:39.000000Z",
        "slug": "便所",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BE%BF%E6%89%80",
        "characters": "便所",
        "meanings": [
          {
            "meaning": "Toilet",
            "primary": true
          },
          {
            "meaning": "Lavatory",
            "primary": false
          },
          {
            "meaning": "Restroom",
            "primary": false
          },
          {
            "meaning": "Bathroom",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べんじょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          808,
          707
        ]
      }
    },
    {
      "id": 3316,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3316",
      "data_updated_at": "2017-09-22T00:32:27.167583Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:42:47.000000Z",
        "slug": "働く",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%83%8D%E3%81%8F",
        "characters": "働く",
        "meanings": [
          {
            "meaning": "To Work",
            "primary": true
          },
          {
            "meaning": "To Labor",
            "primary": false
          },
          {
            "meaning": "To Labour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はたらく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          809
        ]
      }
    },
    {
      "id": 3317,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3317",
      "data_updated_at": "2017-09-22T00:32:28.013287Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:43:19.000000Z",
        "slug": "意見",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%84%8F%E8%A6%8B",
        "characters": "意見",
        "meanings": [
          {
            "meaning": "Opinion",
            "primary": true
          },
          {
            "meaning": "View",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いけん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          811,
          558
        ]
      }
    },
    {
      "id": 3318,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3318",
      "data_updated_at": "2017-09-22T00:32:29.052266Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:43:42.000000Z",
        "slug": "意味",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%84%8F%E5%91%B3",
        "characters": "意味",
        "meanings": [
          {
            "meaning": "Meaning",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いみ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          812,
          811
        ]
      }
    },
    {
      "id": 3319,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3319",
      "data_updated_at": "2017-12-08T20:20:48.478881Z",
      "data": {
        "level": 11,
        "created_at": "2012-04-26T06:44:04.000000Z",
        "slug": "味",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%91%B3",
        "characters": "味",
        "meanings": [
          {
            "meaning": "Taste",
            "primary": true
          },
          {
            "meaning": "Flavor",
            "primary": false
          },
          {
            "meaning": "Flavour",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          812
        ]
      }
    },
    {
      "id": 3320,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3320",
      "data_updated_at": "2017-09-22T00:32:30.757478Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:01:14.000000Z",
        "slug": "勉強",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8B%89%E5%BC%B7",
        "characters": "勉強",
        "meanings": [
          {
            "meaning": "Studies",
            "primary": true
          },
          {
            "meaning": "Study",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "べんきょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          813,
          667
        ]
      }
    },
    {
      "id": 3321,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3321",
      "data_updated_at": "2017-09-22T00:32:31.821291Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:01:26.000000Z",
        "slug": "家庭",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%B6%E5%BA%AD",
        "characters": "家庭",
        "meanings": [
          {
            "meaning": "Family",
            "primary": true
          },
          {
            "meaning": "Household",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かてい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          814,
          660
        ]
      }
    },
    {
      "id": 3322,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3322",
      "data_updated_at": "2017-09-22T00:32:32.661512Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:01:35.000000Z",
        "slug": "庭",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BA%AD",
        "characters": "庭",
        "meanings": [
          {
            "meaning": "Garden",
            "primary": true
          },
          {
            "meaning": "Yard",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にわ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          814
        ]
      }
    },
    {
      "id": 3323,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3323",
      "data_updated_at": "2017-09-22T00:32:33.648531Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:01:42.000000Z",
        "slug": "息",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%81%AF",
        "characters": "息",
        "meanings": [
          {
            "meaning": "Breath",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          815
        ]
      }
    },
    {
      "id": 3324,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3324",
      "data_updated_at": "2017-09-22T00:32:34.476147Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:01:51.000000Z",
        "slug": "息子",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%81%AF%E5%AD%90",
        "characters": "息子",
        "meanings": [
          {
            "meaning": "Son",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むすこ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          815,
          462
        ]
      }
    },
    {
      "id": 3325,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3325",
      "data_updated_at": "2017-09-22T00:32:35.365295Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:02:04.000000Z",
        "slug": "利息",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%A9%E6%81%AF",
        "characters": "利息",
        "meanings": [
          {
            "meaning": "Interest",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りそく"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          815,
          786
        ]
      }
    },
    {
      "id": 3326,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3326",
      "data_updated_at": "2017-09-22T00:32:36.392351Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:02:14.000000Z",
        "slug": "旅",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%85",
        "characters": "旅",
        "meanings": [
          {
            "meaning": "Trip",
            "primary": true
          },
          {
            "meaning": "Travel",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たび"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          816
        ]
      }
    },
    {
      "id": 3327,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3327",
      "data_updated_at": "2017-09-22T00:32:37.486622Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:02:21.000000Z",
        "slug": "旅行",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%85%E8%A1%8C",
        "characters": "旅行",
        "meanings": [
          {
            "meaning": "Trip",
            "primary": true
          },
          {
            "meaning": "Travel",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りょこう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          816,
          580
        ]
      }
    },
    {
      "id": 3328,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3328",
      "data_updated_at": "2017-09-22T00:32:38.357762Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:02:45.000000Z",
        "slug": "根",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A0%B9",
        "characters": "根",
        "meanings": [
          {
            "meaning": "Root",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ね"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          817
        ]
      }
    },
    {
      "id": 3329,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3329",
      "data_updated_at": "2017-09-22T00:32:39.109557Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:02:53.000000Z",
        "slug": "根本",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A0%B9%E6%9C%AC",
        "characters": "根本",
        "meanings": [
          {
            "meaning": "Root",
            "primary": true
          },
          {
            "meaning": "Source",
            "primary": false
          },
          {
            "meaning": "Origin",
            "primary": false
          },
          {
            "meaning": "Foundation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんぽん"
          },
          {
            "primary": false,
            "reading": "ねもと"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          817,
          487
        ]
      }
    },
    {
      "id": 3330,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3330",
      "data_updated_at": "2017-09-22T00:32:39.869106Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:03:01.000000Z",
        "slug": "屋根",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B1%8B%E6%A0%B9",
        "characters": "屋根",
        "meanings": [
          {
            "meaning": "Roof",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やね"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          817,
          724
        ]
      }
    },
    {
      "id": 3331,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3331",
      "data_updated_at": "2017-09-22T00:32:40.768826Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:03:08.000000Z",
        "slug": "根気",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A0%B9%E6%B0%97",
        "characters": "根気",
        "meanings": [
          {
            "meaning": "Patience",
            "primary": true
          },
          {
            "meaning": "Perseverance",
            "primary": false
          },
          {
            "meaning": "Persistence",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こんき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          817,
          548
        ]
      }
    },
    {
      "id": 3332,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3332",
      "data_updated_at": "2017-09-22T00:32:41.605313Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:03:15.000000Z",
        "slug": "大根",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E6%A0%B9",
        "characters": "大根",
        "meanings": [
          {
            "meaning": "Daikon",
            "primary": true
          },
          {
            "meaning": "Japanese Radish",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいこん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          817,
          453
        ]
      }
    },
    {
      "id": 3333,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3333",
      "data_updated_at": "2017-09-22T00:32:42.153187Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:03:33.000000Z",
        "slug": "流す",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B5%81%E3%81%99",
        "characters": "流す",
        "meanings": [
          {
            "meaning": "To Flow",
            "primary": true
          },
          {
            "meaning": "To Flush",
            "primary": false
          },
          {
            "meaning": "To Drain",
            "primary": false
          },
          {
            "meaning": "To Pour",
            "primary": false
          },
          {
            "meaning": "To Float",
            "primary": false
          },
          {
            "meaning": "To Wash Away",
            "primary": false
          },
          {
            "meaning": "To Set Afloat",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ながす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          818
        ]
      }
    },
    {
      "id": 3334,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3334",
      "data_updated_at": "2017-09-22T00:32:42.795924Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:03:40.000000Z",
        "slug": "流行",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B5%81%E8%A1%8C",
        "characters": "流行",
        "meanings": [
          {
            "meaning": "Trend",
            "primary": true
          },
          {
            "meaning": "Fad",
            "primary": false
          },
          {
            "meaning": "Craze",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "りゅうこう"
          },
          {
            "primary": false,
            "reading": "はやり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb",
          "no_adjective"
        ],
        "component_subject_ids": [
          818,
          580
        ]
      }
    },
    {
      "id": 3335,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3335",
      "data_updated_at": "2017-09-22T00:32:43.491713Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:03:48.000000Z",
        "slug": "一流",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E6%B5%81",
        "characters": "一流",
        "meanings": [
          {
            "meaning": "First Rate",
            "primary": true
          },
          {
            "meaning": "First Class",
            "primary": false
          },
          {
            "meaning": "Top Notch",
            "primary": false
          },
          {
            "meaning": "Top Grade",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いちりゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          818,
          440
        ]
      }
    },
    {
      "id": 3336,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3336",
      "data_updated_at": "2017-09-22T00:32:44.194164Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:04:11.000000Z",
        "slug": "本流",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%AC%E6%B5%81",
        "characters": "本流",
        "meanings": [
          {
            "meaning": "Mainstream",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほんりゅう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          818,
          487
        ]
      }
    },
    {
      "id": 3337,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3337",
      "data_updated_at": "2017-09-22T00:32:45.015819Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:04:25.000000Z",
        "slug": "消す",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B6%88%E3%81%99",
        "characters": "消す",
        "meanings": [
          {
            "meaning": "To Extinguish",
            "primary": true
          },
          {
            "meaning": "To Erase",
            "primary": false
          },
          {
            "meaning": "To Turn Off",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          819
        ]
      }
    },
    {
      "id": 3338,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3338",
      "data_updated_at": "2017-09-22T00:32:45.784135Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:02.000000Z",
        "slug": "〜倍",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%80%9C%E5%80%8D",
        "characters": "〜倍",
        "meanings": [
          {
            "meaning": "Times",
            "primary": true
          },
          {
            "meaning": "Fold",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ばい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suffix"
        ],
        "component_subject_ids": [
          820
        ]
      }
    },
    {
      "id": 3339,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3339",
      "data_updated_at": "2017-09-22T00:32:46.453299Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:10.000000Z",
        "slug": "二倍",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E5%80%8D",
        "characters": "二倍",
        "meanings": [
          {
            "meaning": "Double",
            "primary": true
          },
          {
            "meaning": "Two Times",
            "primary": false
          },
          {
            "meaning": "Twice",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にばい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          820,
          441
        ]
      }
    },
    {
      "id": 3340,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3340",
      "data_updated_at": "2017-09-22T00:32:47.971480Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:18.000000Z",
        "slug": "店員",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BA%97%E5%93%A1",
        "characters": "店員",
        "meanings": [
          {
            "meaning": "Shop Staff",
            "primary": true
          },
          {
            "meaning": "Store Staff",
            "primary": false
          },
          {
            "meaning": "Store Employee",
            "primary": false
          },
          {
            "meaning": "Shop Employee",
            "primary": false
          },
          {
            "meaning": "Clerk",
            "primary": false
          },
          {
            "meaning": "Salesperson",
            "primary": false
          },
          {
            "meaning": "Shop Assistant",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てんいん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          821,
          625
        ]
      }
    },
    {
      "id": 3341,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3341",
      "data_updated_at": "2017-09-22T00:32:48.711730Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:24.000000Z",
        "slug": "全員",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E5%93%A1",
        "characters": "全員",
        "meanings": [
          {
            "meaning": "All Members",
            "primary": true
          },
          {
            "meaning": "All Hands",
            "primary": false
          },
          {
            "meaning": "Everyone",
            "primary": false
          },
          {
            "meaning": "Everybody",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぜんいん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          821,
          610
        ]
      }
    },
    {
      "id": 3342,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3342",
      "data_updated_at": "2017-09-22T00:32:49.344676Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:34.000000Z",
        "slug": "社員",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A4%BE%E5%93%A1",
        "characters": "社員",
        "meanings": [
          {
            "meaning": "Employee",
            "primary": true
          },
          {
            "meaning": "Staff",
            "primary": false
          },
          {
            "meaning": "Company Employee",
            "primary": false
          },
          {
            "meaning": "Company Staff",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しゃいん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          821,
          591
        ]
      }
    },
    {
      "id": 3343,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3343",
      "data_updated_at": "2017-09-22T00:32:50.294280Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:43.000000Z",
        "slug": "会社員",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BC%9A%E7%A4%BE%E5%93%A1",
        "characters": "会社員",
        "meanings": [
          {
            "meaning": "Company Employee",
            "primary": true
          },
          {
            "meaning": "Office Worker",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かいしゃいん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          821,
          591,
          566
        ]
      }
    },
    {
      "id": 3344,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3344",
      "data_updated_at": "2017-09-22T00:32:51.115397Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:05:51.000000Z",
        "slug": "広島",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BA%83%E5%B3%B6",
        "characters": "広島",
        "meanings": [
          {
            "meaning": "Hiroshima",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひろしま"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          822,
          523
        ]
      }
    },
    {
      "id": 3345,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3345",
      "data_updated_at": "2017-09-22T00:32:51.982954Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T20:06:11.000000Z",
        "slug": "祭",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A5%AD",
        "characters": "祭",
        "meanings": [
          {
            "meaning": "Festival",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まつり"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          823
        ]
      }
    },
    {
      "id": 3346,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3346",
      "data_updated_at": "2017-12-08T20:42:30.322893Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:22:44.000000Z",
        "slug": "文章",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%87%E7%AB%A0",
        "characters": "文章",
        "meanings": [
          {
            "meaning": "Writing",
            "primary": true
          },
          {
            "meaning": "Article",
            "primary": false
          },
          {
            "meaning": "Sentence",
            "primary": false
          },
          {
            "meaning": "Composition",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぶんしょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          824,
          475
        ]
      }
    },
    {
      "id": 3347,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3347",
      "data_updated_at": "2017-09-22T00:32:53.748356Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:22:53.000000Z",
        "slug": "第二章",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AC%AC%E4%BA%8C%E7%AB%A0",
        "characters": "第二章",
        "meanings": [
          {
            "meaning": "Chapter Two",
            "primary": true
          },
          {
            "meaning": "Second Chapter",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいにしょう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          825,
          824,
          441
        ]
      }
    },
    {
      "id": 3348,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3348",
      "data_updated_at": "2017-09-22T00:32:54.477195Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:23:02.000000Z",
        "slug": "第一",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AC%AC%E4%B8%80",
        "characters": "第一",
        "meanings": [
          {
            "meaning": "The First",
            "primary": true
          },
          {
            "meaning": "First",
            "primary": false
          },
          {
            "meaning": "Number One",
            "primary": false
          },
          {
            "meaning": "Best",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいいち"
          }
        ],
        "parts_of_speech": [
          "adverb",
          "noun"
        ],
        "component_subject_ids": [
          825,
          440
        ]
      }
    },
    {
      "id": 3349,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3349",
      "data_updated_at": "2017-09-22T00:32:55.892590Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:23:12.000000Z",
        "slug": "第一位",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AC%AC%E4%B8%80%E4%BD%8D",
        "characters": "第一位",
        "meanings": [
          {
            "meaning": "First Place",
            "primary": true
          },
          {
            "meaning": "First Rank",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいいちい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          825,
          782,
          440
        ]
      }
    },
    {
      "id": 3350,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3350",
      "data_updated_at": "2017-09-22T00:32:57.392645Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:23:34.000000Z",
        "slug": "東京都",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%B1%E4%BA%AC%E9%83%BD",
        "characters": "東京都",
        "meanings": [
          {
            "meaning": "Tokyo Metropolis",
            "primary": true
          },
          {
            "meaning": "Tokyo Metro",
            "primary": false
          },
          {
            "meaning": "Tokyo Metropolitan Area",
            "primary": false
          },
          {
            "meaning": "Tokyo Metro Area",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とうきょうと"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          826,
          627,
          620
        ]
      }
    },
    {
      "id": 3351,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3351",
      "data_updated_at": "2017-09-22T00:32:58.325221Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:23:46.000000Z",
        "slug": "京都",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%AC%E9%83%BD",
        "characters": "京都",
        "meanings": [
          {
            "meaning": "Kyoto",
            "primary": true
          },
          {
            "meaning": "Kyouto",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きょうと"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          826,
          620
        ]
      }
    },
    {
      "id": 3352,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3352",
      "data_updated_at": "2017-09-22T00:32:59.122867Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:24:08.000000Z",
        "slug": "動く",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8B%95%E3%81%8F",
        "characters": "動く",
        "meanings": [
          {
            "meaning": "To Move",
            "primary": true
          },
          {
            "meaning": "To Operate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うごく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          827
        ]
      }
    },
    {
      "id": 3353,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3353",
      "data_updated_at": "2017-09-22T00:32:59.825390Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:24:16.000000Z",
        "slug": "動物",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8B%95%E7%89%A9",
        "characters": "動物",
        "meanings": [
          {
            "meaning": "Animal",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どうぶつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          827,
          718
        ]
      }
    },
    {
      "id": 3354,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3354",
      "data_updated_at": "2017-09-22T00:33:01.481436Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:24:23.000000Z",
        "slug": "運動",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%81%8B%E5%8B%95",
        "characters": "運動",
        "meanings": [
          {
            "meaning": "Exercise",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "うんどう"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          827,
          752
        ]
      }
    },
    {
      "id": 3355,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3355",
      "data_updated_at": "2017-09-22T00:33:02.546591Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:24:36.000000Z",
        "slug": "商売",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%95%86%E5%A3%B2",
        "characters": "商売",
        "meanings": [
          {
            "meaning": "Business",
            "primary": true
          },
          {
            "meaning": "Commerce",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうばい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          828,
          587
        ]
      }
    },
    {
      "id": 3356,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3356",
      "data_updated_at": "2017-09-22T00:33:03.321303Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:24:44.000000Z",
        "slug": "商人",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%95%86%E4%BA%BA",
        "characters": "商人",
        "meanings": [
          {
            "meaning": "Merchant",
            "primary": true
          },
          {
            "meaning": "Trader",
            "primary": false
          },
          {
            "meaning": "Shopkeeper",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうにん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          828,
          444
        ]
      }
    },
    {
      "id": 3357,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3357",
      "data_updated_at": "2017-12-15T20:28:29.362553Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:24:52.000000Z",
        "slug": "悪い",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%82%AA%E3%81%84",
        "characters": "悪い",
        "meanings": [
          {
            "meaning": "Bad",
            "primary": true
          },
          {
            "meaning": "Poor",
            "primary": false
          },
          {
            "meaning": "Wrong",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "わるい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          829
        ]
      }
    },
    {
      "id": 3358,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3358",
      "data_updated_at": "2017-09-22T00:33:05.029322Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:25:02.000000Z",
        "slug": "悪人",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%82%AA%E4%BA%BA",
        "characters": "悪人",
        "meanings": [
          {
            "meaning": "Bad Person",
            "primary": true
          },
          {
            "meaning": "Villain",
            "primary": false
          },
          {
            "meaning": "Evildoer",
            "primary": false
          },
          {
            "meaning": "Bad Guy",
            "primary": false
          },
          {
            "meaning": "Wicked Person",
            "primary": false
          },
          {
            "meaning": "Evil Person",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あくにん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          829,
          444
        ]
      }
    },
    {
      "id": 3359,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3359",
      "data_updated_at": "2017-09-22T00:33:06.029264Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:25:18.000000Z",
        "slug": "悪女",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%82%AA%E5%A5%B3",
        "characters": "悪女",
        "meanings": [
          {
            "meaning": "Evil Woman",
            "primary": true
          },
          {
            "meaning": "Wicked Woman",
            "primary": false
          },
          {
            "meaning": "Bad Woman",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あくじょ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          829,
          454
        ]
      }
    },
    {
      "id": 3360,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3360",
      "data_updated_at": "2017-09-22T00:33:06.908232Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:25:31.000000Z",
        "slug": "最悪",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E6%82%AA",
        "characters": "最悪",
        "meanings": [
          {
            "meaning": "The Worst",
            "primary": true
          },
          {
            "meaning": "Worst",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいあく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          829,
          774
        ]
      }
    },
    {
      "id": 3361,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3361",
      "data_updated_at": "2017-09-22T00:33:07.661444Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:25:47.000000Z",
        "slug": "家族",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%B6%E6%97%8F",
        "characters": "家族",
        "meanings": [
          {
            "meaning": "Family",
            "primary": true
          },
          {
            "meaning": "Immediate Family",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かぞく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          830,
          660
        ]
      }
    },
    {
      "id": 3362,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3362",
      "data_updated_at": "2017-09-22T00:33:08.496365Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:25:54.000000Z",
        "slug": "民族",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%91%E6%97%8F",
        "characters": "民族",
        "meanings": [
          {
            "meaning": "Ethnic Group",
            "primary": true
          },
          {
            "meaning": "Ethnicity",
            "primary": false
          },
          {
            "meaning": "Race",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みんぞく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          830,
          650
        ]
      }
    },
    {
      "id": 3363,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3363",
      "data_updated_at": "2017-09-22T00:33:09.433194Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:01.000000Z",
        "slug": "血族",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A1%80%E6%97%8F",
        "characters": "血族",
        "meanings": [
          {
            "meaning": "Blood Relative",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けつぞく"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          830,
          619
        ]
      }
    },
    {
      "id": 3364,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3364",
      "data_updated_at": "2017-09-22T00:33:10.525160Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:08.000000Z",
        "slug": "深い",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B7%B1%E3%81%84",
        "characters": "深い",
        "meanings": [
          {
            "meaning": "Deep",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふかい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          831
        ]
      }
    },
    {
      "id": 3365,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3365",
      "data_updated_at": "2017-09-22T00:33:11.301280Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:16.000000Z",
        "slug": "深夜",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B7%B1%E5%A4%9C",
        "characters": "深夜",
        "meanings": [
          {
            "meaning": "Middle Of The Night",
            "primary": true
          },
          {
            "meaning": "Late At Night",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しんや"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          831,
          622
        ]
      }
    },
    {
      "id": 3366,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3366",
      "data_updated_at": "2017-09-22T00:33:12.853420Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:23.000000Z",
        "slug": "水深",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%B4%E6%B7%B1",
        "characters": "水深",
        "meanings": [
          {
            "meaning": "Water Depth",
            "primary": true
          },
          {
            "meaning": "Depth Of Water",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "すいしん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          831,
          479
        ]
      }
    },
    {
      "id": 3367,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3367",
      "data_updated_at": "2017-09-22T00:33:13.674920Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:30.000000Z",
        "slug": "最深",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%80%E6%B7%B1",
        "characters": "最深",
        "meanings": [
          {
            "meaning": "Deepest",
            "primary": true
          },
          {
            "meaning": "The Deepest",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さいしん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective",
          "no_adjective"
        ],
        "component_subject_ids": [
          831,
          774
        ]
      }
    },
    {
      "id": 3368,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3368",
      "data_updated_at": "2017-09-22T00:33:14.654637Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:37.000000Z",
        "slug": "球",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%90%83",
        "characters": "球",
        "meanings": [
          {
            "meaning": "Sphere",
            "primary": true
          },
          {
            "meaning": "Ball",
            "primary": false
          },
          {
            "meaning": "Sports Ball",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たま"
          },
          {
            "primary": false,
            "reading": "きゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          832
        ]
      }
    },
    {
      "id": 3369,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3369",
      "data_updated_at": "2017-09-22T00:33:15.597460Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:44.000000Z",
        "slug": "野球",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%87%8E%E7%90%83",
        "characters": "野球",
        "meanings": [
          {
            "meaning": "Baseball",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やきゅう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          848,
          832
        ]
      }
    },
    {
      "id": 3370,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3370",
      "data_updated_at": "2017-09-22T00:33:17.088364Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:26:51.000000Z",
        "slug": "童話",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%AB%A5%E8%A9%B1",
        "characters": "童話",
        "meanings": [
          {
            "meaning": "Children's Story",
            "primary": true
          },
          {
            "meaning": "Fairy Tale",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "どうわ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          833,
          705
        ]
      }
    },
    {
      "id": 3371,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3371",
      "data_updated_at": "2017-09-22T00:33:17.852976Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:27:23.000000Z",
        "slug": "太陽",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%AA%E9%99%BD",
        "characters": "太陽",
        "meanings": [
          {
            "meaning": "Sun",
            "primary": true
          },
          {
            "meaning": "The Sun",
            "primary": false
          },
          {
            "meaning": "Sol",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たいよう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          834,
          505
        ]
      }
    },
    {
      "id": 3372,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3372",
      "data_updated_at": "2017-09-22T00:33:18.586355Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:27:31.000000Z",
        "slug": "一階",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%80%E9%9A%8E",
        "characters": "一階",
        "meanings": [
          {
            "meaning": "First Floor",
            "primary": true
          },
          {
            "meaning": "Floor One",
            "primary": false
          },
          {
            "meaning": "First Story",
            "primary": false
          },
          {
            "meaning": "Ground Floor",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いっかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          835,
          440
        ]
      }
    },
    {
      "id": 3373,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3373",
      "data_updated_at": "2017-09-22T00:33:19.392352Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:27:38.000000Z",
        "slug": "二階",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%8C%E9%9A%8E",
        "characters": "二階",
        "meanings": [
          {
            "meaning": "Second Floor",
            "primary": true
          },
          {
            "meaning": "Floor Two",
            "primary": false
          },
          {
            "meaning": "Second Story",
            "primary": false
          },
          {
            "meaning": "Second Storey",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          835,
          441
        ]
      }
    },
    {
      "id": 3374,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3374",
      "data_updated_at": "2017-09-22T00:33:23.625204Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:27:45.000000Z",
        "slug": "四十二階",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9B%E5%8D%81%E4%BA%8C%E9%9A%8E",
        "characters": "四十二階",
        "meanings": [
          {
            "meaning": "Forty Second Floor",
            "primary": true
          },
          {
            "meaning": "Floor Forty Two",
            "primary": false
          },
          {
            "meaning": "42nd Floor",
            "primary": false
          },
          {
            "meaning": "Floor 42",
            "primary": false
          },
          {
            "meaning": "Forty Second Story",
            "primary": false
          },
          {
            "meaning": "Forty Second Storey",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よんじゅうにかい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          835,
          485,
          448,
          441
        ]
      }
    },
    {
      "id": 3375,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3375",
      "data_updated_at": "2017-09-22T00:33:25.433082Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:27:52.000000Z",
        "slug": "寒い",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AF%92%E3%81%84",
        "characters": "寒い",
        "meanings": [
          {
            "meaning": "Cold",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さむい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          836
        ]
      }
    },
    {
      "id": 3376,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3376",
      "data_updated_at": "2017-09-22T00:33:26.425184Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:27:59.000000Z",
        "slug": "悲しい",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%82%B2%E3%81%97%E3%81%84",
        "characters": "悲しい",
        "meanings": [
          {
            "meaning": "Sad",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かなしい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          837
        ]
      }
    },
    {
      "id": 3377,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3377",
      "data_updated_at": "2017-09-22T00:33:27.240046Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:15.000000Z",
        "slug": "暑い",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9A%91%E3%81%84",
        "characters": "暑い",
        "meanings": [
          {
            "meaning": "Hot Weather",
            "primary": true
          },
          {
            "meaning": "Hot",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あつい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          838
        ]
      }
    },
    {
      "id": 3378,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3378",
      "data_updated_at": "2017-09-22T00:33:27.962646Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:23.000000Z",
        "slug": "期待",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9C%9F%E5%BE%85",
        "characters": "期待",
        "meanings": [
          {
            "meaning": "Expectation",
            "primary": true
          },
          {
            "meaning": "Expect",
            "primary": false
          },
          {
            "meaning": "Anticipate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きたい"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          839,
          726
        ]
      }
    },
    {
      "id": 3379,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3379",
      "data_updated_at": "2017-09-22T00:33:28.715809Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:30.000000Z",
        "slug": "学期",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%A6%E6%9C%9F",
        "characters": "学期",
        "meanings": [
          {
            "meaning": "School Term",
            "primary": true
          },
          {
            "meaning": "Semester",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がっき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          839,
          599
        ]
      }
    },
    {
      "id": 3380,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3380",
      "data_updated_at": "2017-09-22T00:33:29.438458Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:37.000000Z",
        "slug": "時期",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%99%82%E6%9C%9F",
        "characters": "時期",
        "meanings": [
          {
            "meaning": "Time",
            "primary": true
          },
          {
            "meaning": "Season",
            "primary": false
          },
          {
            "meaning": "Period",
            "primary": false
          },
          {
            "meaning": "Time Period",
            "primary": false
          },
          {
            "meaning": "Period Of Time",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じき"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          839,
          662
        ]
      }
    },
    {
      "id": 3381,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3381",
      "data_updated_at": "2017-09-22T00:33:30.335902Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:43.000000Z",
        "slug": "植物",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%A4%8D%E7%89%A9",
        "characters": "植物",
        "meanings": [
          {
            "meaning": "Plant",
            "primary": true
          },
          {
            "meaning": "Vegetation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょくぶつ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          840,
          718
        ]
      }
    },
    {
      "id": 3382,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3382",
      "data_updated_at": "2017-09-22T00:33:31.097277Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:50.000000Z",
        "slug": "歯医者",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%AF%E5%8C%BB%E8%80%85",
        "characters": "歯医者",
        "meanings": [
          {
            "meaning": "Dentist",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はいしゃ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          841,
          690,
          681
        ]
      }
    },
    {
      "id": 3383,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3383",
      "data_updated_at": "2017-09-22T00:33:31.955976Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:28:58.000000Z",
        "slug": "虫歯",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%99%AB%E6%AD%AF",
        "characters": "虫歯",
        "meanings": [
          {
            "meaning": "Cavity",
            "primary": true
          },
          {
            "meaning": "Decayed Tooth",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むしば"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          841,
          553
        ]
      }
    },
    {
      "id": 3384,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3384",
      "data_updated_at": "2017-09-22T00:33:33.041350Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:29:12.000000Z",
        "slug": "歯",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AD%AF",
        "characters": "歯",
        "meanings": [
          {
            "meaning": "Tooth",
            "primary": true
          },
          {
            "meaning": "Teeth",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "は"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          841
        ]
      }
    },
    {
      "id": 3385,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3385",
      "data_updated_at": "2017-09-22T00:33:33.807862Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:29:23.000000Z",
        "slug": "温かい",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B8%A9%E3%81%8B%E3%81%84",
        "characters": "温かい",
        "meanings": [
          {
            "meaning": "Warm",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あたたかい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          842
        ]
      }
    },
    {
      "id": 3386,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3386",
      "data_updated_at": "2017-09-22T00:33:34.765973Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:29:37.000000Z",
        "slug": "温泉",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B8%A9%E6%B3%89",
        "characters": "温泉",
        "meanings": [
          {
            "meaning": "Hot Springs",
            "primary": true
          },
          {
            "meaning": "Onsen",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おんせん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          849,
          842
        ]
      }
    },
    {
      "id": 3387,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3387",
      "data_updated_at": "2017-09-22T00:33:35.464825Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:29:46.000000Z",
        "slug": "温度",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B8%A9%E5%BA%A6",
        "characters": "温度",
        "meanings": [
          {
            "meaning": "Temperature",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おんど"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          842,
          725
        ]
      }
    },
    {
      "id": 3388,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3388",
      "data_updated_at": "2017-09-22T00:33:36.744532Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:29:55.000000Z",
        "slug": "空港",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%A9%BA%E6%B8%AF",
        "characters": "空港",
        "meanings": [
          {
            "meaning": "Airport",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "くうこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          843,
          601
        ]
      }
    },
    {
      "id": 3389,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3389",
      "data_updated_at": "2017-09-22T00:33:37.661562Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:30:02.000000Z",
        "slug": "茶の湯",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%8C%B6%E3%81%AE%E6%B9%AF",
        "characters": "茶の湯",
        "meanings": [
          {
            "meaning": "Tea Ceremony",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゃのゆ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          844,
          643
        ]
      }
    },
    {
      "id": 3390,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3390",
      "data_updated_at": "2017-09-22T00:33:38.328870Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:30:11.000000Z",
        "slug": "湯気",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B9%AF%E6%B0%97",
        "characters": "湯気",
        "meanings": [
          {
            "meaning": "Steam",
            "primary": true
          },
          {
            "meaning": "Vapor",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ゆげ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          844,
          548
        ]
      }
    },
    {
      "id": 3391,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3391",
      "data_updated_at": "2017-09-22T00:33:39.133132Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:30:19.000000Z",
        "slug": "登る",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BB%E3%82%8B",
        "characters": "登る",
        "meanings": [
          {
            "meaning": "To Climb",
            "primary": true
          },
          {
            "meaning": "To Ascend",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "のぼる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          845
        ]
      }
    },
    {
      "id": 3392,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3392",
      "data_updated_at": "2017-09-22T00:33:39.848144Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:30:27.000000Z",
        "slug": "登山",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%99%BB%E5%B1%B1",
        "characters": "登山",
        "meanings": [
          {
            "meaning": "Mountain Climbing",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とざん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          845,
          455
        ]
      }
    },
    {
      "id": 3393,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3393",
      "data_updated_at": "2017-09-22T00:33:40.679338Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:30:46.000000Z",
        "slug": "着る",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9D%80%E3%82%8B",
        "characters": "着る",
        "meanings": [
          {
            "meaning": "To Wear",
            "primary": true
          },
          {
            "meaning": "To Put On",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          846
        ]
      }
    },
    {
      "id": 3394,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3394",
      "data_updated_at": "2017-09-22T00:33:41.649322Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:00.000000Z",
        "slug": "着く",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9D%80%E3%81%8F",
        "characters": "着く",
        "meanings": [
          {
            "meaning": "To Arrive",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つく"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          846
        ]
      }
    },
    {
      "id": 3395,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3395",
      "data_updated_at": "2017-12-29T19:05:19.948590Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:07.000000Z",
        "slug": "着物",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9D%80%E7%89%A9",
        "characters": "着物",
        "meanings": [
          {
            "meaning": "Kimono",
            "primary": true
          },
          {
            "meaning": "Clothes",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きもの"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          846,
          718
        ]
      }
    },
    {
      "id": 3396,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3396",
      "data_updated_at": "2017-09-22T00:33:43.195665Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:14.000000Z",
        "slug": "下着",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B%E7%9D%80",
        "characters": "下着",
        "meanings": [
          {
            "meaning": "Underwear",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "したぎ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          846,
          451
        ]
      }
    },
    {
      "id": 3397,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3397",
      "data_updated_at": "2017-09-22T00:33:43.865383Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:25.000000Z",
        "slug": "水着",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B0%B4%E7%9D%80",
        "characters": "水着",
        "meanings": [
          {
            "meaning": "Swim Suit",
            "primary": true
          },
          {
            "meaning": "Swimsuit",
            "primary": false
          },
          {
            "meaning": "Bathing Suit",
            "primary": false
          },
          {
            "meaning": "Swimwear",
            "primary": false
          },
          {
            "meaning": "Swimming Suit",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みずぎ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          846,
          479
        ]
      }
    },
    {
      "id": 3398,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3398",
      "data_updated_at": "2017-09-22T00:33:44.628180Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:32.000000Z",
        "slug": "短い",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9F%AD%E3%81%84",
        "characters": "短い",
        "meanings": [
          {
            "meaning": "Short",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みじかい"
          }
        ],
        "parts_of_speech": [
          "i_adjective"
        ],
        "component_subject_ids": [
          847
        ]
      }
    },
    {
      "id": 3399,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3399",
      "data_updated_at": "2017-09-22T00:33:45.593776Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:39.000000Z",
        "slug": "短刀",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9F%AD%E5%88%80",
        "characters": "短刀",
        "meanings": [
          {
            "meaning": "Short Sword",
            "primary": true
          },
          {
            "meaning": "Dagger",
            "primary": false
          },
          {
            "meaning": "Tanto",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たんとう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          847,
          458
        ]
      }
    },
    {
      "id": 3400,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3400",
      "data_updated_at": "2017-09-22T00:33:46.715199Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:31:46.000000Z",
        "slug": "短期",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%9F%AD%E6%9C%9F",
        "characters": "短期",
        "meanings": [
          {
            "meaning": "Short Period",
            "primary": true
          },
          {
            "meaning": "Short Term",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たんき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          847,
          839
        ]
      }
    },
    {
      "id": 3401,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3401",
      "data_updated_at": "2017-09-22T00:33:47.583975Z",
      "data": {
        "level": 12,
        "created_at": "2012-05-01T22:32:11.000000Z",
        "slug": "泉",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%B3%89",
        "characters": "泉",
        "meanings": [
          {
            "meaning": "Spring",
            "primary": true
          },
          {
            "meaning": "Fountain",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いずみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          849
        ]
      }
    },
    {
      "id": 3402,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3402",
      "data_updated_at": "2017-10-18T23:11:27.973821Z",
      "data": {
        "level": 1,
        "created_at": "2012-05-18T17:08:14.642177Z",
        "slug": "人口",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA%E5%8F%A3",
        "characters": "人口",
        "meanings": [
          {
            "meaning": "Population",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じんこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          452,
          444
        ]
      }
    },
    {
      "id": 3403,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3403",
      "data_updated_at": "2017-10-18T23:11:43.436659Z",
      "data": {
        "level": 4,
        "created_at": "2012-06-07T17:42:45.858150Z",
        "slug": "子牛",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AD%90%E7%89%9B",
        "characters": "子牛",
        "meanings": [
          {
            "meaning": "Calf",
            "primary": true
          },
          {
            "meaning": "Baby Cow",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こうし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          511,
          462
        ]
      }
    },
    {
      "id": 3404,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3404",
      "data_updated_at": "2017-10-18T23:11:40.466778Z",
      "data": {
        "level": 4,
        "created_at": "2012-06-07T18:56:00.716579Z",
        "slug": "切手",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%88%87%E6%89%8B",
        "characters": "切手",
        "meanings": [
          {
            "meaning": "Postage Stamp",
            "primary": true
          },
          {
            "meaning": "Stamp",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "きって"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          502,
          474
        ]
      }
    },
    {
      "id": 3405,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3405",
      "data_updated_at": "2017-10-18T23:11:41.602193Z",
      "data": {
        "level": 4,
        "created_at": "2012-06-07T19:48:09.904257Z",
        "slug": "引き分け",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BC%95%E3%81%8D%E5%88%86%E3%81%91",
        "characters": "引き分け",
        "meanings": [
          {
            "meaning": "Tie",
            "primary": true
          },
          {
            "meaning": "Draw",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひきわけ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          507,
          501
        ]
      }
    },
    {
      "id": 3406,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3406",
      "data_updated_at": "2017-10-18T23:11:54.316780Z",
      "data": {
        "level": 6,
        "created_at": "2012-06-07T20:05:26.576576Z",
        "slug": "亡くなる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%A1%E3%81%8F%E3%81%AA%E3%82%8B",
        "characters": "亡くなる",
        "meanings": [
          {
            "meaning": "To Pass Away",
            "primary": true
          },
          {
            "meaning": "To Become Deceased",
            "primary": false
          },
          {
            "meaning": "To Die",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なくなる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          851
        ]
      }
    },
    {
      "id": 3407,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3407",
      "data_updated_at": "2017-10-18T23:11:36.119947Z",
      "data": {
        "level": 3,
        "created_at": "2012-06-12T00:16:35.883506Z",
        "slug": "人生",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA%E7%94%9F",
        "characters": "人生",
        "meanings": [
          {
            "meaning": "One's Life",
            "primary": true
          },
          {
            "meaning": "Human Life",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "じんせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          444
        ]
      }
    },
    {
      "id": 3408,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3408",
      "data_updated_at": "2017-10-18T23:11:50.891778Z",
      "data": {
        "level": 5,
        "created_at": "2012-06-20T23:02:36.134422Z",
        "slug": "男の子",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%B7%E3%81%AE%E5%AD%90",
        "characters": "男の子",
        "meanings": [
          {
            "meaning": "Boy",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おとこのこ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          555,
          462
        ]
      }
    },
    {
      "id": 3409,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3409",
      "data_updated_at": "2017-10-18T23:11:47.267197Z",
      "data": {
        "level": 5,
        "created_at": "2012-06-20T23:21:27.328573Z",
        "slug": "毛虫",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%9B%E8%99%AB",
        "characters": "毛虫",
        "meanings": [
          {
            "meaning": "Caterpillar",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けむし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          553,
          513
        ]
      }
    },
    {
      "id": 3410,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3410",
      "data_updated_at": "2017-10-18T23:11:47.384112Z",
      "data": {
        "level": 5,
        "created_at": "2012-06-20T23:32:58.027559Z",
        "slug": "下町",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8B%E7%94%BA",
        "characters": "下町",
        "meanings": [
          {
            "meaning": "Downtown",
            "primary": true
          },
          {
            "meaning": "Backstreets",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "したまち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          556,
          451
        ]
      }
    },
    {
      "id": 3411,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3411",
      "data_updated_at": "2017-10-18T23:11:54.095253Z",
      "data": {
        "level": 6,
        "created_at": "2012-06-27T17:49:04.704750Z",
        "slug": "小文字",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%8F%E6%96%87%E5%AD%97",
        "characters": "小文字",
        "meanings": [
          {
            "meaning": "Lowercase Letter",
            "primary": true
          },
          {
            "meaning": "Lowercase Character",
            "primary": false
          },
          {
            "meaning": "Lowercase",
            "primary": false
          },
          {
            "meaning": "Lowercase Letters",
            "primary": false
          },
          {
            "meaning": "Lowercase Characters",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "こもじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          545,
          475,
          463
        ]
      }
    },
    {
      "id": 3412,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3412",
      "data_updated_at": "2017-10-18T23:11:46.037641Z",
      "data": {
        "level": 5,
        "created_at": "2012-06-27T18:12:51.686462Z",
        "slug": "男の人",
        "document_url": "https://www.wanikani.com/vocabulary/%E7%94%B7%E3%81%AE%E4%BA%BA",
        "characters": "男の人",
        "meanings": [
          {
            "meaning": "Man",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おとこのひと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          555,
          444
        ]
      }
    },
    {
      "id": 3413,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3413",
      "data_updated_at": "2017-10-18T23:11:40.135873Z",
      "data": {
        "level": 4,
        "created_at": "2012-06-27T18:43:49.387833Z",
        "slug": "年",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4",
        "characters": "年",
        "meanings": [
          {
            "meaning": "Year",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とし"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546
        ]
      }
    },
    {
      "id": 3414,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3414",
      "data_updated_at": "2017-10-18T23:11:46.244922Z",
      "data": {
        "level": 5,
        "created_at": "2012-06-27T23:47:46.003359Z",
        "slug": "今まで",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E3%81%BE%E3%81%A7",
        "characters": "今まで",
        "meanings": [
          {
            "meaning": "Until Now",
            "primary": true
          },
          {
            "meaning": "Up To Now",
            "primary": false
          },
          {
            "meaning": "So Far",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いままで"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          497
        ]
      }
    },
    {
      "id": 3415,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3415",
      "data_updated_at": "2017-10-18T23:11:54.162140Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-03T00:09:52.537047Z",
        "slug": "冬休み",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%86%AC%E4%BC%91%E3%81%BF",
        "characters": "冬休み",
        "meanings": [
          {
            "meaning": "Winter Holiday",
            "primary": true
          },
          {
            "meaning": "Winter Break",
            "primary": false
          },
          {
            "meaning": "Winter Vacation",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふゆやすみ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          542,
          516
        ]
      }
    },
    {
      "id": 3416,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3416",
      "data_updated_at": "2017-10-18T23:11:46.200010Z",
      "data": {
        "level": 5,
        "created_at": "2012-07-03T00:11:30.730580Z",
        "slug": "毛糸",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AF%9B%E7%B3%B8",
        "characters": "毛糸",
        "meanings": [
          {
            "meaning": "Wool Yarn",
            "primary": true
          },
          {
            "meaning": "Yarn",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "けいと"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          551,
          513
        ]
      }
    },
    {
      "id": 3417,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3417",
      "data_updated_at": "2017-10-18T23:11:48.428005Z",
      "data": {
        "level": 5,
        "created_at": "2012-07-06T22:34:23.516694Z",
        "slug": "今すぐ",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E3%81%99%E3%81%90",
        "characters": "今すぐ",
        "meanings": [
          {
            "meaning": "At Once",
            "primary": true
          },
          {
            "meaning": "Right Now",
            "primary": false
          },
          {
            "meaning": "Immediately",
            "primary": false
          },
          {
            "meaning": "Right Away",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いますぐ"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          497
        ]
      }
    },
    {
      "id": 3418,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3418",
      "data_updated_at": "2017-10-27T22:01:38.085422Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-08T23:25:47.572700Z",
        "slug": "出来る",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E6%9D%A5%E3%82%8B",
        "characters": "出来る",
        "meanings": [
          {
            "meaning": "To Be Able To Do",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "できる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          590,
          483
        ]
      }
    },
    {
      "id": 3419,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3419",
      "data_updated_at": "2017-10-18T23:11:56.742984Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-08T23:30:43.776458Z",
        "slug": "方言",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%96%B9%E8%A8%80",
        "characters": "方言",
        "meanings": [
          {
            "meaning": "Dialect",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ほうげん"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          593,
          510
        ]
      }
    },
    {
      "id": 3420,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3420",
      "data_updated_at": "2017-10-18T23:12:04.927912Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-08T23:31:25.830068Z",
        "slug": "人形",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%BA%E5%BD%A2",
        "characters": "人形",
        "meanings": [
          {
            "meaning": "Doll",
            "primary": true
          },
          {
            "meaning": "Puppet",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "にんぎょう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          589,
          444
        ]
      }
    },
    {
      "id": 3421,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3421",
      "data_updated_at": "2017-10-18T23:12:22.085966Z",
      "data": {
        "level": 10,
        "created_at": "2012-07-09T20:06:33.053438Z",
        "slug": "外来語",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%96%E6%9D%A5%E8%AA%9E",
        "characters": "外来語",
        "meanings": [
          {
            "meaning": "Foreign Word",
            "primary": true
          },
          {
            "meaning": "Borrowed Word",
            "primary": false
          },
          {
            "meaning": "Loanword",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "がいらいご"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          764,
          590,
          521
        ]
      }
    },
    {
      "id": 3422,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3422",
      "data_updated_at": "2017-10-18T23:12:00.493580Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-09T20:11:05.653256Z",
        "slug": "手作り",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%89%8B%E4%BD%9C%E3%82%8A",
        "characters": "手作り",
        "meanings": [
          {
            "meaning": "Handmade",
            "primary": true
          },
          {
            "meaning": "Homemade",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "てづくり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          584,
          474
        ]
      }
    },
    {
      "id": 3423,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3423",
      "data_updated_at": "2017-10-18T23:11:53.831396Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-19T23:17:13.081833Z",
        "slug": "東京",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%B1%E4%BA%AC",
        "characters": "東京",
        "meanings": [
          {
            "meaning": "Tokyo",
            "primary": true
          },
          {
            "meaning": "Toukyou",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "とうきょう"
          }
        ],
        "parts_of_speech": [
          "proper_noun"
        ],
        "component_subject_ids": [
          627,
          620
        ]
      }
    },
    {
      "id": 3424,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3424",
      "data_updated_at": "2017-10-18T23:12:11.799250Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-19T23:29:10.175434Z",
        "slug": "合う",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%88%E3%81%86",
        "characters": "合う",
        "meanings": [
          {
            "meaning": "To Suit",
            "primary": true
          },
          {
            "meaning": "To Come Together",
            "primary": false
          },
          {
            "meaning": "To Meet",
            "primary": false
          },
          {
            "meaning": "To Match",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あう"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          852
        ]
      }
    },
    {
      "id": 3425,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3425",
      "data_updated_at": "2017-10-18T23:12:00.387177Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-19T23:31:36.202955Z",
        "slug": "風",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%A2%A8",
        "characters": "風",
        "meanings": [
          {
            "meaning": "Wind",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かぜ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          853
        ]
      }
    },
    {
      "id": 3426,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3426",
      "data_updated_at": "2017-10-18T23:12:19.717922Z",
      "data": {
        "level": 10,
        "created_at": "2012-07-22T19:00:22.041038Z",
        "slug": "当て字",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%93%E3%81%A6%E5%AD%97",
        "characters": "当て字",
        "meanings": [
          {
            "meaning": "Phonetic Kanji",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あてじ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          571,
          545
        ]
      }
    },
    {
      "id": 3427,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3427",
      "data_updated_at": "2017-10-18T23:12:08.961635Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T21:08:05.890399Z",
        "slug": "次々",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%AC%A1%E3%80%85",
        "characters": "次々",
        "meanings": [
          {
            "meaning": "One By One",
            "primary": true
          },
          {
            "meaning": "In Succession",
            "primary": false
          },
          {
            "meaning": "One After The Other",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つぎつぎ"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          856,
          616
        ]
      }
    },
    {
      "id": 3428,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3428",
      "data_updated_at": "2017-10-18T23:12:13.698570Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T21:08:49.710244Z",
        "slug": "向こう",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%91%E3%81%93%E3%81%86",
        "characters": "向こう",
        "meanings": [
          {
            "meaning": "Over There",
            "primary": true
          },
          {
            "meaning": "Opposite Side",
            "primary": false
          },
          {
            "meaning": "Other Side",
            "primary": false
          },
          {
            "meaning": "Far Away",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "むこう"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          611
        ]
      }
    },
    {
      "id": 3429,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3429",
      "data_updated_at": "2017-10-18T23:12:10.289665Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T22:47:19.906966Z",
        "slug": "曲がる",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9B%B2%E3%81%8C%E3%82%8B",
        "characters": "曲がる",
        "meanings": [
          {
            "meaning": "To Be Bent",
            "primary": true
          },
          {
            "meaning": "To Bend",
            "primary": false
          },
          {
            "meaning": "To Curve",
            "primary": false
          },
          {
            "meaning": "To Turn",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まがる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          614
        ]
      }
    },
    {
      "id": 3430,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3430",
      "data_updated_at": "2017-10-18T23:12:09.718165Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T22:49:32.068875Z",
        "slug": "南米",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%97%E7%B1%B3",
        "characters": "南米",
        "meanings": [
          {
            "meaning": "South America",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なんべい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          634,
          574
        ]
      }
    },
    {
      "id": 3431,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3431",
      "data_updated_at": "2017-10-18T23:12:06.206105Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T22:55:22.081016Z",
        "slug": "全米",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E7%B1%B3",
        "characters": "全米",
        "meanings": [
          {
            "meaning": "All America",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ぜんべい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          610,
          574
        ]
      }
    },
    {
      "id": 3432,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3432",
      "data_updated_at": "2017-10-18T23:12:09.816558Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T23:08:52.577003Z",
        "slug": "南口",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8D%97%E5%8F%A3",
        "characters": "南口",
        "meanings": [
          {
            "meaning": "South Exit",
            "primary": true
          },
          {
            "meaning": "South Entrance",
            "primary": false
          },
          {
            "meaning": "Southern Exit",
            "primary": false
          },
          {
            "meaning": "Southern Entrance",
            "primary": false
          },
          {
            "meaning": "South Gate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みなみぐち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          634,
          452
        ]
      }
    },
    {
      "id": 3433,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3433",
      "data_updated_at": "2017-10-18T23:12:12.182850Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T23:19:48.660181Z",
        "slug": "思い出",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%80%9D%E3%81%84%E5%87%BA",
        "characters": "思い出",
        "meanings": [
          {
            "meaning": "A Memory",
            "primary": true
          },
          {
            "meaning": "Memories",
            "primary": false
          },
          {
            "meaning": "Memory",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おもいで"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          637,
          483
        ]
      }
    },
    {
      "id": 3434,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3434",
      "data_updated_at": "2017-10-18T23:12:11.526955Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-22T23:28:45.447595Z",
        "slug": "近づく",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%91%E3%81%A5%E3%81%8F",
        "characters": "近づく",
        "meanings": [
          {
            "meaning": "To Get Close",
            "primary": true
          },
          {
            "meaning": "To Approach",
            "primary": false
          },
          {
            "meaning": "To Draw Near",
            "primary": false
          },
          {
            "meaning": "To Near",
            "primary": false
          },
          {
            "meaning": "To Bring Near",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちかづく"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          596
        ]
      }
    },
    {
      "id": 3435,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3435",
      "data_updated_at": "2017-10-18T23:12:12.323853Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-23T00:57:04.234518Z",
        "slug": "思い出す",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%80%9D%E3%81%84%E5%87%BA%E3%81%99",
        "characters": "思い出す",
        "meanings": [
          {
            "meaning": "To Remember",
            "primary": true
          },
          {
            "meaning": "To Recall",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おもいだす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          637,
          483
        ]
      }
    },
    {
      "id": 3436,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3436",
      "data_updated_at": "2017-10-18T23:12:02.318491Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-23T01:22:52.470974Z",
        "slug": "大学生",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%A4%A7%E5%AD%A6%E7%94%9F",
        "characters": "大学生",
        "meanings": [
          {
            "meaning": "University Student",
            "primary": true
          },
          {
            "meaning": "College Student",
            "primary": false
          },
          {
            "meaning": "Uni Student",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "だいがくせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          599,
          453
        ]
      }
    },
    {
      "id": 3437,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3437",
      "data_updated_at": "2018-03-08T18:21:56.217480Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-23T01:27:46.444639Z",
        "slug": "言い方",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A8%80%E3%81%84%E6%96%B9",
        "characters": "言い方",
        "meanings": [
          {
            "meaning": "Way Of Saying",
            "primary": true
          },
          {
            "meaning": "Way Of Talking",
            "primary": false
          },
          {
            "meaning": "Speaking Style",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "いいかた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          593,
          510
        ]
      }
    },
    {
      "id": 3438,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3438",
      "data_updated_at": "2017-10-18T23:12:02.887714Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:15:05.918095Z",
        "slug": "先回り",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%88%E5%9B%9E%E3%82%8A",
        "characters": "先回り",
        "meanings": [
          {
            "meaning": "Anticipation",
            "primary": true
          },
          {
            "meaning": "Anticipate",
            "primary": false
          },
          {
            "meaning": "Going Ahead",
            "primary": false
          },
          {
            "meaning": "Arriving Ahead",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "さきまわり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          569,
          543
        ]
      }
    },
    {
      "id": 3439,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3439",
      "data_updated_at": "2017-10-18T23:11:54.856072Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:16:41.789243Z",
        "slug": "早口",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%97%A9%E5%8F%A3",
        "characters": "早口",
        "meanings": [
          {
            "meaning": "Fast Talker",
            "primary": true
          },
          {
            "meaning": "Fast Talking",
            "primary": false
          },
          {
            "meaning": "Fast Speaker",
            "primary": false
          },
          {
            "meaning": "Fast Speaking",
            "primary": false
          },
          {
            "meaning": "Quick Talker",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はやくち"
          },
          {
            "primary": false,
            "reading": "はやぐち"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          547,
          452
        ]
      }
    },
    {
      "id": 3440,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3440",
      "data_updated_at": "2017-10-18T23:11:57.739386Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:19:18.206757Z",
        "slug": "足りない",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B6%B3%E3%82%8A%E3%81%AA%E3%81%84",
        "characters": "足りない",
        "meanings": [
          {
            "meaning": "Not Enough",
            "primary": true
          },
          {
            "meaning": "To Not Be Sufficient",
            "primary": false
          },
          {
            "meaning": "To Not Be Enough",
            "primary": false
          },
          {
            "meaning": "Insufficient",
            "primary": false
          },
          {
            "meaning": "Not Sufficient",
            "primary": false
          },
          {
            "meaning": "To Be Insufficient",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "たりない"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb"
        ],
        "component_subject_ids": [
          561
        ]
      }
    },
    {
      "id": 3441,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3441",
      "data_updated_at": "2017-10-18T23:11:57.824081Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:19:40.217136Z",
        "slug": "年上",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4%E4%B8%8A",
        "characters": "年上",
        "meanings": [
          {
            "meaning": "Older",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "としうえ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          546,
          450
        ]
      }
    },
    {
      "id": 3442,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3442",
      "data_updated_at": "2017-10-18T23:11:58.346775Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:20:07.899795Z",
        "slug": "世の中",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%96%E3%81%AE%E4%B8%AD",
        "characters": "世の中",
        "meanings": [
          {
            "meaning": "Society",
            "primary": true
          },
          {
            "meaning": "The World",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "よのなか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          527,
          469
        ]
      }
    },
    {
      "id": 3443,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3443",
      "data_updated_at": "2017-10-18T23:11:54.728143Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:20:38.656823Z",
        "slug": "代わり",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A3%E3%82%8F%E3%82%8A",
        "characters": "代わり",
        "meanings": [
          {
            "meaning": "Substitute",
            "primary": true
          },
          {
            "meaning": "Replacement",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かわり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          530
        ]
      }
    },
    {
      "id": 3444,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3444",
      "data_updated_at": "2017-10-18T23:11:58.505114Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:21:05.737573Z",
        "slug": "今年",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%8A%E5%B9%B4",
        "characters": "今年",
        "meanings": [
          {
            "meaning": "This Year",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ことし"
          },
          {
            "primary": false,
            "reading": "こんねん"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          546,
          497
        ]
      }
    },
    {
      "id": 3445,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3445",
      "data_updated_at": "2017-10-18T23:11:54.590381Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:21:29.761490Z",
        "slug": "代える",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BB%A3%E3%81%88%E3%82%8B",
        "characters": "代える",
        "meanings": [
          {
            "meaning": "To Replace",
            "primary": true
          },
          {
            "meaning": "To Substitute",
            "primary": false
          },
          {
            "meaning": "To Exchange",
            "primary": false
          },
          {
            "meaning": "To Replace Something",
            "primary": false
          },
          {
            "meaning": "To Substitute Something",
            "primary": false
          },
          {
            "meaning": "To Exchange Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "かえる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          530
        ]
      }
    },
    {
      "id": 3446,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3446",
      "data_updated_at": "2017-10-18T23:11:54.803637Z",
      "data": {
        "level": 6,
        "created_at": "2012-07-24T23:22:57.090999Z",
        "slug": "年下",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B9%B4%E4%B8%8B",
        "characters": "年下",
        "meanings": [
          {
            "meaning": "Younger",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "としした"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          546,
          451
        ]
      }
    },
    {
      "id": 3447,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3447",
      "data_updated_at": "2017-10-18T23:12:00.096304Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:24:51.077814Z",
        "slug": "近々",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%BF%91%E3%80%85",
        "characters": "近々",
        "meanings": [
          {
            "meaning": "Before Long",
            "primary": true
          },
          {
            "meaning": "Soon",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちかぢか"
          },
          {
            "primary": false,
            "reading": "きんきん"
          },
          {
            "primary": false,
            "reading": "ちかじか"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          856,
          596
        ]
      }
    },
    {
      "id": 3448,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3448",
      "data_updated_at": "2017-10-18T23:12:01.991119Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:25:19.201772Z",
        "slug": "青空",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%9D%92%E7%A9%BA",
        "characters": "青空",
        "meanings": [
          {
            "meaning": "Blue Sky",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あおぞら"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          604,
          601
        ]
      }
    },
    {
      "id": 3449,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3449",
      "data_updated_at": "2017-10-18T23:12:00.231112Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:25:40.008317Z",
        "slug": "小学生",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%B0%8F%E5%AD%A6%E7%94%9F",
        "characters": "小学生",
        "meanings": [
          {
            "meaning": "Elementary School Student",
            "primary": true
          },
          {
            "meaning": "Primary School Student",
            "primary": false
          },
          {
            "meaning": "Elementary Schooler",
            "primary": false
          },
          {
            "meaning": "Primary Schooler",
            "primary": false
          },
          {
            "meaning": "Grade Schooler",
            "primary": false
          },
          {
            "meaning": "Grade School Student",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "しょうがくせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          599,
          463
        ]
      }
    },
    {
      "id": 3450,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3450",
      "data_updated_at": "2017-10-18T23:12:02.489525Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:26:03.333679Z",
        "slug": "作り方",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BD%9C%E3%82%8A%E6%96%B9",
        "characters": "作り方",
        "meanings": [
          {
            "meaning": "How To Make",
            "primary": true
          },
          {
            "meaning": "Way To Make",
            "primary": false
          },
          {
            "meaning": "Way Of Making",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "つくりかた"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          584,
          510
        ]
      }
    },
    {
      "id": 3451,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3451",
      "data_updated_at": "2017-10-18T23:12:03.013439Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:26:26.639092Z",
        "slug": "中学生",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%AD%E5%AD%A6%E7%94%9F",
        "characters": "中学生",
        "meanings": [
          {
            "meaning": "Middle School Student",
            "primary": true
          },
          {
            "meaning": "Junior High School Student",
            "primary": false
          },
          {
            "meaning": "Middle Schooler",
            "primary": false
          },
          {
            "meaning": "Junior High Schooler",
            "primary": false
          },
          {
            "meaning": "Junior High Student",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ちゅうがくせい"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          850,
          599,
          469
        ]
      }
    },
    {
      "id": 3452,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3452",
      "data_updated_at": "2017-10-18T23:12:02.831593Z",
      "data": {
        "level": 7,
        "created_at": "2012-07-24T23:26:50.098005Z",
        "slug": "不人気",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%B8%8D%E4%BA%BA%E6%B0%97",
        "characters": "不人気",
        "meanings": [
          {
            "meaning": "Unpopular",
            "primary": true
          },
          {
            "meaning": "Not Popular",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ふにんき"
          }
        ],
        "parts_of_speech": [
          "noun",
          "na_adjective"
        ],
        "component_subject_ids": [
          563,
          548,
          444
        ]
      }
    },
    {
      "id": 3453,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3453",
      "data_updated_at": "2017-10-18T23:12:07.008578Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:32:40.913072Z",
        "slug": "見直す",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%A6%8B%E7%9B%B4%E3%81%99",
        "characters": "見直す",
        "meanings": [
          {
            "meaning": "To Reevaluate",
            "primary": true
          },
          {
            "meaning": "To Look Again",
            "primary": false
          },
          {
            "meaning": "To Reassess",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "みなおす"
          }
        ],
        "parts_of_speech": [
          "godan_verb"
        ],
        "component_subject_ids": [
          630,
          558
        ]
      }
    },
    {
      "id": 3454,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3454",
      "data_updated_at": "2017-10-18T23:12:11.341423Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:33:16.531982Z",
        "slug": "全く",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%85%A8%E3%81%8F",
        "characters": "全く",
        "meanings": [
          {
            "meaning": "Completely",
            "primary": true
          },
          {
            "meaning": "Entirely",
            "primary": false
          },
          {
            "meaning": "Truly",
            "primary": false
          },
          {
            "meaning": "Really",
            "primary": false
          },
          {
            "meaning": "Wholly",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まったく"
          }
        ],
        "parts_of_speech": [
          "adverb"
        ],
        "component_subject_ids": [
          610
        ]
      }
    },
    {
      "id": 3455,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3455",
      "data_updated_at": "2017-10-18T23:12:12.652633Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:33:33.694190Z",
        "slug": "長さ",
        "document_url": "https://www.wanikani.com/vocabulary/%E9%95%B7%E3%81%95",
        "characters": "長さ",
        "meanings": [
          {
            "meaning": "Length",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ながさ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          632
        ]
      }
    },
    {
      "id": 3456,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3456",
      "data_updated_at": "2017-10-18T23:12:12.098006Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:33:51.052660Z",
        "slug": "安売り",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%AE%89%E5%A3%B2%E3%82%8A",
        "characters": "安売り",
        "meanings": [
          {
            "meaning": "Sell Cheaply",
            "primary": true
          },
          {
            "meaning": "Discount",
            "primary": false
          },
          {
            "meaning": "Bargain Sale",
            "primary": false
          },
          {
            "meaning": "Sale",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "やすうり"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          612,
          587
        ]
      }
    },
    {
      "id": 3457,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3457",
      "data_updated_at": "2017-10-18T23:12:11.387260Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:34:11.203050Z",
        "slug": "この前",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%93%E3%81%AE%E5%89%8D",
        "characters": "この前",
        "meanings": [
          {
            "meaning": "Last Time",
            "primary": true
          },
          {
            "meaning": "Recently",
            "primary": false
          },
          {
            "meaning": "Lately",
            "primary": false
          },
          {
            "meaning": "Previous",
            "primary": false
          },
          {
            "meaning": "Previously",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "このまえ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "no_adjective"
        ],
        "component_subject_ids": [
          633
        ]
      }
    },
    {
      "id": 3458,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3458",
      "data_updated_at": "2017-10-18T23:12:07.813478Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:34:32.614143Z",
        "slug": "東口",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9D%B1%E5%8F%A3",
        "characters": "東口",
        "meanings": [
          {
            "meaning": "East Exit",
            "primary": true
          },
          {
            "meaning": "East Entrance",
            "primary": false
          },
          {
            "meaning": "Eastern Exit",
            "primary": false
          },
          {
            "meaning": "Eastern Entrance",
            "primary": false
          },
          {
            "meaning": "East Gate",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ひがしぐち"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          627,
          452
        ]
      }
    },
    {
      "id": 3459,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3459",
      "data_updated_at": "2017-10-18T23:12:08.766148Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:34:53.000571Z",
        "slug": "お知らせ",
        "document_url": "https://www.wanikani.com/vocabulary/%E3%81%8A%E7%9F%A5%E3%82%89%E3%81%9B",
        "characters": "お知らせ",
        "meanings": [
          {
            "meaning": "Notice",
            "primary": true
          },
          {
            "meaning": "Notification",
            "primary": false
          },
          {
            "meaning": "Flier",
            "primary": false
          },
          {
            "meaning": "Pamphlet",
            "primary": false
          },
          {
            "meaning": "Handbill",
            "primary": false
          },
          {
            "meaning": "Flyer",
            "primary": false
          },
          {
            "meaning": "Leaflet",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "おしらせ"
          }
        ],
        "parts_of_speech": [
          "noun",
          "suru_verb"
        ],
        "component_subject_ids": [
          631
        ]
      }
    },
    {
      "id": 3460,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3460",
      "data_updated_at": "2017-10-18T23:12:11.485945Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:35:12.498831Z",
        "slug": "名前",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%90%8D%E5%89%8D",
        "characters": "名前",
        "meanings": [
          {
            "meaning": "Name",
            "primary": true
          },
          {
            "meaning": "First Name",
            "primary": false
          },
          {
            "meaning": "Full Name",
            "primary": false
          },
          {
            "meaning": "Given Name",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "なまえ"
          }
        ],
        "parts_of_speech": [
          "noun"
        ],
        "component_subject_ids": [
          633,
          544
        ]
      }
    },
    {
      "id": 3461,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3461",
      "data_updated_at": "2017-10-18T23:12:11.437313Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:35:35.579542Z",
        "slug": "出来上がる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%87%BA%E6%9D%A5%E4%B8%8A%E3%81%8C%E3%82%8B",
        "characters": "出来上がる",
        "meanings": [
          {
            "meaning": "To Be Finished",
            "primary": true
          },
          {
            "meaning": "To Be Completed",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "できあがる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          590,
          483,
          450
        ]
      }
    },
    {
      "id": 3462,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3462",
      "data_updated_at": "2017-11-16T19:59:24.933828Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:35:50.066898Z",
        "slug": "曲げる",
        "document_url": "https://www.wanikani.com/vocabulary/%E6%9B%B2%E3%81%92%E3%82%8B",
        "characters": "曲げる",
        "meanings": [
          {
            "meaning": "To Bend",
            "primary": true
          },
          {
            "meaning": "To Bend Something",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まげる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          614
        ]
      }
    },
    {
      "id": 3463,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3463",
      "data_updated_at": "2017-10-18T23:12:10.364770Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:36:07.002761Z",
        "slug": "交じる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%A4%E3%81%98%E3%82%8B",
        "characters": "交じる",
        "meanings": [
          {
            "meaning": "To Be Mixed",
            "primary": true
          },
          {
            "meaning": "To Be Blended With",
            "primary": false
          },
          {
            "meaning": "To Join",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まじる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          565
        ]
      }
    },
    {
      "id": 3464,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3464",
      "data_updated_at": "2017-10-18T23:12:06.679402Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:36:21.840949Z",
        "slug": "走り回る",
        "document_url": "https://www.wanikani.com/vocabulary/%E8%B5%B0%E3%82%8A%E5%9B%9E%E3%82%8B",
        "characters": "走り回る",
        "meanings": [
          {
            "meaning": "To Run Around",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "はしりまわる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          595,
          569
        ]
      }
    },
    {
      "id": 3465,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3465",
      "data_updated_at": "2017-10-18T23:12:13.448067Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:36:48.027600Z",
        "slug": "当てる",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%BD%93%E3%81%A6%E3%82%8B",
        "characters": "当てる",
        "meanings": [
          {
            "meaning": "To Guess",
            "primary": true
          },
          {
            "meaning": "To Guess Something",
            "primary": false
          },
          {
            "meaning": "To Hit",
            "primary": false
          },
          {
            "meaning": "To Apply",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "あてる"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          571
        ]
      }
    },
    {
      "id": 3466,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3466",
      "data_updated_at": "2017-10-18T23:12:11.294155Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:37:05.169377Z",
        "slug": "交わる",
        "document_url": "https://www.wanikani.com/vocabulary/%E4%BA%A4%E3%82%8F%E3%82%8B",
        "characters": "交わる",
        "meanings": [
          {
            "meaning": "To Intersect",
            "primary": true
          },
          {
            "meaning": "To Cross",
            "primary": false
          },
          {
            "meaning": "To Mingle",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まじわる"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          565
        ]
      }
    },
    {
      "id": 3467,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3467",
      "data_updated_at": "2017-10-18T23:12:11.128129Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:37:20.842824Z",
        "slug": "化ける",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%8C%96%E3%81%91%E3%82%8B",
        "characters": "化ける",
        "meanings": [
          {
            "meaning": "To Transform",
            "primary": true
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "ばける"
          }
        ],
        "parts_of_speech": [
          "intransitive_verb",
          "ichidan_verb"
        ],
        "component_subject_ids": [
          607
        ]
      }
    },
    {
      "id": 3468,
      "object": "vocabulary",
      "url": "https://www.wanikani.com/api/v2/subjects/3468",
      "data_updated_at": "2017-10-18T23:12:12.737038Z",
      "data": {
        "level": 8,
        "created_at": "2012-07-24T23:37:40.112537Z",
        "slug": "回す",
        "document_url": "https://www.wanikani.com/vocabulary/%E5%9B%9E%E3%81%99",
        "characters": "回す",
        "meanings": [
          {
            "meaning": "To Turn",
            "primary": true
          },
          {
            "meaning": "To Rotate",
            "primary": false
          },
          {
            "meaning": "To Turn Something",
            "primary": false
          },
          {
            "meaning": "To Rotate Something",
            "primary": false
          },
          {
            "meaning": "To Spin",
            "primary": false
          }
        ],
        "readings": [
          {
            "primary": true,
            "reading": "まわす"
          }
        ],
        "parts_of_speech": [
          "transitive_verb",
          "godan_verb"
        ],
        "component_subject_ids": [
          569
        ]
      }
    }
  ]
}
