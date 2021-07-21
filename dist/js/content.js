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
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly95YXBpMnN0ci8uL2pzL2NvbnRlbnQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0EsWUFBWSxPQUFPO0FBQ25CLFlBQVksT0FBTztBQUNuQixZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQSx3QkFBd0I7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLG9CQUFvQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZUFBZTtBQUNmO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsaUJBQWlCLEdBQUcsU0FBUztBQUN0RCxLQUFLO0FBQ0wseUJBQXlCLGlCQUFpQixLQUFLLFNBQVM7QUFDeEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQixNQUFNO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEMiLCJmaWxlIjoianMvY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOaOpeWPl+ivt+axgu+8jOaVtOeQhuaVsOaNrlxuLyoqXG4gKiBAcGFyYW1zIHtvYmplY3R9IHJlcXVlc3Qg6K+35rGC5Y+C5pWwXG4gKiBAcGFyYW1zIHtvYmplY3R9IHNlbmRlciDor7fmsYLmlrlcbiAqIEBwYXJhbXMge2Z1bmN0aW9ufSBzZW5kUmVzcG9uc2Ug5ZGK6K+J6K+35rGC5pa557uT5p6cXG4gKi9cbmNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigocmVxdWVzdCwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpID0+IHtcbiAgY29uc29sZS5sb2coJ+iOt+WPluWAvO+8mu+8mu+8micpXG4gIGlmIChyZXF1ZXN0LmFjdGlvbiA9PT0gJ2dldERhdGEnKSB7XG4gICAgc2VuZFJlc3BvbnNlKHJ1bigpKVxuICB9XG59KVxuXG5mdW5jdGlvbiBydW4oKSB7XG4gIC8vIOaJvuWIsOaJgOacieiDveWxleW8gOeahOWFg+e0oFxuICBsZXQgY29sbGFwc2VkSWNvbnMgPSBudWxsXG4gIGNvbGxhcHNlZEljb25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFudC10YWJsZS1yb3ctY29sbGFwc2VkJylcbiAgd2hpbGUgKGNvbGxhcHNlZEljb25zICYmIGNvbGxhcHNlZEljb25zLmxlbmd0aCA+IDApIHtcbiAgICBfb3BlbkNvbGxhcHNlZE5vZGUoY29sbGFwc2VkSWNvbnMpXG4gICAgY29sbGFwc2VkSWNvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYW50LXRhYmxlLXJvdy1jb2xsYXBzZWQnKVxuICB9XG4gIFxuICAvLyDpooTop4jpnaLmnb9cbiAgY29uc3QgcHJldmlld0JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXNlQ29udGFpbmVyJylcbiAgaWYgKHByZXZpZXdCb3gpIHtcbiAgICBjb25zdCBiYXNlSW5mbyA9IF9nZXRCYXNlSW5mbyhwcmV2aWV3Qm94KVxuICAgIGNvbnN0IHRhYmxlSW5mbyA9IF9nZXRUYWJsZXNJbmZvKHByZXZpZXdCb3gpXG4gICAgcmV0dXJuIHtcbiAgICAgIGJhc2VJbmZvLFxuICAgICAgdGFibGVJbmZvXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8g5LiJ5LiqdGFibGXmlbDmja5cbiAgZnVuY3Rpb24gX2dldFRhYmxlc0luZm8gKHByZXZpZXdCb3gpIHtcbiAgICBsZXQgcGFyYW1zSGVhZGVyID0geyB0eXBlOiBudWxsIH1cbiAgICBsZXQgcGFyYW1zQm9keSA9IFtdXG4gICAgbGV0IHJldHVybkRhdGEgPSBbXVxuICAgIGxldCByZXN1bHRMZXZlbCA9IFtdXG4gICAgY29uc3QgdGFibGVzID0gcHJldmlld0JveC5xdWVyeVNlbGVjdG9yQWxsKCcuYW50LXRhYmxlLWJvZHknKVxuICAgIGlmICh0YWJsZXMpIHtcbiAgICAgIC8vIGhlYWRlcnPooajmoLxcbiAgICAgIGNvbnN0IGhlYWRlckJveCA9IHRhYmxlc1swXVxuICAgICAgY29uc3QgaGVhZGVyVGJvZHkgPSBoZWFkZXJCb3gucXVlcnlTZWxlY3RvcignLmFudC10YWJsZS10Ym9keScpXG4gICAgICAvLyDojrflj5bor7fmsYLlj4LmlbDnsbvlnovvvJvpnIDopoHmjpLpmaTmjonmmoLml6DmlbDmja5cbiAgICAgIGlmIChoZWFkZXJUYm9keS5pbm5lckhUTUwpIHtcbiAgICAgICAgY29uc3QgdGRzID0gaGVhZGVyVGJvZHkucXVlcnlTZWxlY3RvcignLmFudC10YWJsZS1yb3cnKS5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpXG4gICAgICAgIHBhcmFtc0hlYWRlci50eXBlID0gdGRzWzFdLmlubmVyVGV4dCB8fCBudWxsXG4gICAgICB9XG5cbiAgICAgIC8vIGJvZHnooajmoLxcbiAgICAgIGNvbnN0IGJvZHlCb3ggPSB0YWJsZXNbMV1cbiAgICAgIGNvbnN0IHJlc3VsdEJvZHkgPSBfZm9ybWF0Um93cyhib2R5Qm94KS5hbGxSb3dzXG4gICAgICBpZiAocmVzdWx0Qm9keSkge1xuICAgICAgICBwYXJhbXNCb2R5ID0gcmVzdWx0Qm9keVxuICAgICAgfVxuXG4gICAgICAvLyDov5Tlm57mlbDmja7ooajmoLxcbiAgICAgIGNvbnN0IHJlc3VsdEJveCA9IHRhYmxlc1syXVxuICAgICAgY29uc3QgcmVzdWx0ID0gX2Zvcm1hdFJvd3MocmVzdWx0Qm94KS5hbGxSb3dzXG4gICAgICBjb25zdCBsZXZlbERhdGEgPSBfZm9ybWF0Um93cyhyZXN1bHRCb3gpLmFsbERhdGFcbiAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuRGF0YSA9IHJlc3VsdFxuICAgICAgICByZXN1bHRMZXZlbCA9IGxldmVsRGF0YVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBoZWFkZXI6IHBhcmFtc0hlYWRlcixcbiAgICAgIGJvZHk6IHBhcmFtc0JvZHksXG4gICAgICByZXN1bHQ6IHJldHVybkRhdGEsXG4gICAgICByZXN1bHRMZXZlbFxuICAgIH1cbiAgfVxuXG4gIC8vIGJvZHnooajmoLzlkozov5Tlm57mlbDmja7ooajmoLzpg73mmK/lkIzmoLflpITnkIZcbiAgZnVuY3Rpb24gX2Zvcm1hdFJvd3MgKG5vZGVzKSB7XG4gICAgY29uc3QgdGJvZHkgPSBub2Rlcy5xdWVyeVNlbGVjdG9yKCcuYW50LXRhYmxlLXRib2R5JylcbiAgICBpZiAodGJvZHkuaW5uZXJIVE1MKSB7XG4gICAgICBjb25zdCByb3dzID0gdGJvZHkucXVlcnlTZWxlY3RvckFsbCgnLmFudC10YWJsZS1yb3cnKVxuICAgICAgaWYgKHJvd3MpIHtcbiAgICAgICAgY29uc3QgeyBtYXhMZXZlbCwgYWxsUm93cyB9ID0gX3Jlc3RydWN0dXJlKHJvd3MpXG4gICAgICAgIGlmIChtYXhMZXZlbCA+IDQpIHtcbiAgICAgICAgICBhbGVydCgn5bey57uP6LaF6L+H6K6+572u5pyA5aSn5bGC57qn77yM5LiN57un57ut5LqGJylcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICBsZXQgYWxsRGF0YSA9IFtdXG4gICAgICAgIGFsbFJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgIGlmIChyb3cubGV2ZWwgPT09IDApIHtcbiAgICAgICAgICAgIHJvdy5sZXZlbE5hbWUgPSByb3cubmFtZVxuICAgICAgICAgICAgYWxsRGF0YS5wdXNoKHJvdylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHJvdy5sZXZlbCA9PT0gMSkge1xuICAgICAgICAgICAgICBsZXQgZmlyc3QgPSBhbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV1cbiAgICAgICAgICAgICAgcm93LnBhcmVudCA9IGZpcnN0LmlkXG4gICAgICAgICAgICAgIHJvdy5wYXJlbnRMZW4gPSBmaXJzdC5jaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgICAgICAgZmlyc3QuY2hpbGRyZW4ucHVzaChfc2V0TGV2ZWxOYW1lKHJvdywgZmlyc3QpKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgaWYgKHJvdy5sZXZlbCA9PT0gMikge1xuICAgICAgICAgICAgICAgIGxldCBzZWNvbmQgPSBhbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICAgICAgcm93LnBhcmVudCA9IHNlY29uZC5pZFxuICAgICAgICAgICAgICAgIHJvdy5wYXJlbnRMZW4gPSBzZWNvbmQuY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgICAgICAgICAgc2Vjb25kLmNoaWxkcmVuLnB1c2goX3NldExldmVsTmFtZShyb3csIHNlY29uZCkpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHJvdy5sZXZlbCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgbGV0IHRoaXJkID0gYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuLmxlbmd0aCAtIDFdLmNoaWxkcmVuLmxlbmd0aCAtIDFdXG4gICAgICAgICAgICAgICAgICByb3cucGFyZW50ID0gdGhpcmQuaWRcbiAgICAgICAgICAgICAgICAgIHJvdy5wYXJlbnRMZW4gPSB0aGlyZC5jaGlsZHJlbi5sZW5ndGhcbiAgICAgICAgICAgICAgICAgIHRoaXJkLmNoaWxkcmVuLnB1c2goX3NldExldmVsTmFtZShyb3csIHRoaXJkKSlcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaWYgKHJvdy5sZXZlbCA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZm91cnRoID0gYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuLmxlbmd0aCAtIDFdLmNoaWxkcmVuLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlblthbGxEYXRhW2FsbERhdGEubGVuZ3RoIC0gMV0uY2hpbGRyZW4ubGVuZ3RoIC0gMV0uY2hpbGRyZW5bYWxsRGF0YVthbGxEYXRhLmxlbmd0aCAtIDFdLmNoaWxkcmVuW2FsbERhdGFbYWxsRGF0YS5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXS5jaGlsZHJlbi5sZW5ndGggLSAxXVxuICAgICAgICAgICAgICAgICAgICByb3cucGFyZW50ID0gZm91cnRoLmlkXG4gICAgICAgICAgICAgICAgICAgIHJvdy5wYXJlbnRMZW4gPSBmb3VydGguY2hpbGRyZW4ubGVuZ3RoXG4gICAgICAgICAgICAgICAgICAgIGZvdXJ0aC5jaGlsZHJlbi5wdXNoKF9zZXRMZXZlbE5hbWUocm93LCBmb3VydGgpKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhbGxSb3dzLFxuICAgICAgICAgIGFsbERhdGFcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICAvLyDorr7nva7lr7zlh7rnmoTlsYLnuqflkI3or41cbiAgZnVuY3Rpb24gX3NldExldmVsTmFtZSAocm93LCBwYXJlbnQpIHtcbiAgICBpZiAocGFyZW50LnR5cGUgPT09ICdPYmplY3QnKSB7XG4gICAgICByb3cubGV2ZWxOYW1lID0gYCR7cGFyZW50LmxldmVsTmFtZX0uJHtyb3cubmFtZX1gXG4gICAgfSBlbHNlIGlmIChwYXJlbnQudHlwZSA9PT0gJ09iamVjdCBbXScpIHtcbiAgICAgIHJvdy5sZXZlbE5hbWUgPSBgJHtwYXJlbnQubGV2ZWxOYW1lfVtdLiR7cm93Lm5hbWV9YFxuICAgIH1cbiAgICByZXR1cm4gcm93XG4gIH1cblxuICAvLyDlsIbmlbDmja7miYHlubPljJblpITnkIbvvIzlpITnkIbmiJDmjIflrprmoLzlvI9cbiAgZnVuY3Rpb24gX3Jlc3RydWN0dXJlIChyb3dzKSB7XG4gICAgbGV0IG1heExldmVsID0gMFxuICAgIGxldCBhbGxSb3dzID0gW11cbiAgICByb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgIGNvbnN0IHRkcyA9IHJvdy5xdWVyeVNlbGVjdG9yQWxsKCd0ZCcpXG4gICAgICAvLyDlpoLmnpzmsqHmnInlkI3np7DlsLHot7Pov4dcbiAgICAgIGlmICghdGRzWzBdLmlubmVyVGV4dCkgcmV0dXJuXG4gICAgICBsZXQgdGVtcE9iaiA9IHtcbiAgICAgICAgaWQ6IGByb3cke2luZGV4fWAsXG4gICAgICAgIG5hbWU6IHRkc1swXS5pbm5lclRleHQgfHwgbnVsbCxcbiAgICAgICAgdHlwZTogdGRzWzFdLmlubmVyVGV4dCA/IF9maXN0TGV0dGVyVXBwZXIodGRzWzFdLmlubmVyVGV4dCkgOiBudWxsLFxuICAgICAgICByZXF1aXJlOiB0ZHNbMl0uaW5uZXJUZXh0IHx8IG51bGwsXG4gICAgICAgIGRlZmF1bHRWYWw6IHRkc1szXS5pbm5lclRleHQgfHwgbnVsbCxcbiAgICAgICAgcmVtYXJrOiB0ZHNbNF0uaW5uZXJUZXh0IHx8IG51bGwsXG4gICAgICAgIG90aGVyOiAgKHRkc1s1XSAmJiB0ZHNbNV0uaW5uZXJUZXh0KSB8fCBudWxsLCAvLyDmmoLml7bmsqHnlKhcbiAgICAgICAgbGV2ZWw6IG51bGwsIC8vIOWxgue6p1xuICAgICAgICBjaGlsZHJlbjogW10sXG4gICAgICAgIHBhcmVudDogJycsXG4gICAgICAgIGxldmVsTmFtZTogJydcbiAgICAgIH1cbiAgICAgIGNvbnN0IGxldmVsQ2xhc3MgPSByb3cuY2xhc3NMaXN0WzFdXG4gICAgICBpZiAodHlwZW9mIGxldmVsQ2xhc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRlbXBPYmoubGV2ZWwgPSBwYXJzZUludChsZXZlbENsYXNzLnN1YnN0cmluZyhsZXZlbENsYXNzLmxhc3RJbmRleE9mKCctJykgKyAxKSlcbiAgICAgICAgLy8g55So5p2l5q+U6L6D5piv5ZCm6LaF6L+H5pyA5aSn5bGC57qnXG4gICAgICAgIGlmICh0ZW1wT2JqLmxldmVsID4gbWF4TGV2ZWwpIHtcbiAgICAgICAgICBtYXhMZXZlbCA9IHRlbXBPYmoubGV2ZWxcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWxsUm93cy5wdXNoKHRlbXBPYmopXG4gICAgfSlcbiAgICByZXR1cm4ge1xuICAgICAgbWF4TGV2ZWwsXG4gICAgICBhbGxSb3dzXG4gICAgfVxuICB9XG5cbiAgLy8g5Z+65pys5L+h5oGvXG4gIGZ1bmN0aW9uIF9nZXRCYXNlSW5mbyAocHJldmlld0JveCkge1xuICAgIGxldCBiYXNlSW5mbyA9IHtcbiAgICAgIHlhcGlVcmw6IHdpbmRvdy5sb2NhdGlvbi5ocmVmLFxuICAgICAgbmFtZTogbnVsbCwgLy8g5o6l5Y+j5ZCN56ewXG4gICAgICBtZXRob2Q6IG51bGwsIC8vIOivt+axguaWueW8j1xuICAgICAgYXBpVXJsOiBudWxsLCAvLyDmjqXlj6PlnLDlnYBcbiAgICB9XG4gICAgY29uc3Qgcm93cyA9IHByZXZpZXdCb3gucXVlcnlTZWxlY3RvckFsbCgnLnBhbmVsLXZpZXcgLmFudC1yb3cnKVxuICAgIC8vIOaOpeWPo+WQjeensOihjFxuICAgIGlmIChyb3dzWzBdKSB7XG4gICAgICBiYXNlSW5mby5uYW1lID0gcm93c1swXS5xdWVyeVNlbGVjdG9yKCcuY29sTmFtZScpLmlubmVyVGV4dCAgfHwgbnVsbFxuICAgIH1cbiAgICAvLyDmjqXlj6Pot6/lvoTooYxcbiAgICBpZiAocm93c1syXSkge1xuICAgICAgY29uc3QgY29sQXBpID0gcm93c1syXS5xdWVyeVNlbGVjdG9yKCcuY29sVmFsdWUnKVxuICAgICAgaWYgKGNvbEFwaSkge1xuICAgICAgICBjb25zdCBhcGlQYXRoQ29scyA9IGNvbEFwaS5xdWVyeVNlbGVjdG9yQWxsKCcuY29sVmFsdWUnKVxuICAgICAgICBiYXNlSW5mby5tZXRob2QgPSBhcGlQYXRoQ29sc1swXS5pbm5lclRleHQgfHwgbnVsbFxuICAgICAgICBiYXNlSW5mby5hcGlVcmwgPSBhcGlQYXRoQ29sc1sxXS5pbm5lclRleHQgfHwgbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYmFzZUluZm9cbiAgfVxuXG4gIC8vIOW+queOr+S+v+WIqemhtemdouS4reeahOacquWxleW8gOWFg+e0oO+8jOaJvuWIsOWQjuWFqOmDqOWxleW8gOOAguagueaNrmFudC10YWJsZS1yb3ctY29sbGFwc2Vk57G75p2l5Yik5pat77ybXG4gIGZ1bmN0aW9uIF9vcGVuQ29sbGFwc2VkTm9kZSAobm9kZXMpIHtcbiAgICBpZiAobm9kZXMgJiYgbm9kZXMubGVuZ3RoID4gMCkge1xuICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgbm9kZS5jbGljaygpXG4gICAgICB9KVxuICAgIH0gXG4gIH1cblxuICBmdW5jdGlvbiBfZmlzdExldHRlclVwcGVyIChzdHIpIHtcbiAgICByZXR1cm4gc3RyLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKDEpXG4gIH1cblxufSJdLCJzb3VyY2VSb290IjoiIn0=