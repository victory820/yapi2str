// 接受请求，整理数据
/**
 * @params {object} request 请求参数
 * @params {object} sender 请求方
 * @params {function} sendResponse 告诉请求方结果
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('获取值：：：')
  if (request.action === 'getData') {
    sendResponse(run())
  }
})

function run() {
  // 找到所有能展开的元素
  let collapsedIcons = null
  collapsedIcons = document.querySelectorAll('.ant-table-row-collapsed')
  while (collapsedIcons && collapsedIcons.length > 0) {
    _openCollapsedNode(collapsedIcons)
    collapsedIcons = document.querySelectorAll('.ant-table-row-collapsed')
  }
  
  // 预览面板
  const previewBox = document.querySelector('.caseContainer')
  if (previewBox) {
    const baseInfo = _getBaseInfo(previewBox)
    const tableInfo = _getTablesInfo(previewBox)
    return {
      baseInfo,
      tableInfo
    }
  } else {
    return false
  }

  // 三个table数据
  function _getTablesInfo (previewBox) {
    let paramsHeader = { type: null }
    let paramsBody = []
    let returnData = []
    let resultLevel = []
    const tables = previewBox.querySelectorAll('.ant-table-body')
    if (tables) {
      // headers表格
      const headerBox = tables[0]
      const headerTbody = headerBox.querySelector('.ant-table-tbody')
      // 获取请求参数类型；需要排除掉暂无数据
      if (headerTbody.innerHTML) {
        const tds = headerTbody.querySelector('.ant-table-row').querySelectorAll('td')
        paramsHeader.type = tds[1].innerText || null
      }

      // body表格
      const bodyBox = tables[1]
      const resultBody = _formatRows(bodyBox).allRows
      if (resultBody) {
        paramsBody = resultBody
      }

      // 返回数据表格
      const resultBox = tables[2]
      const result = _formatRows(resultBox).allRows
      const levelData = _formatRows(resultBox).allData
      if (result) {
        returnData = result
        resultLevel = levelData
      }
    }

    return {
      header: paramsHeader,
      body: paramsBody,
      result: returnData,
      resultLevel
    }
  }

  // body表格和返回数据表格都是同样处理
  function _formatRows (nodes) {
    const tbody = nodes.querySelector('.ant-table-tbody')
    if (tbody.innerHTML) {
      const rows = tbody.querySelectorAll('.ant-table-row')
      if (rows) {
        const { maxLevel, allRows } = _restructure(rows)
        if (maxLevel > 4) {
          alert('已经超过设置最大层级，不继续了')
          return
        }
        let allData = []
        allRows.forEach(row => {
          if (row.level === 0) {
            row.levelName = row.name
            allData.push(row)
          } else {
            if (row.level === 1) {
              let first = allData[allData.length - 1]
              row.parent = first.id
              row.parentLen = first.children.length
              first.children.push(_setLevelName(row, first))
            } else {
              if (row.level === 2) {
                let second = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1]
                row.parent = second.id
                row.parentLen = second.children.length
                second.children.push(_setLevelName(row, second))
              } else {
                if (row.level === 3) {
                  let third = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1]
                  row.parent = third.id
                  row.parentLen = third.children.length
                  third.children.push(_setLevelName(row, third))
                } else {
                  if (row.level === 4) {
                    let fourth = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1].children.length - 1]
                    row.parent = fourth.id
                    row.parentLen = fourth.children.length
                    fourth.children.push(_setLevelName(row, fourth))
                  }
                }
              }
            }
          }
        })
        return {
          allRows,
          allData
        }
      }
    }
  }
  // 设置导出的层级名词
  function _setLevelName (row, parent) {
    if (parent.type === 'Object') {
      row.levelName = `${parent.levelName}.${row.name}`
    } else if (parent.type === 'Object []') {
      row.levelName = `${parent.levelName}[].${row.name}`
    }
    return row
  }

  // 将数据扁平化处理，处理成指定格式
  function _restructure (rows) {
    let maxLevel = 0
    let allRows = []
    rows.forEach((row, index) => {
      const tds = row.querySelectorAll('td')
      // 如果没有名称就跳过
      if (!tds[0].innerText) return
      let tempObj = {
        id: `row${index}`,
        name: tds[0].innerText || null,
        type: tds[1].innerText ? _fistLetterUpper(tds[1].innerText) : null,
        require: tds[2].innerText || null,
        defaultVal: tds[3].innerText || null,
        remark: tds[4].innerText || null,
        other:  (tds[5] && tds[5].innerText) || null, // 暂时没用
        level: null, // 层级
        children: [],
        parent: '',
        levelName: ''
      }
      const levelClass = row.classList[1]
      if (typeof levelClass !== 'undefined') {
        tempObj.level = parseInt(levelClass.substring(levelClass.lastIndexOf('-') + 1))
        // 用来比较是否超过最大层级
        if (tempObj.level > maxLevel) {
          maxLevel = tempObj.level
        }
      }
      allRows.push(tempObj)
    })
    return {
      maxLevel,
      allRows
    }
  }

  // 基本信息
  function _getBaseInfo (previewBox) {
    let baseInfo = {
      yapiUrl: window.location.href,
      name: null, // 接口名称
      method: null, // 请求方式
      apiUrl: null, // 接口地址
    }
    const rows = previewBox.querySelectorAll('.panel-view .ant-row')
    // 接口名称行
    if (rows[0]) {
      baseInfo.name = rows[0].querySelector('.colName').innerText  || null
    }
    // 接口路径行
    if (rows[2]) {
      const colApi = rows[2].querySelector('.colValue')
      if (colApi) {
        const apiPathCols = colApi.querySelectorAll('.colValue')
        baseInfo.method = apiPathCols[0].innerText || null
        baseInfo.apiUrl = apiPathCols[1].innerText || null
      }
    }
    return baseInfo
  }

  // 循环便利页面中的未展开元素，找到后全部展开。根据ant-table-row-collapsed类来判断；
  function _openCollapsedNode (nodes) {
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => {
        node.click()
      })
    } 
  }

  function _fistLetterUpper (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

}