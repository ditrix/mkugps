var app = {
	ver: '2.3',
	bPrintVer:  false,
	MESS: {},
	
	refreshBlock: function(mRefreshElement, sHtml) {
		jQuery(mRefreshElement).html(sHtml);
	},
	
	goTo: function(sUrl) {
		if(sUrl && typeof(sUrl) == 'string') {
			window.location.href = sUrl;
		}
		return false;
	},
	
	strpos: function(sHaystack, sNeedle, iOffset) {
		var iPos = sHaystack.indexOf(sNeedle, iOffset);
		return iPos >= 0 ? iPos : false;  
	},

	backToListPage: function(sCheckUrl) {
		var bReturn = true;
		var sRef = document.referrer.toString();
		if(sCheckUrl) {
			if(app.strpos(sRef, sCheckUrl) !== false) {
				bReturn = false;
				app.goTo(sRef);
			}
		}
		return bReturn;
	},

	printPage: function() {
		window.print();
		return false;
	},

	getCookie: function (name) {
		var cookie = " " + document.cookie;
		var search = " " + name + "=";
		var setStr = null;
		var offset = 0;
		var end = 0;
		if(cookie.length > 0) {
			offset = cookie.indexOf(search);
			if(offset != -1) {
				offset += search.length;
				end = cookie.indexOf(";", offset)
				if(end == -1) {
					end = cookie.length;
				}
				setStr = unescape(cookie.substring(offset, end));
			}
		}
		return(setStr);
	},

	setCookie: function(sName, sValue, sExpires, sPath, sDomain, bSecure) {
		var sCookie = '';
		sCookie += sName + '=' + escape(sValue);
		sCookie += sExpires ? '; expires=' + sExpires : '';
		sCookie += sPath ? '; path=' + sPath : '';
		sCookie += sDomain ? '; domain=' + sDomain : '';
		sCookie += bSecure ? '; secure' : '';
		document.cookie = sCookie;
	},

	showPopup: function(mUrl, iWidth, iHeight) {
		if(mUrl) {
			var sUrl = false;
			if(typeof(mUrl) == 'object' && mUrl.href) {
				sUrl = mUrl.href;
			} else if(typeof(mUrl) == 'string') {
				sUrl = mUrl;
			}
			if(sUrl) {
				try {
					var rPattern = /\?/;
					var sSign = rPattern.test(sUrl) ? '&' : '?';
					sUrl += sSign + 'popup=Y';
					iWidth = iWidth ? parseInt(iWidth) : 645;
					iHeight = iHeight ? parseInt(iHeight) : 680;
					var iLeft = Math.floor((screen.width - iWidth)/2-5);
					var iTop = Math.floor((screen.height - iHeight)/2-14);

					var sFeatures = 'directories=no,location=no,toolbar=no,status=no,resizeble=yes,scrollbars=yes,dependent=yes,titlebar=no,left='+iLeft+',top='+iTop;
					sFeatures += iWidth > 0 ? (',width=' + iWidth) : '';
					sFeatures += iHeight > 0 ? (',height=' + iHeight) : '';
					var rsWin = window.open(sUrl, null, sFeatures);
					rsWin.focus();
				} catch(e) {}
			}
		}
		return false;
	},
	
	changePageCount: function(iCount, sUrl) {
		var sExpires = false;
		app.setCookie('BX_PAGE_COUNT', iCount, sExpires, '/');
		app.goTo(sUrl);
	},

	CAjaxIndicator: function(sAjaxContId, sShowMode) {
		var _this = this;
		this.sShowMode = '';
		this.sAjaxContId = sAjaxContId ? sAjaxContId : '#ajax-loading';
		this.bCanClose = false;
		this.bOnDocumentClickCloseEnabled = false;

		this.setShowingMode = function(sShowMode) {
			sShowMode = sShowMode ? sShowMode : 'center';
			switch(sShowMode) {
				case 'center':
				case 'cursor':
					this.sShowMode = sShowMode;
				break;
			}
		};
		this.setShowingMode(sShowMode);

		this.getShowingMode = function() {
			return _this.sShowMode;
		};
		
		this.getLoadingBox = function() {
			return jQuery(_this.sAjaxContId);
		};

		this._setLoadingBoxPos = function(iTop, iLeft, sAddCss) {
			iTop = iTop ? iTop : 10;
			iLeft = iLeft ? iLeft : 20;
			var oCss = {
				top: iTop + 'px',
				left: iLeft + 'px'
			};
			var jqBox = _this.getLoadingBox();
			jqBox.css(oCss);
			if(sAddCss) {
				jqBox.addClass(sAddCss);
			}
		};

		this._reposByCursor = function(event) {
			event = event || window.event;		
			if(event) {
				var oCoords = _this.getMouseCoords(event);
				if(oCoords) {
					var iTop = oCoords.pageY;
					var iLeft = oCoords.pageX;
					var jqLoadingBox = _this.getLoadingBox();
					var iBoxWitdh = jqLoadingBox.outerWidth(true);
					var iBoxHeight = jqLoadingBox.outerHeight(true);
					if((iBoxWitdh + iLeft) > jQuery(document).width()) {
						iLeft -= iBoxWitdh;
					}
					if((iBoxHeight + iTop) > jQuery(document).height()) {
						iTop -= iBoxHeight;
					}
					_this._setLoadingBoxPos(iTop, iLeft, 'pos-by-cursor');
				}
			}
		};
	
		this._reposByCenter = function() {
			var iHeight = jQuery(window).height();
			var iWidth = jQuery(window).width();
			var iTop = jQuery(window).scrollTop() + parseInt(jQuery(window).height() / 2);
			var iLeft = jQuery(window).scrollLeft() + parseInt(jQuery(window).width() / 2);
			_this._setLoadingBoxPos(iTop, iLeft, 'pos-by-center');
		};

		this.reposLoadingBox = function(event) {
			switch(_this.getShowingMode()) {
				case 'cursor':
					_this._reposByCursor(event);
				break;

				case 'center':
					_this._reposByCenter();
				break;
			};
		};

		this._reposLoadingBoxDef = function() {
			switch(_this.getShowingMode()) {
				case 'center':
					_this._reposByCenter();
				break;
			};
		};
		
		this.showLoadingBox = function(iFadeIn) {
			iFadeIn = iFadeIn ? iFadeIn : 0;
			var jqBox = _this.getLoadingBox();
			_this._reposLoadingBoxDef();
			jqBox.fadeIn(iFadeIn, function(){
				_this._attachCloseOnDocumentClick();
			});
		};

		this.hideLoadingBox = function(iFadeOut) {
			iFadeOut = iFadeOut ? iFadeOut : 0;
			var jqBox = _this.getLoadingBox();
			jqBox.fadeOut(iFadeOut, function() {
				_this._detachCloseOnDocumentClick();
				jqBox.removeClass('pos-by-cursor pos-by-center');
				_this._setLoadingBoxPos();
			});
		};

		this.getMouseCoords = function(event) {
			var oReturn = {};
			if(event.pageX || event.pageY) {
				oReturn.pageX = event.pageX; 
				oReturn.pageY = event.pageY;
			} else {
				oReturn.pageX = (event.clientX + jQuery(window).scrollLeft());
				oReturn.pageY = (event.clientY + jQuery(window).scrollTop());
			}
			return oReturn;
		};
		
		this.addCloseButton = function(mElement) {
			if(mElement) {
				jQuery(document).ready(function(){
					jQuery(mElement).bind('click', _this.hideLoadingBox);
				});
			}
		};

		this.delCloseButton = function(mElement) {
			if(mElement) {
				jQuery(document).ready(function(){
					jQuery(mElement).unbind('click', _this.hideLoadingBox);
				});
			}
		};

		this._onDocumentClickHandler = function() {
			if(_this.bOnDocumentClickCloseEnabled) {
				if(_this.bCanClose) {
					jQuery(document).unbind('click', _this._onDocumentClickHandler);
					_this.hideLoadingBox();
					_this.bCanClose = false;
					return;
				}
				_this.bCanClose = true;
			}
		};

		this._attachCloseOnDocumentClick = function() {
			if(_this.bOnDocumentClickCloseEnabled) {
				_this.bCanClose = false;
				jQuery(document).bind('click', _this._onDocumentClickHandler);
			}
		};

		this._detachCloseOnDocumentClick = function() {
			if(_this.bOnDocumentClickCloseEnabled) {
				jQuery(document).unbind('click', _this._onDocumentClickHandler);
			}
		};

		this._loadingBoxClickHandler = function() {
			_this.bCanClose = false;
		};

		this.enableCloseOnDocumentClick = function() {
			_this.bOnDocumentClickCloseEnabled = true;
			jQuery(document).ready(function(){
				var jqLoadingBox = _this.getLoadingBox();
				jqLoadingBox.bind('click', _this._loadingBoxClickHandler); 
			});
		};

		this.disableCloseOnDocumentClick = function() {
			_this.bOnDocumentClickCloseEnabled = false;
			jQuery(document).ready(function(){
				var jqLoadingBox = _this.getLoadingBox();
				jqLoadingBox.unbind('click', _this._loadingBoxClickHandler); 
			});
			jQuery(document).unbind('click', _this._onDocumentClickHandler);
		};
	}
}

