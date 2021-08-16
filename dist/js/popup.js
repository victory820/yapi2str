/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./js/mock.js":
/*!********************!*\
  !*** ./js/mock.js ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const Mock = __webpack_require__(/*! mockjs */ "./node_modules/mockjs/dist/mock.js")

function createMockData (datas) {
  let tempObj = {}
  function _getStructure (datas, tempObj, preType) {
    datas.forEach(item => {
      if (item.children.length > 0) {
        if (item.type === 'Object') {
          tempObj[item.name] = {}
        } else if (item.type === 'Object []') {
          tempObj[item.name] = [{}]
        } else if (item.type === 'String []') {
          tempObj[item.name] = []
        }
        _getStructure(item.children, tempObj[item.name], item.type)
      } else {
        if (item.type === 'Number') {
          setValue(tempObj, preType, item.name, 0)
        } else if (item.type === 'Object') {
          setValue(tempObj, preType, item.name, {})
        } else if (item.type === 'Object []') {
          setValue(tempObj, preType, item.name, [{}])
        } else if (item.type === 'String []') {
          setValue(tempObj, preType, item.name, [])
        } else { // 其他默认都是字符串
          setValue(tempObj, preType, item.name, '')
        }
      }
    })
  }
  // 根据不同类型设置默认值
  function setValue (tempObj, preType, name, value) {
    if (preType === 'Object') {
      tempObj[name] = value
    } else if (preType === 'Object []') {
      tempObj[0][name] = value
    } else if (preType === 'String []') {
      tempObj.push(value)
    }
  }

  _getStructure(datas, tempObj, 'Object')
  return tempObj
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (createMockData);


/***/ }),

/***/ "./js/popup.js":
/*!*********************!*\
  !*** ./js/popup.js ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _css_index_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../css/index.css */ "./css/index.css");
/* harmony import */ var _mock_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./mock.js */ "./js/mock.js");


// 按钮区域
const commonBtn = document.getElementById('getCommon')
const copyBtn = document.getElementById('copyData')
const mockBtn = document.getElementById('getMock')

// 内容区域
const dataBox = document.getElementById('dataBox')
// 通知区域
const notifyBox = document.getElementById('notify')

// 内容类型，复制时候区分是jsdoc格式或者mock格式
let contentType = ''

// When the button is clicked, inject run method into current page
commonBtn.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'getData'}, (res) => {
      if (res) {
        contentType = 'jsdoc'
        let str = _dataToJSDoc(res.baseInfo, res.tableInfo)
        dataBox.innerHTML = ''
        dataBox.innerHTML = str
      }
    })
  } else {
    console.log('未找到对应的页面')
  }
})
mockBtn.addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {action: 'getData'}, (res) => {
      if (res) {
        contentType = 'mock'
        let tempObj = _dataToMock(res.baseInfo, res.tableInfo)
        dataBox.innerHTML = ''
        dataBox.innerHTML = JSON.stringify(tempObj, null, 2)
      }
    })
  } else {
    console.log('未找到对应的页面')
  }
})

// 复制
copyBtn.addEventListener('click', async () => {
  const content = dataBox.value
  if (content) {
    try {
      if (contentType === 'jsdoc') {
        await _copyStr(content)
        chrome.runtime.sendMessage('', {action: 'notify', result: true})
      } else if (contentType === 'mock') {
        await _copyStr(JSON.stringify(JSON.parse(content)))
        chrome.runtime.sendMessage('', {action: 'notify', result: true})
      } else {
        console.log('无法获取复制类型')
        throw '无法获取复制类型'
      }
    } catch (error) {
      chrome.runtime.sendMessage('', {action: 'notify', result: false})
      console.log(error)
    }
  } else {
    contentType = ''
  }
})

// 复制内容
async function _copyStr (str) {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(str)
      notifyBox.innerText = '复制成功'
      notifyBox.style.color = '#67c23a'
      setTimeout(() => {
        notifyBox.innerText = ''
      }, 2000)
    } catch (err) {
      notifyBox.innerText = '复制失败'
      notifyBox.style.color = 'red'
      setTimeout(() => {
        notifyBox.innerText = ''
      }, 2000)
      console.error('Failed to copy: ', err)
    }
  } else {
    alert('不支持的浏览器')
  }
}

