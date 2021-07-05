const getBtn = document.getElementById("getBtn")
// const copyBtn = document.getElementById('copyBtn')
// const dataBox = document.getElementById('dataBox')

// When the button is clicked, inject run method into current page
getBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: run,
  })
})

// The body of this function will be executed as a content script inside the current page
function run() {
  // 找到所有能展开的元素
  let collapsedIcons = null
  collapsedIcons = document.querySelectorAll('.ant-table-row-collapsed')
  while (collapsedIcons && collapsedIcons.length > 0) {
    openCollapsedNode(collapsedIcons)
    collapsedIcons = document.querySelectorAll('.ant-table-row-collapsed')
  }
  
  // 预览面板
  const previewBox = document.querySelector('.caseContainer')
  if (previewBox) {
    const base = getBaseInfo(previewBox)
    // console.log(base)
    const info = getTablesInfo(previewBox)
    // console.log(info)
    let str = dataToString(base, info)
    console.log(str)
  }

  async function copyStr () {
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText('test chen')
      } catch (err) {
        console.error('Failed to copy: ', err)
      }
    } else {
      alert('不支持的浏览器')
    }
  }

  // 将拿到的数据格式化为字符串
  function dataToString (base, info) {
    let paramsStr = `
/**
 * ${base.name}
 * @see ${window.location.href}\n`
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

  // 三个table数据
  function getTablesInfo (previewBox) {
    let paramsHeader = { type: '-' }
    let paramsBody = []
    let returnData = []
    const tables = previewBox.querySelectorAll('.ant-table-body')
    if (tables) {
      // headers表格
      const headerBox = tables[0]
      const headerTbody = headerBox.querySelector('.ant-table-tbody')
      // 获取请求参数类型；需要排除掉暂无数据
      if (headerTbody.innerHTML) {
        const tds = headerTbody.querySelector('.ant-table-row').querySelectorAll('td')
        paramsHeader.type = tds[1].innerText || '-'
      }

      // body表格
      const bodyBox = tables[1]
      const resultBody = formatRows(bodyBox)
      if (resultBody) {
        paramsBody = resultBody
      }

      // 返回数据表格
      const resultBox = tables[2]
      const result = formatRows(resultBox)
      if (result) {
        returnData = result
      }
    }

    return {
      header: paramsHeader,
      body: paramsBody,
      result: returnData
    }
  }
  // body表格和返回数据表格都是同样处理
  function formatRows (nodes) {
    const tbody = nodes.querySelector('.ant-table-tbody')
    if (tbody.innerHTML) {
      const rows = tbody.querySelectorAll('.ant-table-row')
      if (rows) {
        const { maxLevel, allRows } = restructure(rows)
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
              if (first.type === 'object') {
                row.levelName = `${first.levelName}.${row.name}`
              } else if (first.type === 'object []') {
                row.levelName = `${first.levelName}[].${row.name}`
              }
              first.children.push(row)
            } else {
              if (row.level === 2) {
                let second = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1]
                row.parent = second.id
                if (second.type === 'object') {
                  row.levelName = `${second.levelName}.${row.name}`
                } else if (second.type === 'object []') {
                  row.levelName = `${second.levelName}[].${row.name}`
                }
                second.children.push(row)
              } else {
                if (row.level === 3) {
                  let third = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1]
                  row.parent = third.id
                  if (third.type === 'object') {
                    row.levelName = `${third.levelName}.${row.name}`
                  } else if (third.type === 'object []') {
                    row.levelName = `${third.levelName}[].${row.name}`
                  }
                  third.children.push(row)
                } else {
                  if (row.level === 4) {
                    let fourth = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1].children.length - 1]
                    row.parent = fourth.id
                    if (fourth.type === 'object') {
                      row.levelName = `${fourth.levelName}.${row.name}`
                    } else if (fourth.type === 'object []') {
                      row.levelName = `${fourth.levelName}[].${row.name}`
                    }
                    fourth.children.push(row)
                  }
                }
              }
            }
          }
        })
        return allRows
      }
    }
  }

  // 将数据扁平化处理，处理成指定格式
  function restructure (rows) {
    let maxLevel = 0
    let allRows = []
    rows.forEach((row, index) => {
      const tds = row.querySelectorAll('td')
      // 如果没有名称就跳过
      if (!tds[0].innerText) return
      let tempObj = {
        id: `row${index}`,
        name: tds[0].innerText || '-',
        type: tds[1].innerText ? fistLetterUpper(tds[1].innerText) : '-',
        require: tds[2].innerText || '-',
        defaultVal: tds[3].innerText || '-', // 暂时没用
        remark: tds[4].innerText || '-',
        other: tds[5].innerText || '-', // 暂时没用
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
  function getBaseInfo (previewBox) {
    let baseInfo = {
      name: '-', // 接口名称
      method: '-', // 请求方式
      apiUrl: '-', // 接口地址
    }
    const rows = previewBox.querySelectorAll('.panel-view .ant-row')
    // 接口名称行
    if (rows[0]) {
      baseInfo.name = rows[0].querySelector('.colName').innerText  || '-'
    }
    // 接口路径行
    if (rows[2]) {
      const colApi = rows[2].querySelector('.colValue')
      if (colApi) {
        const apiPathCols = colApi.querySelectorAll('.colValue')
        baseInfo.method = apiPathCols[0].innerText || '-'
        baseInfo.apiUrl = apiPathCols[1].innerText || '-'
      }
    }
    return baseInfo
  }

  // 循环便利页面中的未展开元素，找到后全部展开。根据ant-table-row-collapsed类来判断；
  function openCollapsedNode (nodes) {
    if (nodes && nodes.length > 0) {
      nodes.forEach(node => {
        node.click()
      })
    } 
  }

  function fistLetterUpper (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