app.initHint = function() {
	var hintFieldFocusHandler = function(jqField, oHint) {
		jQuery(oHint).css('display', 'none');
	};
	var hintFieldBlurHandler = function(jqField, oHint) {
		var sVal = jqField.val();
		if(sVal.length == 0) {
			jQuery(oHint).css('display', 'block');
		}
	};
	jQuery('label.hint').each(function() {
		var sId = jQuery(this).attr('for');
		var _this = this;
		if(sId) {
			var jqField = jQuery('#'+sId);
			var oPosition = jqField.position();
			jQuery(this).css('top', oPosition.top);
			jQuery(this).css('left', oPosition.left);

			jqField.bind('focus', function() {
				hintFieldFocusHandler(jqField, _this);
			}).bind('blur', function() {
				hintFieldBlurHandler(jqField, _this);
			});

			jqField.one('keydown', function() {
				hintFieldFocusHandler(jqField, _this);
			});
			hintFieldFocusHandler(jqField, _this);
			hintFieldBlurHandler(jqField, _this);
		}
	});
};

//
// -----------------------------------------------------------------------------
//

//
// ajax parts
//
app.postAjax = function(sUrl, oData, fCallback, sMode) {
	if(sUrl && typeof(sUrl) == 'string') {
		sMode = sMode ? sMode : 'json';
		if(oData && typeof(oData) == 'object') {
			oData.bAjaxStopStat = 'Y';
		} else {
			oData = {'bAjaxStopStat': 'Y'};
		}
		if(fCallback && typeof(fCallback) == 'function') {
			jQuery.post(sUrl, oData, function(mAjaxReturnData) {
				fCallback(mAjaxReturnData);
			}, sMode);
		} else {
			jQuery.post(sUrl, oPostData, false, sMode);
		}
	}
};

