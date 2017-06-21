/**
 * Created by EX-pengzhiliang001 on 2017-06-20.
 */
(function(undefined,factory){
	if(typeof module === 'object' && typeof module.exports == 'object'){
		module.exports = factory();
	}else{
		window.Aj = factory();
	}
})(undefined, function() {
	/*TODO::ajax*/
	function ajax(options) {
		this.options = options || {};
		this._xhr = null;
		this._params = this.formatParams(options.data);

		this.createXhr()
	}

	ajax.prototype.createXhr = function () {
		if (window.XMLHttpRequest) {
			this._xhr = new XMLHttpRequest()
		} else {
			this._xhr = new ActiveXObject('Microsoft.XMLHTTP')
		}
		this.acceptXhr()
	}

	ajax.prototype.acceptXhr = function () {
		var _self = this;
		this._xhr.onreadystatechange = function () {
			if (_self._xhr.readyState == 4) {
				var status = _self._xhr.status
				if (status >= 200 && status < 300) {
					_self.options.success && _self.options.success(_self._xhr.responseText, _self._xhr.responseXML)
				} else {
					_self.options.fail && _self.options.fail(status, _self._xhr.statusText)
				}
			}
		}

		setTimeout(function() {
			_self.abort();
		}, 10000)

		this.handleType()
	}

	ajax.prototype.handleType = function () {
		var type = this.options.type.toUpperCase()
		if (type== 'GET') {
			this._xhr.open('GET',this.options.url + '?' + this._params, true);
			this._xhr.send(null);
		} else if(type == 'POST'){
			this._xhr.open('POST', this.options.url, true);
			this._xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
			this._xhr.send(this._params)
		}
	}

	ajax.prototype.formatParams = function (data) {
		var param = []
		for (var k in data) {
			param.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]))
		}
		param.push(('v=' + Math.random()).replace('.', ''))
		return param.join('&')
	}

	/*中断请求*/
	ajax.prototype.abort = function() {
		if(this._xhr.readyState != 4){
			this._xhr.close();
		}
	}


	/* TODO::JSONP*/
	function ajaxJsonp(options) {
		this.options = options || {};
		this._callback  = null;
		this._params = null;
		this._os = null;
		this._$head = null;
		this.createScript()
	}

	ajaxJsonp.prototype.createScript = function () {
		this._callback = ('jsonp_' + Math.random()).replace('.', '');
		this._$head = document.getElementsByTagName('head')[0];
		this.options.data['callback'] = this._callback;
		this._params = this.formatParams(this.options.data);
		this._os = document.createElement('script');
		this._$head.appendChild(this._os);
		this.createCallback();
	}

	ajaxJsonp.prototype.createCallback = function () {
		var _self = this
		window[_self._callback] = function (json) {
			_self._$head.removeChild(_self._os);
			clearTimeout(_self._os.timer);
			window[_self._callback] = null
			_self.options.success && _self.options.success(json)
		}
		this.send();
	}

	ajaxJsonp.prototype.send = function () {
		this._os.src = this.options.url + '?' + this._params;
		/*超时处理*/
		this._os.timer = setTimeout(function () {
			window[_self._callback] = null;
			_self._$head.removeChild(_self._os);
			_self.options.fail && _self.options.fail()
		}, 10000)
	}

	ajaxJsonp.prototype.formatParams = function (data) {
		var arr = [];
		for (var name in data) {
			arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
		}
		return arr.join('&');
	}

	return {
		ajax: function(options) {
			return new ajax(options)
		},
		jsonp: function(options) {
			return new ajaxJsonp(options)
		},
	}

})

