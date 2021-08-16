/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./js/content.js ***!
  \***********************/
// 接受请求，整理数据
/**
 * @params {object} request 请求参数
 * @params {object} sender 请求方
 * @params {function} sendResponse 告诉请求方结果
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
        // allRows.forEach(row => {
        //   if (row.level === 0) {
        //     row.levelName = row.name
        //     allData.push(row)
        //   } else {
        //     if (row.level === 1) {
        //       let first = allData[allData.length - 1]
        //       row.parent = first.id
        //       row.parentLen = first.children.length
        //       first.children.push(_setLevelName(row, first))
        //     } else {
        //       if (row.level === 2) {
        //         let second = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1]
        //         row.parent = second.id
        //         row.parentLen = second.children.length
        //         second.children.push(_setLevelName(row, second))
        //       } else {
        //         if (row.level === 3) {
        //           let third = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1]
        //           row.parent = third.id
        //           row.parentLen = third.children.length
        //           third.children.push(_setLevelName(row, third))
        //         } else {
        //           if (row.level === 4) {
        //             let fourth = allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children[allData[allData.length - 1].children[allData[allData.length - 1].children.length - 1].children.length - 1].children.length - 1]
        //             row.parent = fourth.id
        //             row.parentLen = fourth.children.length
        //             fourth.children.push(_setLevelName(row, fourth))
        //           }
        //         }
        //       }
        //     }
        //   }
        // })
        console.log('--11')
        console.log(allRows)
        console.log('--22')
        console.log(allData)
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
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95YXBpMnN0ci8uL2pzL2NvbnRlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVksT0FBTztBQUNuQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZSxvQkFBb0I7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QixpQkFBaUIsR0FBRyxTQUFTO0FBQ3RELEtBQUs7QUFDTCx5QkFBeUIsaUJBQWlCLEtBQUssU0FBUztBQUN4RDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLE1BQU07QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEs7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsQyIsImZpbGUiOiJqcy9jb250ZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5o6l5Y+X6K+35rGC77yM5pW055CG5pWw5o2uXG4vKipcbiAqIEBwYXJhbXMge29iamVjdH0gcmVxdWVzdCDor7fmsYLlj4LmlbBcbiAqIEBwYXJhbXMge29iamVjdH0gc2VuZGVyIOivt+axguaWuVxuICogQHBhcmFtcyB7ZnVuY3Rpb259IHNlbmRSZXNwb25zZSDlkYror4nor7fmsYLmlrnnu5PmnpxcbiAqL1xuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChyZXF1ZXN0LCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICBpZiAocmVxdWVzdC5hY3Rpb24gPT09ICdnZXREYXRhJykge1xuICAgIHNlbmRSZXNwb25zZShydW4oKSlcbiAgfVxufSlcblxuZnVuY3Rpb24gcnVuKCkge1xuICAvLyDmib7liLDmiYDmnInog73lsZXlvIDnmoTlhYPntKBcbiAgbGV0IGNvbGxhcHNlZEljb25zID0gbnVsbFxuICBjb2xsYXBzZWRJY29ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hbnQtdGFibGUtcm93LWNvbGxhcHNlZCcpXG4gIHdoaWxlIChjb2xsYXBzZWRJY29ucyAmJiBjb2xsYXBzZWRJY29ucy5sZW5ndGggPiAwKSB7XG4gICAgX29wZW5Db2xsYXBzZWROb2RlKGNvbGxhcHNlZEljb25zKVxuICAgIGNvbGxhcHNlZEljb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFudC10YWJsZS1yb3ctY29sbGFwc2VkJylcbiAgfVxuICBcbiAgLy8g6aKE6KeI6Z2i5p2/XG4gIGNvbnN0IHByZXZpZXdCb3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY2FzZUNvbnRhaW5lcicpXG4gIGlmIChwcmV2aWV3Qm94KSB7XG4gICAgY29uc3QgYmFzZUluZm8gPSBfZ2V0QmFzZUluZm8ocHJldmlld0JveClcbiAgICBjb25zdCB0YWJsZUluZm8gPSBfZ2V0VGFibGVzSW5mbyhwcmV2aWV3Qm94KVxuICAgIHJldHVybiB7XG4gICAgICBiYXNlSW5mbyxcbiAgICAgIHRhYmxlSW5mb1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIOS4ieS4qnRhYmxl5pWw5o2uXG4gIGZ1bmN0aW9uIF9nZXRUYWJsZXNJbmZvIChwcmV2aWV3Qm94KSB7XG4gICAgbGV0IHBhcmFtc0hlYWRlciA9IHsgdHlwZTogbnVsbCB9XG4gICAgbGV0IHBhcmFtc0JvZHkgPSBbXVxuICAgIGxldCByZXR1cm5EYXRhID0gW11cbiAgICBsZXQgcmVzdWx0TGV2ZWwgPSBbXVxuICAgIGNvbnN0IHRhYmxlcyA9IHByZXZpZXdCb3gucXVlcnlTZWxlY3RvckFsbCgnLmFudC10YWJsZS1ib2R5JylcbiAgICBpZiAodGFibGVzKSB7XG4gICAgICAvLyBoZWFkZXJz6KGo5qC8XG4gICAgICBjb25zdCBoZWFkZXJCb3ggPSB0YWJsZXNbMF1cbiAgICAgIGNvbnN0IGhlYWRlclRib2R5ID0gaGVhZGVyQm94LnF1ZXJ5U2VsZWN0b3IoJy5hbnQtdGFibGUtdGJvZHknKVxuICAgICAgLy8g6I635Y+W6K+35rGC5Y+C5pWw57G75Z6L77yb6ZyA6KaB5o6S6Zmk5o6J5pqC5peg5pWw5o2uXG4gICAgICBpZiAoaGVhZGVyVGJvZHkuaW5uZXJIVE1MKSB7XG4gICAgICAgIGNvbnN0IHRkcyA9IGhlYWRlclRib2R5LnF1ZXJ5U2VsZWN0b3IoJy5hbnQtdGFibGUtcm93JykucXVlcnlTZWxlY3RvckFsbCgndGQnKVxuICAgICAgICBwYXJhbXNIZWFkZXIudHlwZSA9IHRkc1sxXS5pbm5lclRleHQgfHwgbnVsbFxuICAgICAgfVxuXG4gICAgICAvLyBib2R56KGo5qC8XG4gICAgICBjb25zdCBib2R5Qm94ID0gdGFibGVzWzFdXG4gICAgICBjb25zdCByZXN1bHRCb2R5ID0gX2Zvcm1hdFJvd3MoYm9keUJveCkuYWxsUm93c1xuICAgICAgaWYgKHJlc3VsdEJvZHkpIHtcbiAgICAgICAgcGFyYW1zQm9keSA9IHJlc3VsdEJvZHlcbiAgICAgIH1cblxuICAgICAgLy8g6L+U5Zue5pWw5o2u6KGo5qC8XG4gICAgICBjb25zdCByZXN1bHRCb3ggPSB0YWJsZXNbMl1cbiAgICAgIGNvbnN0IHJlc3VsdCA9IF9mb3JtYXRSb3dzKHJlc3VsdEJveCkuYWxsUm93c1xuICAgICAgY29uc3QgbGV2ZWxEYXRhID0gX2Zvcm1hdFJvd3MocmVzdWx0Qm94KS5hbGxEYXRhXG4gICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgIHJldHVybkRhdGEgPSByZXN1bHRcbiAgICAgICAgcmVzdWx0TGV2ZWwgPSBsZXZlbERhdGFcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgaGVhZGVyOiBwYXJhbXNIZWFkZXIsXG4gICAgICBib2R5OiBwYXJhbXNCb2R5LFxuICAgICAgcmVzdWx0OiByZXR1cm5EYXRhLFxuICAgICAgcmVzdWx0TGV2ZWxcbiAgICB9XG4gIH1cblxuICAvLyBib2R56KGo5qC85ZKM6L+U5Zue5pWw5o2u6KGo5qC86YO95piv5ZCM5qC35aSE55CGXG4gIGZ1bmN0aW9uIF9mb3JtYXRSb3dzIChub2Rlcykge1xuICAgIGNvbnN0IHRib2R5ID0gbm9kZXMucXVlcnlTZWxlY3RvcignLmFudC10YWJsZS10Ym9keScpXG4gICAgaWYgKHRib2R5LmlubmVySFRNTCkge1xuICAgICAgY29uc3Qgcm93cyA9IHRib2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hbnQtdGFibGUtcm93JylcbiAgICAgIGlmIChyb3dzKSB7XG4gICAgICAgIGNvbnN0IHsgbWF4TGV2ZWwsIGFsbFJvd3MgfSA9IF9yZXN0cnVjdHVyZShyb3dzKVxuICAgICAgICBpZiAobWF4TGV2ZWwgPiA0KSB7XG4gICAgICAgICAgYWxlcnQoJ+W3sue7j+i2hei/h+iuvue9ruacgOWkp+Wxgue6p++8jOS4jee7p+e7reS6hicpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGFsbERhdGEgPSBbXVxuICAgICAgICAvLyBhbGxSb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgLy8gICBpZiAocm93LmxldmVsID09PSAwKSB7XG4gICAgICAgIC8vICAgICByb3cubGV2ZWxOYW1lID0gcm93Lm5hbWVcbiAgICAgICAgLy8gICAgIGFsbERhdGEucHVzaChyb3cpXG4gICAgICAgIC8vICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgIGlmIChyb3cubGV2ZWwgPT09IDEpIHtcbiAgICAgICAgLy8gICAgICAgbGV0IGZpcnN0ID0gYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdXG4gICAgICAgIC8vICAgICAgIHJvdy5wYXJlbnQgPSBmaXJzdC5pZFxuICAgICAgICAvLyAgICAgICByb3cucGFyZW50TGVuID0gZmlyc3QuY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgIC8vICAgICAgIGZpcnN0LmNoaWxkcmVuLnB1c2goX3NldExldmVsTmFtZShyb3csIGZpcnN0KSlcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgIGlmIChyb3cubGV2ZWwgPT09IDIpIHtcbiAgICAgICAgLy8gICAgICAgICBsZXQgc2Vjb25kID0gYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXVxuICAgICAgICAvLyAgICAgICAgIHJvdy5wYXJlbnQgPSBzZWNvbmQuaWRcbiAgICAgICAgLy8gICAgICAgICByb3cucGFyZW50TGVuID0gc2Vjb25kLmNoaWxkcmVuLmxlbmd0aFxuICAgICAgICAvLyAgICAgICAgIHNlY29uZC5jaGlsZHJlbi5wdXNoKF9zZXRMZXZlbE5hbWUocm93LCBzZWNvbmQpKVxuICAgICAgICAvLyAgICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgIGlmIChyb3cubGV2ZWwgPT09IDMpIHtcbiAgICAgICAgLy8gICAgICAgICAgIGxldCB0aGlyZCA9IGFsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW4ubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXVxuICAgICAgICAvLyAgICAgICAgICAgcm93LnBhcmVudCA9IHRoaXJkLmlkXG4gICAgICAgIC8vICAgICAgICAgICByb3cucGFyZW50TGVuID0gdGhpcmQuY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgIC8vICAgICAgICAgICB0aGlyZC5jaGlsZHJlbi5wdXNoKF9zZXRMZXZlbE5hbWUocm93LCB0aGlyZCkpXG4gICAgICAgIC8vICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAgIGlmIChyb3cubGV2ZWwgPT09IDQpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgbGV0IGZvdXJ0aCA9IGFsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW4ubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW4ubGVuZ3RoIC0gMV0uY2hpbGRyZW4ubGVuZ3RoIC0gMV0uY2hpbGRyZW4ubGVuZ3RoIC0gMV1cbiAgICAgICAgLy8gICAgICAgICAgICAgcm93LnBhcmVudCA9IGZvdXJ0aC5pZFxuICAgICAgICAvLyAgICAgICAgICAgICByb3cucGFyZW50TGVuID0gZm91cnRoLmNoaWxkcmVuLmxlbmd0aFxuICAgICAgICAvLyAgICAgICAgICAgICBmb3VydGguY2hpbGRyZW4ucHVzaChfc2V0TGV2ZWxOYW1lKHJvdywgZm91cnRoKSlcbiAgICAgICAgLy8gICAgICAgICAgIH1cbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0pXG4gICAgICAgIGNvbnNvbGUubG9nKCctLTExJylcbiAgICAgICAgY29uc29sZS5sb2coYWxsUm93cylcbiAgICAgICAgY29uc29sZS5sb2coJy0tMjInKVxuICAgICAgICBjb25zb2xlLmxvZyhhbGxEYXRhKVxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGFsbFJvd3MsXG4gICAgICAgICAgYWxsRGF0YVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvLyDorr7nva7lr7zlh7rnmoTlsYLnuqflkI3or41cbiAgZnVuY3Rpb24gX3NldExldmVsTmFtZSAocm93LCBwYXJlbnQpIHtcbiAgICBpZiAocGFyZW50LnR5cGUgPT09ICdPYmplY3QnKSB7XG4gICAgICByb3cubGV2ZWxOYW1lID0gYCR7cGFyZW50LmxldmVsTmFtZX0uJHtyb3cubmFtZX1gXG4gICAgfSBlbHNlIGlmIChwYXJlbnQudHlwZSA9PT0gJ09iamVjdCBbXScpIHtcbiAgICAgIHJvdy5sZXZlbE5hbWUgPSBgJHtwYXJlbnQubGV2ZWxOYW1lfVtdLiR7cm93Lm5hbWV9YFxuICAgIH1cbiAgICByZXR1cm4gcm93XG4gIH1cblxuICAvLyDlsIbmlbDmja7miYHlubPljJblpITnkIbvvIzlpITnkIbmiJDmjIflrprmoLzlvI9cbiAgZnVuY3Rpb24gX3Jlc3RydWN0dXJlIChyb3dzKSB7XG4gICAgbGV0IG1heExldmVsID0gMFxuICAgIGxldCBhbGxSb3dzID0gW11cbiAgICByb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHRkcyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpXG4gICAgICAvLyDlpoLmnpzmsqHmnInlkI3np7DlsLHot7Pov4dcbiAgICAgIGlmICghdGRzWzBdLmlubmVyVGV4dCkgcmV0dXJuXG4gICAgICBsZXQgdGVtcE9iaiA9IHtcbiAgICAgICAgaWQ6IGByb3cke2luZGV4fWAsXG4gICAgICAgIG5hbWU6IHRkc1swXS5pbm5lclRleHQgfHwgbnVsbCxcbiAgICAgICAgdHlwZTogdGRzWzFdLmlubmVyVGV4dCA/IF9maXN0TGV0dGVyVXBwZXIodGRzWzFdLmlubmVyVGV4dCkgOiBudWxsLFxuICAgICAgICByZXF1aXJlOiB0ZHNbMl0uaW5uZXJUZXh0IHx8IG51bGwsXG4gICAgICAgIGRlZmF1bHRWYWw6IHRkc1szXS5pbm5lclRleHQgfHwgbnVsbCxcbiAgICAgICAgcmVtYXJrOiB0ZHNbNF0uaW5uZXJUZXh0IHx8IG51bGwsXG4gICAgICAgIG90aGVyOiAgKHRkc1s1XSAmJiB0ZHNbNV0uaW5uZXJUZXh0KSB8fCBudWxsLCAvLyDmmoLml7bmsqHnlKhcbiAgICAgICAgbGV2ZWw6IG51bGwsIC8vIOWxgue6p1xuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIHBhcmVudDogJycsXG4gICAgICAgIGxldmVsTmFtZTogJydcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxldmVsQ2xhc3MgPSByb3cuY2xhc3NMaXN0WzFdXG4gICAgICBpZiAodHlwZW9mIGxldmVsQ2xhc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRlbXBPYmoubGV2ZWwgPSBwYXJzZUludChsZXZlbENsYXNzLnN1YnN0cmluZyhsZXZlbENsYXNzLmxhc3RJbmRleE9mKCctJykgKyAxKSlcbiAgICAgICAgLy8g55So5p2l5q+U6L6D5piv5ZCm6LaF6L+H5pyA5aSn5bGC57qnXG4gICAgICAgIGlmICh0ZW1wT2JqLmxldmVsID4gbWF4TGV2ZWwpIHtcbiAgICAgICAgICBtYXhMZXZlbCA9IHRlbXBPYmoubGV2ZWxcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWxsUm93cy5wdXNoKHRlbXBPYmopXG4gICAgfSlcbiAgICByZXR1cm4ge1xuICAgICAgbWF4TGV2ZWwsXG4gICAgICBhbGxSb3dzXG4gICAgfVxuICB9XG5cbiAgLy8g5Z+65pys5L+h5oGvXG4gIGZ1bmN0aW9uIF9nZXRCYXNlSW5mbyAocHJldmlld0JveCkge1xuICAgIGxldCBiYXNlSW5mbyA9IHtcbiAgICAgIHlhcGlVcmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgbmFtZTogbnVsbCwgLy8g5o6l5Y+j5ZCN56ewXG4gICAgICBtZXRob2Q6IG51bGwsIC8vIOivt+axguaWueW8j1xuICAgICAgYXBpVXJsOiBudWxsLCAvLyDmjqXlj6PlnLDlnYBcbiAgICB9XG4gICAgY29uc3Qgcm93cyA9IHByZXZpZXdCb3gucXVlcnlTZWxlY3RvckFsbCgnLnBhbmVsLXZpZXcgLmFudC1yb3cnKVxuICAgIC8vIOaOpeWPo+WQjeensOihjFxuICAgIGlmIChyb3dzWzBdKSB7XG4gICAgICBiYXNlSW5mby5uYW1lID0gcm93c1swXS5xdWVyeVNlbGVjdG9yKCcuY29sTmFtZScpLmlubmVyVGV4dCAgfHwgbnVsbFxuICAgIH1cbiAgICAvLyDmjqXlj6Pot6/lvoTooYxcbiAgICBpZiAocm93c1syXSkge1xuICAgICAgY29uc3QgY29sQXBpID0gcm93c1syXS5xdWVyeVNlbGVjdG9yKCcuY29sVmFsdWUnKVxuICAgICAgaWYgKGNvbEFwaSkge1xuICAgICAgICBjb25zdCBhcGlQYXRoQ29scyA9IGNvbEFwaS5xdWVyeVNlbGVjdG9yQWxsKCcuY29sVmFsdWUnKVxuICAgICAgICBiYXNlSW5mby5tZXRob2QgPSBhcGlQYXRoQ29sc1swXS5pbm5lclRleHQgfHwgbnVsbFxuICAgICAgICBiYXNlSW5mby5hcGlVcmwgPSBhcGlQYXRoQ29sc1sxXS5pbm5lclRleHQgfHwgbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmFzZUluZm9cbiAgfVxuXG4gIC8vIOW+queOr+S+v+WIqemhtemdouS4reeahOacquWxleW8gOWFg+e0oO+8jOaJvuWIsOWQjuWFqOmDqOWxleW8gOOAguagueaNrmFudC10YWJsZS1yb3ctY29sbGFwc2Vk57G75p2l5Yik5pat77ybXG4gIGZ1bmN0aW9uIF9vcGVuQ29sbGFwc2VkTm9kZSAobm9kZXMpIHtcbiAgICBpZiAobm9kZXMgJiYgbm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbm9kZS5jbGljaygpXG4gICAgICB9KVxuICAgIH0gXG4gIH1cblxuICBmdW5jdGlvbiBfZmlzdExldHRlclVwcGVyIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG4gIH1cblxufSJdLCJzb3VyY2VSb290IjoiIn0=