app.oAjaxIndicator = new app.CAjaxIndicator('#ajax-loading', 'center');
jQuery(document).ajaxComplete(function(event, oXMLHttpRequest, oOptions) {
	jQuery(document).trigger('refreshelementsonajax');
}).ajaxStart(function() {
	if(app.oAjaxIndicator.getShowingMode == 'cursor') {
		app.oAjaxIndicator.hideLoadingBox();
		app.oAjaxIndicator.reposLoadingBox(app.Event);
	}
	app.oAjaxIndicator.showLoadingBox();
}).ajaxStop(function() {
	app.oAjaxIndicator.hideLoadingBox();
	jQuery(document).trigger('refreshelementsonajax');
}).ajaxError(function() {
	alert('Ajax request error');
	app.goTo(window.location.toString());
}).bind('refreshelementsonajax', function() {
	app.pageDynInit();
});
if(app.oAjaxIndicator.getShowingMode == 'cursor') {
	jQuery(document).bind('click', function(event) {
		app.Event = event;
	});
}

//
// form validator init
//
app.validateFormInit = function(sParent, oParams) {
	var oDefaultMsg = {
		reqString: app.MESS.reqString
		, reqDate: app.MESS.reqDate
		, reqNum: app.MESS.reqNum
		, reqMailNotValid: app.MESS.reqMailNotValid
		, reqMailEmpty: app.MESS.reqMailEmpty
		, reqSame: app.MESS.reqSame
		, reqBoth: app.MESS.reqBoth
		, reqMin: app.MESS.reqMin
		, reqString_: app.MESS.reqString_
		, reqDate_: app.MESS.reqDate_
		, reqNum_: app.MESS.reqNum_
		, reqMailNotValid_: app.MESS.reqMailNotValid_
		, reqMailEmpty_: app.MESS.reqMailEmpty_
		, reqSame_: app.MESS.reqSame_
		, reqBoth_: app.MESS.reqBoth_
		, reqMin_: app.MESS.reqMin_
		, reqPositiveNum: app.MESS.reqPositiveNum
		, reqPositiveNum_: app.MESS.reqPositiveNum_
		, reqChecked: app.MESS.reqChecked
		, reqChecked_: app.MESS.reqChecked_
	};
	sParent = sParent ? sParent + ' ': '';
	oParams = oParams ? oParams : {};
	oParams.errorDiv = oParams.errorDiv ? oParams.errorDiv : '.errorDiv1';
	oParams.errorMsg = oParams.errorMsg ? oParams.errorMsg : oDefaultMsg;
	oParams.funcErrorDivShowCallback = oParams.funcErrorDivShowCallback || oParams.funcErrorDivShowCallback === false ? oParams.funcErrorDivShowCallback : false;
	oParams.funcErrorFieldShowCallback = oParams.funcErrorFieldShowCallback || oParams.funcErrorFieldShowCallback === false ? oParams.funcErrorFieldShowCallback : false;
	oParams.funcErrorFieldHideCallback = oParams.funcErrorFieldHideCallback || oParams.funcErrorFieldHideCallback === false ? oParams.funcErrorFieldHideCallback : false;
	jQuery(sParent + '.validate-button').formValidator(oParams);
};

