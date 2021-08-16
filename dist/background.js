/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./background.js ***!
  \***********************/
/**
 * @params {object} request 请求参数
 * @params {object} sender 请求方
 * @params {function} sendResponse 告诉请求方结果
 */
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'notify') {
    chrome.notifications.create('testId', {
      type: 'basic',
      iconUrl: './images/success16.png',
      title: '复制',
      message: '复制成功',
      priority: 0
    }, () => {
      console.log('通知完成')
    })
  }
})
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95YXBpMnN0ci8uL2JhY2tncm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEtBQUs7QUFDTDtBQUNBLENBQUMsQyIsImZpbGUiOiJiYWNrZ3JvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAcGFyYW1zIHtvYmplY3R9IHJlcXVlc3Qg6K+35rGC5Y+C5pWwXG4gKiBAcGFyYW1zIHtvYmplY3R9IHNlbmRlciDor7fmsYLmlrlcbiAqIEBwYXJhbXMge2Z1bmN0aW9ufSBzZW5kUmVzcG9uc2Ug5ZGK6K+J6K+35rGC5pa557uT5p6cXG4gKi9cbiBjaHJvbWUucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKHJlcXVlc3QsIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG4gIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gJ25vdGlmeScpIHtcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoJ3Rlc3RJZCcsIHtcbiAgICAgIHR5cGU6ICdiYXNpYycsXG4gICAgICBpY29uVXJsOiAnLi9pbWFnZXMvc3VjY2VzczE2LnBuZycsXG4gICAgICB0aXRsZTogJ+WkjeWIticsXG4gICAgICBtZXNzYWdlOiAn5aSN5Yi25oiQ5YqfJyxcbiAgICAgIHByaW9yaXR5OiAwXG4gICAgfSwgKCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coJ+mAmuefpeWujOaIkCcpXG4gICAgfSlcbiAgfVxufSkiXSwic291cmNlUm9vdCI6IiJ9