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
          if (preType === 'Object') {
            tempObj[item.name] = 0
          } else if (preType === 'Object []') {
            tempObj[0][item.name] = 0
          } else if (preType === 'String []') {
            tempObj.push(0)
          }
        } else if (item.type === 'Object') {
          if (preType === 'Object') {
            tempObj[item.name] = {}
          } else if (preType === 'Object []') {
            tempObj[0][item.name] = {}
          } else if (preType === 'String []') {
            tempObj.push({})
          }
        } else if (item.type === 'Object []') {
          if (preType === 'Object') {
            tempObj[item.name] = [{}]
          } else if (preType === 'Object []') {
            tempObj[0][item.name] = [{}]
          } else if (preType === 'String []') {
            tempObj.push([{}])
          }
        } else if (item.type === 'String []') {
          if (preType === 'Object') {
            tempObj[item.name] = []
          } else if (preType === 'Object []') {
            tempObj[0][item.name] = []
          } else if (preType === 'String []') {
            tempObj.push([])
          }
        } else { // 其他默认都是字符串
          if (preType === 'Object') {
            tempObj[item.name] = ''
          } else if (preType === 'Object []') {
            tempObj[0][item.name] = ''
          } else if (preType === 'String []') {
            tempObj.push('')
          }
        }
      }
    })
  }

  _getStructure(datas, tempObj, 'Object')
  return tempObj
}

export default createMockData