//
// live stylization
//
app.pageDynInit = function() {
	// uniform
	var obOptionsCommon = {
		'useID': false,
		'buttonClass': 'button',
		'hoverClass': '',
		'focusClass': '',
		'activeClass': ''
	};

	jQuery('input.inputcheckbox, input.inputradio, input.inputsubmit, input.inputreset, input.inputpassword, textarea.inputtextarea').each(function() {
		var jqThis = jQuery(this);
		if(!jqThis.data('bUniformed')) {
			var obOptions = obOptionsCommon;
			obOptions['buttonClass'] = 'button';
			jqThis.uniform(obOptions).data('bUniformed', true);
		}
	});
	jQuery('input.inputtext').each(function() {
		var jqThis = jQuery(this);
		if(!jqThis.data('bUniformed')) {
			jqThis.uniform().data('bUniformed', true);
			if(jqThis.hasClass('stretch')) {
				// traveler
				var sClass = jqThis.get(0).className.toString();
				var arMin = sClass.match(/min-([0-9\.]+)/);
				var arMax = sClass.match(/max-([0-9\.]+)/);
				var arStep = sClass.match(/step-([0-9\.]+)/);
				var dMin = arMin && arMin[1] ? parseFloat(arMin[1]) : 0;
				var dMax = arMax && arMax[1] ? parseFloat(arMax[1]) : 100;
				var dStep = arStep && arStep[1] ? parseFloat(arStep[1]) : 1;
				var dVal = parseFloat(jqThis.val());
				dVal = dVal && typeof(dVal) == 'number' ? dVal : 0;
				
				jqThis.wrap('<div class="stretch-box inline-block"></div>');
				jqThis.after('<div class="traveler"></div>');
				var jqTraveler = jqThis.next('div.traveler');
				jQuery(jqTraveler).slider({
					value: dVal,
					min: dMin,
					max: dMax,
					step: dStep,
					slide: function(e, ui) {
						jqThis.val(ui.value);
					}
				});
				if(!jqThis.get(0).readOnly) {
					jqThis.change(function(){
						var dVal = parseFloat(jQuery(this).val());
						dVal = dVal && typeof(dVal) == 'number' ? dVal : 0;
						jqTraveler.slider('value', dVal);
					});
				}
			}
		}
	});

	var obUfdOpts = {
		'infix': true,
		'addEmphasis': false,
		'css': {
			'input': 'ufd-input'
		}
	};
	jQuery('select.inputselect').each(function() {
		var jqThis = jQuery(this);
		if(!jqThis.data('bUniformed')) {
			jqThis.ufd(obUfdOpts).data('bUniformed', true);
		}
	});
};


//
// common page scripts
//
app.pageFinishingInit = function() {
	// run stylization
	app.pageDynInit();

	// fields hints
	setTimeout(app.initHint, 100);

	// print version
	if(window.opener && (document.location.hash == '#print')) {
		if(window.opener.location.pathname == window.location.pathname) {
			app.bPrintVer = true;
			jQuery('#print_css_alt').attr('href', jQuery('#print_css').attr('href'));
		}
	}

	// for Bitrix ajax
	if(window.jsAjaxUtil) {
        	jsAjaxUtil.ShowLocalWaitWindow = function(TID, cont, bShadow) {
			jQuery(document).triggerHandler('ajaxStart');
		};
        	jsAjaxUtil.CloseLocalWaitWindow = function(TID, cont) {
			jQuery(document).triggerHandler('ajaxStop');
		};
	}
};
