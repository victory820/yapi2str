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