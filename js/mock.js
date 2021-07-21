const Mock = require('mockjs')

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

export default createMockData