// 将字符串转为JSON字符串
function _dataToMock (base, info) {
  const results = info.resultLevel
  return (0,_mock_js__WEBPACK_IMPORTED_MODULE_1__.default)(results)
}

// 将拿到的数据格式化为JSDoc字符串
function _dataToJSDoc (base, info) {
  let paramsStr = `
/**
 * ${base.name}
 * @see ${base.yapiUrl}\n`
  let params = info.body
  params.forEach(item => {
    if (item.require === '非必须') {
      paramsStr += ` * @param {${item.type}} [${item.levelName}] - ${item.remark}\n`
    } else {
      paramsStr += ` * @param {${item.type}} ${item.levelName} - ${item.remark}\n`
    }
  })
  paramsStr += ' */'
  let resultStr = `
/**
 * ${base.name}
 * @returns {Object} res - 返回数据\n`
  let result = info.result
  result.forEach(item => {
    if (item.require === '非必须') {
      resultStr += ` * @returns {${item.type}} [res.${item.levelName}] - ${item.remark}\n`
    } else {
      resultStr += ` * @returns {${item.type}} res.${item.levelName} - ${item.remark}\n`
    }
  })
  resultStr += ' */'

  return `
  ${paramsStr}
  ${resultStr}
  `
}


/***/ }),

/***/ "./css/index.css":
/*!***********************!*\
  !*** ./css/index.css ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"popup": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			for(moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) var result = runtime(__webpack_require__);
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkIds[i]] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkyapi2str"] = self["webpackChunkyapi2str"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./js/popup.js")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95YXBpMnN0ci8uL2pzL21vY2suanMiLCJ3ZWJwYWNrOi8veWFwaTJzdHIvLi9qcy9wb3B1cC5qcyIsIndlYnBhY2s6Ly95YXBpMnN0ci8uL2Nzcy9pbmRleC5jc3M/MTFkYiIsIndlYnBhY2s6Ly95YXBpMnN0ci93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly95YXBpMnN0ci93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL3lhcGkyc3RyL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly95YXBpMnN0ci93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3lhcGkyc3RyL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8veWFwaTJzdHIvd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8veWFwaTJzdHIvd2VicGFjay9zdGFydHVwIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsYUFBYSxtQkFBTyxDQUFDLGtEQUFROztBQUU3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxrQ0FBa0M7QUFDbEMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsU0FBUztBQUNULGtEQUFrRDtBQUNsRCxTQUFTO0FBQ1QsbURBQW1EO0FBQ25ELFNBQVM7QUFDVDtBQUNBLFNBQVMsT0FBTztBQUNoQjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLGlFQUFlLGNBQWM7Ozs7Ozs7Ozs7Ozs7O0FDN0NKO0FBQ2E7QUFDdEM7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dCBNb2NrID0gcmVxdWlyZSgnbW9ja2pzJylcblxuZnVuY3Rpb24gY3JlYXRlTW9ja0RhdGEgKGRhdGFzKSB7XG4gIGxldCB0ZW1wT2JqID0ge31cbiAgZnVuY3Rpb24gX2dldFN0cnVjdHVyZSAoZGF0YXMsIHRlbXBPYmosIHByZVR5cGUpIHtcbiAgICBkYXRhcy5mb3JFYWNoKGl0ZW0gPT4ge1xuICAgICAgaWYgKGl0ZW0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuICAgICAgICBpZiAoaXRlbS50eXBlID09PSAnT2JqZWN0Jykge1xuICAgICAgICAgIHRlbXBPYmpbaXRlbS5uYW1lXSA9IHt9XG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09PSAnT2JqZWN0IFtdJykge1xuICAgICAgICAgIHRlbXBPYmpbaXRlbS5uYW1lXSA9IFt7fV1cbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdTdHJpbmcgW10nKSB7XG4gICAgICAgICAgdGVtcE9ialtpdGVtLm5hbWVdID0gW11cbiAgICAgICAgfVxuICAgICAgICBfZ2V0U3RydWN0dXJlKGl0ZW0uY2hpbGRyZW4sIHRlbXBPYmpbaXRlbS5uYW1lXSwgaXRlbS50eXBlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGl0ZW0udHlwZSA9PT0gJ051bWJlcicpIHtcbiAgICAgICAgICBzZXRWYWx1ZSh0ZW1wT2JqLCBwcmVUeXBlLCBpdGVtLm5hbWUsIDApXG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09PSAnT2JqZWN0Jykge1xuICAgICAgICAgIHNldFZhbHVlKHRlbXBPYmosIHByZVR5cGUsIGl0ZW0ubmFtZSwge30pXG4gICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09PSAnT2JqZWN0IFtdJykge1xuICAgICAgICAgIHNldFZhbHVlKHRlbXBPYmosIHByZVR5cGUsIGl0ZW0ubmFtZSwgW3t9XSlcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT09ICdTdHJpbmcgW10nKSB7XG4gICAgICAgICAgc2V0VmFsdWUodGVtcE9iaiwgcHJlVHlwZSwgaXRlbS5uYW1lLCBbXSlcbiAgICAgICAgfSBlbHNlIHsgLy8g5YW25LuW6buY6K6k6YO95piv5a2X56ym5LiyXG4gICAgICAgICAgc2V0VmFsdWUodGVtcE9iaiwgcHJlVHlwZSwgaXRlbS5uYW1lLCAnJylcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gIH1cbiAgLy8g5qC55o2u5LiN5ZCM57G75Z6L6K6+572u6buY6K6k5YC8XG4gIGZ1bmN0aW9uIHNldFZhbHVlICh0ZW1wT2JqLCBwcmVUeXBlLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChwcmVUeXBlID09PSAnT2JqZWN0Jykge1xuICAgICAgdGVtcE9ialtuYW1lXSA9IHZhbHVlXG4gICAgfSBlbHNlIGlmIChwcmVUeXBlID09PSAnT2JqZWN0IFtdJykge1xuICAgICAgdGVtcE9ialswXVtuYW1lXSA9IHZhbHVlXG4gICAgfSBlbHNlIGlmIChwcmVUeXBlID09PSAnU3RyaW5nIFtdJykge1xuICAgICAgdGVtcE9iai5wdXNoKHZhbHVlKVxuICAgIH1cbiAgfVxuXG4gIF9nZXRTdHJ1Y3R1cmUoZGF0YXMsIHRlbXBPYmosICdPYmplY3QnKVxuICByZXR1cm4gdGVtcE9ialxufVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVNb2NrRGF0YVxuIiwiaW1wb3J0ICcuLi9jc3MvaW5kZXguY3NzJ1xuaW1wb3J0IGNyZWF0ZU1vY2tEYXRhIGZyb20gJy4vbW9jay5qcydcbi8vIOaMiemSruWMuuWfn1xuY29uc3QgY29tbW9uQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dldENvbW1vbicpXG5jb25zdCBjb3B5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvcHlEYXRhJylcbmNvbnN0IG1vY2tCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2V0TW9jaycpXG5cbi8vIOWGheWuueWMuuWfn1xuY29uc3QgZGF0YUJveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYXRhQm94Jylcbi8vIOmAmuefpeWMuuWfn1xuY29uc3Qgbm90aWZ5Qm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25vdGlmeScpXG5cbi8vIOWGheWuueexu+Wei++8jOWkjeWItuaXtuWAmeWMuuWIhuaYr2pzZG9j5qC85byP5oiW6ICFbW9ja+agvOW8j1xubGV0IGNvbnRlbnRUeXBlID0gJydcblxuLy8gV2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQsIGluamVjdCBydW4gbWV0aG9kIGludG8gY3VycmVudCBwYWdlXG5jb21tb25CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gIGxldCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pXG4gIGlmICh0YWIpIHtcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHthY3Rpb246ICdnZXREYXRhJ30sIChyZXMpID0+IHtcbiAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSAnanNkb2MnXG4gICAgICAgIGxldCBzdHIgPSBfZGF0YVRvSlNEb2MocmVzLmJhc2VJbmZvLCByZXMudGFibGVJbmZvKVxuICAgICAgICBkYXRhQm94LmlubmVySFRNTCA9ICcnXG4gICAgICAgIGRhdGFCb3guaW5uZXJIVE1MID0gc3RyXG4gICAgICB9XG4gICAgfSlcbiAgfSBlbHNlIHtcbiAgICBjb25zb2xlLmxvZygn5pyq5om+5Yiw5a+55bqU55qE6aG16Z2iJylcbiAgfVxufSlcbm1vY2tCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gIGxldCBbdGFiXSA9IGF3YWl0IGNocm9tZS50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlLCBjdXJyZW50V2luZG93OiB0cnVlIH0pXG4gIGlmICh0YWIpIHtcbiAgICBjaHJvbWUudGFicy5zZW5kTWVzc2FnZSh0YWIuaWQsIHthY3Rpb246ICdnZXREYXRhJ30sIChyZXMpID0+IHtcbiAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgY29udGVudFR5cGUgPSAnbW9jaydcbiAgICAgICAgbGV0IHRlbXBPYmogPSBfZGF0YVRvTW9jayhyZXMuYmFzZUluZm8sIHJlcy50YWJsZUluZm8pXG4gICAgICAgIGRhdGFCb3guaW5uZXJIVE1MID0gJydcbiAgICAgICAgZGF0YUJveC5pbm5lckhUTUwgPSBKU09OLnN0cmluZ2lmeSh0ZW1wT2JqLCBudWxsLCAyKVxuICAgICAgfVxuICAgIH0pXG4gIH0gZWxzZSB7XG4gICAgY29uc29sZS5sb2coJ+acquaJvuWIsOWvueW6lOeahOmhtemdoicpXG4gIH1cbn0pXG5cbi8vIOWkjeWItlxuY29weUJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgY29uc3QgY29udGVudCA9IGRhdGFCb3gudmFsdWVcbiAgaWYgKGNvbnRlbnQpIHtcbiAgICB0cnkge1xuICAgICAgaWYgKGNvbnRlbnRUeXBlID09PSAnanNkb2MnKSB7XG4gICAgICAgIGF3YWl0IF9jb3B5U3RyKGNvbnRlbnQpXG4gICAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKCcnLCB7YWN0aW9uOiAnbm90aWZ5JywgcmVzdWx0OiB0cnVlfSlcbiAgICAgIH0gZWxzZSBpZiAoY29udGVudFR5cGUgPT09ICdtb2NrJykge1xuICAgICAgICBhd2FpdCBfY29weVN0cihKU09OLnN0cmluZ2lmeShKU09OLnBhcnNlKGNvbnRlbnQpKSlcbiAgICAgICAgY2hyb21lLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoJycsIHthY3Rpb246ICdub3RpZnknLCByZXN1bHQ6IHRydWV9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+aXoOazleiOt+WPluWkjeWItuexu+WeiycpXG4gICAgICAgIHRocm93ICfml6Dms5Xojrflj5blpI3liLbnsbvlnosnXG4gICAgICB9XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNocm9tZS5ydW50aW1lLnNlbmRNZXNzYWdlKCcnLCB7YWN0aW9uOiAnbm90aWZ5JywgcmVzdWx0OiBmYWxzZX0pXG4gICAgICBjb25zb2xlLmxvZyhlcnJvcilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgY29udGVudFR5cGUgPSAnJ1xuICB9XG59KVxuXG4vLyDlpI3liLblhoXlrrlcbmFzeW5jIGZ1bmN0aW9uIF9jb3B5U3RyIChzdHIpIHtcbiAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoc3RyKVxuICAgICAgbm90aWZ5Qm94LmlubmVyVGV4dCA9ICflpI3liLbmiJDlip8nXG4gICAgICBub3RpZnlCb3guc3R5bGUuY29sb3IgPSAnIzY3YzIzYSdcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBub3RpZnlCb3guaW5uZXJUZXh0ID0gJydcbiAgICAgIH0sIDIwMDApXG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBub3RpZnlCb3guaW5uZXJUZXh0ID0gJ+WkjeWItuWksei0pSdcbiAgICAgIG5vdGlmeUJveC5zdHlsZS5jb2xvciA9ICdyZWQnXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbm90aWZ5Qm94LmlubmVyVGV4dCA9ICcnXG4gICAgICB9LCAyMDAwKVxuICAgICAgY29uc29sZS5lcnJvcignRmFpbGVkIHRvIGNvcHk6ICcsIGVycilcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgYWxlcnQoJ+S4jeaUr+aMgeeahOa1j+iniOWZqCcpXG4gIH1cbn1cblxuLy8g5bCG5a2X56ym5Liy6L2s5Li6SlNPTuWtl+espuS4slxuZnVuY3Rpb24gX2RhdGFUb01vY2sgKGJhc2UsIGluZm8pIHtcbiAgY29uc3QgcmVzdWx0cyA9IGluZm8ucmVzdWx0TGV2ZWxcbiAgcmV0dXJuIGNyZWF0ZU1vY2tEYXRhKHJlc3VsdHMpXG59XG5cbi8vIOWwhuaLv+WIsOeahOaVsOaNruagvOW8j+WMluS4ukpTRG9j5a2X56ym5LiyXG5mdW5jdGlvbiBfZGF0YVRvSlNEb2MgKGJhc2UsIGluZm8pIHtcbiAgbGV0IHBhcmFtc1N0ciA9IGBcbi8qKlxuICogJHtiYXNlLm5hbWV9XG4gKiBAc2VlICR7YmFzZS55YXBpVXJsfVxcbmBcbiAgbGV0IHBhcmFtcyA9IGluZm8uYm9keVxuICBwYXJhbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICBpZiAoaXRlbS5yZXF1aXJlID09PSAn6Z2e5b+F6aG7Jykge1xuICAgICAgcGFyYW1zU3RyICs9IGAgKiBAcGFyYW0geyR7aXRlbS50eXBlfX0gWyR7aXRlbS5sZXZlbE5hbWV9XSAtICR7aXRlbS5yZW1hcmt9XFxuYFxuICAgIH0gZWxzZSB7XG4gICAgICBwYXJhbXNTdHIgKz0gYCAqIEBwYXJhbSB7JHtpdGVtLnR5cGV9fSAke2l0ZW0ubGV2ZWxOYW1lfSAtICR7aXRlbS5yZW1hcmt9XFxuYFxuICAgIH1cbiAgfSlcbiAgcGFyYW1zU3RyICs9ICcgKi8nXG4gIGxldCByZXN1bHRTdHIgPSBgXG4vKipcbiAqICR7YmFzZS5uYW1lfVxuICogQHJldHVybnMge09iamVjdH0gcmVzIC0g6L+U5Zue5pWw5o2uXFxuYFxuICBsZXQgcmVzdWx0ID0gaW5mby5yZXN1bHRcbiAgcmVzdWx0LmZvckVhY2goaXRlbSA9PiB7XG4gICAgaWYgKGl0ZW0ucmVxdWlyZSA9PT0gJ+mdnuW/hemhuycpIHtcbiAgICAgIHJlc3VsdFN0ciArPSBgICogQHJldHVybnMgeyR7aXRlbS50eXBlfX0gW3Jlcy4ke2l0ZW0ubGV2ZWxOYW1lfV0gLSAke2l0ZW0ucmVtYXJrfVxcbmBcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzdWx0U3RyICs9IGAgKiBAcmV0dXJucyB7JHtpdGVtLnR5cGV9fSByZXMuJHtpdGVtLmxldmVsTmFtZX0gLSAke2l0ZW0ucmVtYXJrfVxcbmBcbiAgICB9XG4gIH0pXG4gIHJlc3VsdFN0ciArPSAnICovJ1xuXG4gIHJldHVybiBgXG4gICR7cGFyYW1zU3RyfVxuICAke3Jlc3VsdFN0cn1cbiAgYFxufVxuIiwiLy8gZXh0cmFjdGVkIGJ5IG1pbmktY3NzLWV4dHJhY3QtcGx1Z2luXG5leHBvcnQge307IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwicG9wdXBcIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0Zm9yKG1vZHVsZUlkIGluIG1vcmVNb2R1bGVzKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0fVxuXHR9XG5cdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHRpZihwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbikgcGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24oZGF0YSk7XG5cdGZvcig7aSA8IGNodW5rSWRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y2h1bmtJZCA9IGNodW5rSWRzW2ldO1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhpbnN0YWxsZWRDaHVua3MsIGNodW5rSWQpICYmIGluc3RhbGxlZENodW5rc1tjaHVua0lkXSkge1xuXHRcdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdWzBdKCk7XG5cdFx0fVxuXHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkc1tpXV0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmt5YXBpMnN0clwiXSA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmt5YXBpMnN0clwiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9yXCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vanMvcG9wdXAuanNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiJdLCJzb3VyY2VSb290IjoiIn0=