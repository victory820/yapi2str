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
    console.log('要通知了')
    chrome.notifications.create('testId', {
      type: 'basic',
      iconUrl: './images/success16.png',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95YXBpMnN0ci8uL2JhY2tncm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7QUFFQTtBQUNBLFlBQVksT0FBTztBQUNuQixZQUFZLE9BQU87QUFDbkIsWUFBWSxTQUFTO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxLQUFLO0FBQ0w7QUFDQSxDQUFDLEMiLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnNvbGUubG9nKCdiZy1qcycpXG5cbi8qKlxuICogQHBhcmFtcyB7b2JqZWN0fSByZXF1ZXN0IOivt+axguWPguaVsFxuICogQHBhcmFtcyB7b2JqZWN0fSBzZW5kZXIg6K+35rGC5pa5XG4gKiBAcGFyYW1zIHtmdW5jdGlvbn0gc2VuZFJlc3BvbnNlIOWRiuivieivt+axguaWuee7k+aenFxuICovXG4gY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBjb25zb2xlLmxvZygn6YCa55+l77ya77ya77yaJylcbiAgaWYgKHJlcXVlc3QuYWN0aW9uID09PSAnbm90aWZ5Jykge1xuICAgIGNvbnNvbGUubG9nKCfopoHpgJrnn6XkuoYnKVxuICAgIGNocm9tZS5ub3RpZmljYXRpb25zLmNyZWF0ZSgndGVzdElkJywge1xuICAgICAgdHlwZTogJ2Jhc2ljJyxcbiAgICAgIGljb25Vcmw6ICcuL2ltYWdlcy9zdWNjZXNzMTYucG5nJyxcbiAgICAgIHRpdGxlOiAn5aSN5Yi2JyxcbiAgICAgIG1lc3NhZ2U6ICflpI3liLbmiJDlip8nLFxuICAgICAgcHJpb3JpdHk6IDJcbiAgICB9LCAoKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZygn6YCa55+l5a6M5oiQJylcbiAgICB9KVxuICB9XG59KSJdLCJzb3VyY2VSb290IjoiIn0=