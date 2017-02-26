/**
*	alchemy
*	Author: Logan Wilkerson
*
*	The base alchemy library
*
*              /\__
*     .--.----'  - \
*    /    )    \___/
*   |  '------.___)
*    `---------`
*/

var alchemy = alchemy || {};
(function(A){	

	//----------------
	// Function Tools
	//----------------

	// Generates a partial function
	A.partial = function(){
		var fn = arguments[0];
		var args = Array.prototype.slice.call(arguments, 1);
		return function(){
			alchemy.log('test');
			var arg = 0;
			for (var i = 0; i < args.length && arg < arguments.length; i++){
				if (typeof args[i] == 'undefined'){
					args[i] = arguments[arg++];
				}
			}
			return fn.apply(this, args);
		};
	};

	// Generates a debounced function, delay defaults to 250ms
	// From http://remysharp.com/2010/07/21/throttling-function-calls/
	A.debounce = function(fn, delay, scope){
		delay = typeof delay != 'undefined' ? delay : 250;
		var timer = null;
		return function(){
			var context = scope || this;
			var args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function(){
				fn.apply(context, args);
			}, delay);
		};
	};

	// Generates a throttled function, threshhold defaults to 250ms
	// From http://remysharp.com/2010/07/21/throttling-function-calls/
	A.throttle = function(fn, threshhold, scope){
		threshhold = typeof threshhold != 'undefined' ? threshhold : 250;
		var last;
		var deferTimer;
		return function(){
			var context = scope || this;
			var now = A.now();
			var args = arguments;
			if(last && now < last + threshhold){
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function(){
					last = now;
					fn.apply(context, args);
				}, threshhold);
			}
			else{
				last = now;
				fn.apply(context, args);
			}
		};
	};
	
	/*
	*	noop
	*	A function that does nothing
	*/
	A.noop = function(){};

	//--------------
	// Object Tools
	//--------------
	/*
	* extend
	* Extends an object with the values from a second
	* object. If object 1 and 2 share a key name the 
	* value from object 2 will be used.
	*
	* @param {Object} Object to extend
	* @param {Object} Object to extend with
	* @return {Object} Third object that is the first object extended by the second.
	*/
	A.extend = function(obj1, obj2) {
		var obj3 = {};
		for(var key in obj1) {
			obj3[key] = obj1[key];
		}
		for(var key in obj2) {
			obj3[key] = obj2[key];
		}
		return obj3;
	};

	// Speed up calls to hasOwnProperty
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	A.isEmpty = function(obj) {

		// null and undefined are empty
		if(obj == null ||typeof obj === 'undefined') return true;

		// If the obj has a length property hope that it is correct
		if(obj.length > 0) return false;
		if(obj.length === 0) return true;

		//Make sure it's not a number
		if(Number(obj) === obj) return false

		//Will fail for IE < 9
		for (var key in obj) {
			if (hasOwnProperty.call(obj, key)) return false;
		}
		return true;
	};

	//------------------
	// Collection Tools
	//------------------

	//for each function, based on underscore function
	A.each = A.forEach = function(obj, iteratee) {
		var i, length;
		if(A.isArrayLike(obj)) {
			for(i = 0, length = obj.length; i < length; i++) {
				if(iteratee(obj[i], i, obj) === false) {
					break;
				}
			}
		}
		else if(A.isObject(obj)) {
			var keys = Object.keys(obj);
			for(i = 0, length = keys.length; i < length; i++) {
				iteratee(obj[keys[i]], keys[i], obj);
			}
		}
		return obj;
	};

	//------------------
	// Comparator Tools
	//------------------
	/*
	*	isArray
	*	Returns true if the argument is an array
	*	
	*	@param {Object} object to test
	*	@return {boolean} true if object is an Array, false otherwise
	*/
	A.isArray = function(obj){
		return Object.prototype.toString.call(obj) === '[object Array]';
	};
	
	/*
	*	isFunction
	*	Returns true if the argument is a function
	*
	*	@param {Object} object to test
	*	@return {boolean} true if object is a Function, false otherwise
	*/
	A.isFunction = function(obj){
		return Object.prototype.toString.call(obj) === '[object Function]';
	};

	A.isString = function(obj){
		return Object.prototype.toString.call(obj) === '[object String]';
	};

	A.isBoolean = function(val){
		return Object.prototype.toString.call(val) === '[object Boolean]';
	};

	//Based on underscore implementation
	A.isObject = function(obj) {
		return alchemy.isFunction(obj) || typeof obj === 'object' && !!obj;
	};

	//http://stackoverflow.com/questions/3885817/how-to-check-that-a-number-is-float-or-integer
	A.isInt = function(n) {
		if(A.isEmpty(n)) return false;
		return Number(n) === n && n % 1 === 0;
	};


	//Based on underscore implementation
	//Determines if object is 'array like' used for iteration
	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1
	A.isArrayLike = function(collection) {
		var length = getLength(collection);
    	return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	};
	
	//-----------------
	// Debugging Tools
	//-----------------	
	
	/*
	*	log
	*	A cross-browser logging function. Typically it just uses
	*	console.log. In out-of-date opera browsers it uses opera.postError.
	*
	*	@param {Objects} Accepts one or more objects or strings to log.
	*/
	A.log = function(){
		try{
			console.log.apply(console, arguments);
		}
		catch(e){
			try{
				opera.postError.apply(opera, arguments);
			}
			catch(e){
				alert(Array.prototype.join.call(arguments, " "));
			}
		}
	};
	
	/*
	*	err
	*	A cross-browser logging function. Typically it uses
	*	console.log, but can fall back on proprietary methods
	*	or alert as needed
	*	
	*	@param {Objects} Accepts one or more objects to go out as the error message
	*/
	A.err = function(){
		try{
			console.error.apply(console, arguments);
		}
		catch(e){
			try{
				opera.postError.apply(opera, arguments);
			}
			catch(e){
				alert(Array.prototype.join.call(arguments, " "));
			}
			
		}
	};
	
	/*
	*	assert
	*	Logs a message/error depending on the boolean value passed to assert,
	*	throws an error if value is false and halt is true
	*
	*	@param {Boolean} The assertion value
	*	@param {String} Description of the assertion
	*	@param {Boolean} Whether to halt if assertion fails
	*	@throw {Error} Thrown is value is false and halt is true
	*/
	A.assert = function(value, desc, halt){
		
		if(value)
			A.log('PASS: ', desc);
		else{
			A.err('FAIL: ', desc);
			if(halt)
				throw new Error('Halting due to failed assertion.');
		}
	};
	
	/*
	*	time
	*	Time the execution of a function a given number of times
	*	@param {Function} The function to execute
	*	@param {Number} The number of times execute the function
	*	@params The parameters to pass into the function
	*	@return {Number} The Time in milliseconds the function took to execute
	*/
	A.time = function(){
		var f = arguments[0];
		var iter = arguments[1];
		var start = A.now();
		for (var i = 0; i < iter; i++){
			f.apply(window,(Array.prototype.slice.call(arguments, 2)));
		}
		var end = A.now();
		return end-start;
	};
	
	/*
	*	now
	*	@return the current time in milliseconds
	*/
	A.now = function(){
		return new Date().getTime();
	};

	/*
	*	checkDependencies
	*	Check to see if any of the values of the dependencies object are undefined or null
	*	@param {Object} Map of dependency names to their objects. The dependency names will be used for the error message;
	*/
	A.checkDependencies = function(dependencies) {
		var foundUndefined = false;
		var errorMessage = 'This function requires the following dependencies: ';
		for (var key in dependencies) {
			var dependency = dependencies[key];
			if(typeof dependency === 'undefined' || dependency == null) {
				if(foundUndefined) {
					errorMessage += ', ';
				}
				errorMessage 	+= key;
				foundUndefined 	= true;
			}
		}
		return {'missingDependencies':foundUndefined,'errorMessage':errorMessage};
	};


	//-------------
	// Event Tools
	//-------------
	A.getCords = function(evt){
		if(typeof TouchEvent == 'undefined' || !(evt.originalEvent instanceof TouchEvent)){
			return {x: evt.pageX, y: evt.pageY};
		}
		if(typeof TouchEvent != 'undefined' && evt.originalEvent instanceof TouchEvent){
			if(evt.originalEvent.touches.length > 0){
				return {
					x: evt.originalEvent.touches[0].pageX,
					y: evt.originalEvent.touches[0].pageY
				};
			}
			else if(evt.originalEvent.changedTouches.length > 0){
				return {
					x: evt.originalEvent.changedTouches[0].pageX,
					y: evt.originalEvent.changedTouches[0].pageY

				};
			}
		}
	};

	//------------
	// Misc Tools
	//------------

	A.randomColor = function(){
		var hue = '#' + String(Math.floor(Math.random() * 256)) + String(Math.floor(Math.random() * 256)) + String(Math.floor(Math.random() * 256));
		return hue;
	};

	//From detectmobilebrowsers.com
	//INC one big long regex
	A.mobileCheck = function() {
		var check = false;
		(function(a){
			if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
				check = true;
		})(navigator.userAgent||navigator.vendor||window.opera);
		return check; 
	};

	// Convert numbers to words
	// copyright 25th July 2006, by Stephen Chapman http://javascript.about.com
	// permission to use this Javascript on your web page is granted
	// provided that all of the code (including this copyright notice) is
	// used exactly as shown (you can change the numbering system if you wish)
	// American Numbering System
	var th = ['', 'thousand', 'million', 'billion', 'trillion'];
	// uncomment this line for English Number System
	// var th = ['','thousand','million', 'milliard','billion'];

	var dg = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
	var tn = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
	var tw = ['twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

	A.numberToWord = function(s) {
	    s = s.toString();
	    s = s.replace(/[\, ]/g, '');
	    if (s != parseFloat(s)) return 'not a number';
	    var x = s.indexOf('.');
	    if (x == -1) x = s.length;
	    if (x > 15) return 'too big';
	    var n = s.split('');
	    var str = '';
	    var sk = 0;
	    for (var i = 0; i < x; i++) {
	        if ((x - i) % 3 == 2) {
	            if (n[i] == '1') {
	                str += tn[Number(n[i + 1])] + ' ';
	                i++;
	                sk = 1;
	            } else if (n[i] != 0) {
	                str += tw[n[i] - 2] + ' ';
	                sk = 1;
	            }
	        } else if (n[i] != 0) {
	            str += dg[n[i]] + ' ';
	            if ((x - i) % 3 == 0) str += 'hundred ';
	            sk = 1;
	        }
	        if ((x - i) % 3 == 1) {
	            if (sk) str += th[(x - i - 1) / 3] + ' ';
	            sk = 0;
	        }
	    }
	    if (x != s.length) {
	        var y = s.length;
	        str += 'point ';
	        for (var i = x + 1; i < y; i++) str += dg[n[i]] + ' ';
	    }
	    return str.replace(/\s+/g, ' ').trim();
	};

	//http://stackoverflow.com/questions/1740700/how-to-get-hex-color-value-rather-than-rgb-value
	A.rgb2hex = function(rgb) {
		if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;

		rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

		function hex(x) {
			return ("0" + parseInt(x).toString(16)).slice(-2);
		}

		return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
	};

	//http://stackoverflow.com/questions/280634/endswith-in-javascript
	A.stringEndsWith = function(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	};

	//http://stackoverflow.com/questions/11582512/how-to-get-url-parameters-with-javascript/11582513#11582513
	A.getURLParameter = function(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
	};

	/*
	* redirect
	* Redirects the browser location
	*
	* @param {String} The URL to redirect the browser too.
	*/
	A.redirect = function(url) {
		window.location.href = url;
	};

	//-------------------
	// Internal Function
	//-------------------

	//based on underscore implementation
	//Returns a function designed to get a specific property
	//void 0 = void(0) = undefined. void(0) is a safe way to get undefined
	var property = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key];
		};
	};

	var getLength = property('length');

}(alchemy));