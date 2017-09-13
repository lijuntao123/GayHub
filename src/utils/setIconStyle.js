import icons from '../icons.json'
import { $, $$ } from 'utils/getDom'
import {
    generateCurrentTreeDOM,
    getCurrentTreeFiles,
    RenderDOM
} from 'utils/sideBarHelp'


const iconDefinitions = icons.iconDefinitions,
    folderNames = icons.folderNames,
    folderNamesExpanded = icons.folderNamesExpanded,
    iconNames = Object.assign(icons.fileExtensions, icons.fileNames, icons.languageIds)

/* 设置所有图标样式 */
const setIconCss = function(ele, iconELe) {

    let oPath = {}
    let typeName = ele.path.split('/').pop().toLocaleLowerCase()

    if (ele.type === 'tree') {

        oPath = folderNames.hasOwnProperty(typeName) ?
            iconDefinitions[folderNames[typeName]].iconPath : 'icons/folder.png'

    } else {

        if (iconNames.hasOwnProperty(typeName)) {

            oPath = iconDefinitions[iconNames[typeName]].iconPath

        } else {

            if (typeName.split('.').length >= 3) {

                let typeName1 = typeName.split('.').shift()
                let typeName2 = typeName.split('.').pop()
                typeName = `${typeName1}.${typeName2}`
                if (iconNames.hasOwnProperty(typeName)) {
                    oPath = iconDefinitions[iconNames[typeName]].iconPath
                } else {
                    oPath = iconNames.hasOwnProperty(typeName2) ?
                        iconDefinitions[iconNames[typeName2]].iconPath : 'icons/file.png'
                }

            } else {
                typeName = ele.path.split('.').pop().toLocaleLowerCase()
                oPath = iconNames.hasOwnProperty(typeName) ?
                    iconDefinitions[iconNames[typeName]].iconPath : 'icons/file.png'
            }

        }

    }

    let bgcUrl = chrome.extension.getURL(`${oPath}`)
    iconELe.style.cssText = `background: url(${bgcUrl});
    background-size: cover;`
}


/* 监听URL变化，改变侧边栏对应的样式变化 */
const urlChangeEvent = function(files) {

    const fileWrap = document.$$('.file-wrap,.file')

    if (fileWrap.length) {

        $('div[role=main]').addEventListener('click', e => {

            if (e.target.nodeName === 'A' && !e.target.getAttribute('data-pjax')) {
                const href = e.target.href

                let sideBarWrap = $('.side-bar-wrap')

                let eleAs = sideBarWrap.$$('a')

                let targetA = ''

                for (let ele of eleAs) {
                    if (ele.getAttribute('data-href') === href) {
                        targetA = ele
                        break
                    }
                }

                let sideBarContainer = $('.side-bar-main')

                let eleMainA = sideBarContainer.$$('a')
                if (eleMainA.length) {
                    eleMainA.forEach(ele => {
                        ele.setAttribute('isClicked', false)
                    })
                }


                if (targetA) {

                    let targetLi = targetA.parentNode
                    let ele = { path: targetLi.getAttribute('path') }

                    /* 点击gitub页面文件目录重新渲染侧边栏的DOM */
                    if (targetLi.getAttribute('type') === 'tree') {
                        RenderDOM(targetLi, ele, files)
                    }

                    if (targetA.getAttribute('type') === 'blob') {
                        targetA.setAttribute('isClicked', true)
                    } else {
                        setTimeout(f => {
                            targetA.parentNode.setAttribute('onoff', 'on')
                        }, 1000)

                    }
                }

            }
        }, false)
    }

}

const toggleBtn = function() {
    let oBtn = $('.toggle-btn'),
        sideBarWrap = $('.side-bar-wrap'),
        rootHtml = $('html')

    oBtn.addEventListener('click', e => {

        let contentMain = $('.repository-content'),
            react = contentMain.getBoundingClientRect().left,
            onoff = sideBarWrap.getAttribute('toggle') === 'off' ? 'on' : 'off'

        if (onoff == 'on') {
            rootHtml.style.marginLeft = Math.max((370 - react), 0) + 'px'

        } else {

            let TOCWrap = $('.table-of-content-wrap')
            let currentStyle = TOCWrap ? window.getComputedStyle(TOCWrap, null)['display'] : 'none'

            if (TOCWrap && (TOCWrap.getAttribute('toggle') === 'on') && currentStyle == 'block') {

                rootHtml.style.marginLeft = -Math.max((420 - react), 0) + 'px'

            } else {

                rootHtml.style.marginLeft = 0 + 'px'

            }

        }

        sideBarWrap.setAttribute('toggle', onoff)
    }, false)
}

const setClickBlobCss = function(hrefA) {

    hrefA.addEventListener('click', e => {
        let sideBarWrap = $('.side-bar-main')

        let eleA = sideBarWrap.$$('a')

        if (eleA.length) {
            eleA.forEach(ele => {
                ele.setAttribute('isClicked', false)
            })
        }

        hrefA.setAttribute('isClicked', true)
    }, false)
}


/* 点击时候样式的变化 */
const setClickTreeCss = function(eleLi, ele, child, files) {

    eleLi.addEventListener('click', e => {
        e.stopPropagation()
        if (e.target.getAttribute('type') === 'blob') {
            return
        }

        let onoff = eleLi.getAttribute('onoff') === 'on' ? 'off' : 'on'

        eleLi.setAttribute('onoff', onoff)

        let sideBarWrap = $('.side-bar-main')
        let oPath = {}
        let typeName = ele.path.split('/').pop().toLocaleLowerCase()

        if (onoff === 'off') {
            oPath = folderNames.hasOwnProperty(typeName) ?
                iconDefinitions[folderNames[typeName]].iconPath : 'icons/folder.png'
        } else {
            oPath = folderNamesExpanded.hasOwnProperty(typeName) ?
                iconDefinitions[folderNamesExpanded[typeName]].iconPath : 'icons/folder-outline.png'
        }

        let bgcUrl = chrome.extension.getURL(`${oPath}`)
        child.style.cssText = `background: url(${bgcUrl});
        background-size: cover;`

        setTimeout(() => {
            RenderDOM(eleLi, ele, files)
        }, 300)


    }, false)
}

export {
    setIconCss,
    setClickTreeCss,
    setClickBlobCss,
    toggleBtn,
    urlChangeEvent
}