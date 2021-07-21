/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./background.js ***!
  \***********************/
console.log('bg-js')

/**
 * @params {object} request 请求参数
 * @params {object} sender 请求方
 * @params {function} sendResponse 告诉请求方结果
 */
 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('通知：：：')
  if (request.action === 'notify') {
    chrome.notifications.create('', {
      type: 'basic',
      iconUrl: '../images/success16.png',
      title: '复制',
      message: '复制成功',
      priority: 2
    }, () => {
      console.log('通知完成')
    })
  }
})
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95YXBpMnN0ci8uL2JhY2tncm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFFQTtBQUNBLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsS0FBSztBQUNMO0FBQ0EsQ0FBQyxDIiwiZmlsZSI6ImJhY2tncm91bmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zb2xlLmxvZygnYmctanMnKVxuXG4vKipcbiAqIEBwYXJhbXMge29iamVjdH0gcmVxdWVzdCDor7fmsYLlj4LmlbBcbiAqIEBwYXJhbXMge29iamVjdH0gc2VuZGVyIOivt+axguaWuVxuICogQHBhcmFtcyB7ZnVuY3Rpb259IHNlbmRSZXNwb25zZSDlkYror4nor7fmsYLmlrnnu5PmnpxcbiAqL1xuIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc29sZS5sb2coJ+mAmuefpe+8mu+8mu+8micpXG4gIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gJ25vdGlmeScpIHtcbiAgICBjaHJvbWUubm90aWZpY2F0aW9ucy5jcmVhdGUoJycsIHtcbiAgICAgIHR5cGU6ICdiYXNpYycsXG4gICAgICBpY29uVXJsOiAnLi4vaW1hZ2VzL3N1Y2Nlc3MxNi5wbmcnLFxuICAgICAgdGl0bGU6ICflpI3liLYnLFxuICAgICAgbWVzc2FnZTogJ+WkjeWItuaIkOWKnycsXG4gICAgICBwcmlvcml0eTogMlxuICAgIH0sICgpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKCfpgJrnn6XlrozmiJAnKVxuICAgIH0pXG4gIH1cbn0pIl0sInNvdXJjZVJvb3QiOiIifQ==