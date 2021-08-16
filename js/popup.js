import '../css/index.css'
import createMockData from './mock.js'
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
  return createMockData(results)
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
