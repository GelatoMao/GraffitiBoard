// 设置绘画上下文
let canvas = document.getElementById('graffiti-board')
let ctx = canvas.getContext('2d');

let colorList = document.getElementsByClassName('color-item')
let brush = document.getElementById('brush')
let eraser = document.getElementById('eraser')
let reSetCanvas = document.getElementById('clear')
let undo = document.getElementById('undo')
let download = document.getElementById('download')
let range = document.getElementById('range')
let buttonList = document.getElementsByTagName('button')

// 初始默认颜色为黑色
let activeColor = 'black'
// 设置橡皮擦初始状态
let clear = false
// 设置线条初始宽度为4
let lWidth = 4
// 记录画笔的每一步
let historyData = []


autoSetSize()
setCanvasBg('white')
listenToUser(canvas)
getColor()

// window.onbeforeunload = function () {
//   return "Reload Site?"
// }

// 设置涂鸦板大小
function autoSetSize() {
  canvasSetSize()
  window.onresize = function () {
    canvasSetSize()
  }
}

function canvasSetSize() {
  // 获取可视宽大小
  const pageWidth = document.documentElement.clientWidth
  const pageHeight = document.documentElement.clientHeight
  canvas.width = pageWidth
  canvas.height = pageHeight
}

// 设置涂鸦板背景
function setCanvasBg(color) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

// 监听用户事件
function listenToUser(canvas) {
  // 定义画笔是否在画
  let painting = false
  let lastPoint = { x: undefined, y: undefined }

  // 检测是否支持触屏
  if (document.body.ontouchstart !== undefined) {
    canvas.ontouchstart = function (e) {
      // 在这里储存绘图表面
      this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height)
      saveData(this.firstDot)
      painting = true
      let x = e.touches[0].clientX
      let y = e.touches[0].clientY
      lastPoint = { "x": x, "y": y }
      ctx.save()
      drawCircle(x, y, 0)
    }
    canvas.ontouchmove = function (e) {
      if (painting) {
        let x = e.touches[0].clientX
        let y = e.touches[0].clientY
        let newPoint = { "x": x, "y": y }
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y)
        lastPoint = newPoint
      }
    }
    canvas.ontouchend = function () {
      painting = false
    }
  } else {
    canvas.onmousedown = function (e) {
      this.firstDot = ctx.getImageData(0, 0, canvas.width, canvas.height)
      saveData(this.firstDot)
      painting = true
      let x = e.clientX
      let y = e.clientY
      lastPoint = { "x": x, "y": y }
      ctx.save()
      drawCircle(x, y, 0)
    }
    canvas.onmousemove = function (e) {
      if (painting) {
        let x = e.clientX
        let y = e.clientY
        let newPoint = { "x": x, "y": y }
        drawLine(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y, clear)
        // 移动过程需要实时更新 让上一次的值立马等于这次的坐标
        lastPoint = newPoint
      }
    }
    canvas.onmouseup = function () {
      painting = false
    }
    canvas.mouseleave = function () {
      painting = false
    }
  }
}

// 画点函数 画圆
function drawCircle(x, y, radius) {
  ctx.save()
  ctx.beginPath()
  // 画圆
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  if (clear) {
    ctx.clip()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  }
}

// 画线函数
function drawLine(x1, y1, x2, y2) {
  ctx.lineWidth = lWidth
  // 解决连接不连续问题
  ctx.lineCap = "round"
  // 节点的连接是圆的
  ctx.lineJoin = "round"
  if (clear) {
    ctx.save()
    ctx.globalCompositeOperation = "destination-out"
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
    ctx.clip()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
  } else {
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    ctx.closePath()
  }
}

// 获取用户选取颜色
function getColor() {
  for (let i = 0; i < colorList.length; i++) {
    colorList[i].onclick = function () {
      for (let j = 0; j < colorList.length; j++) {
        colorList[j].classList.remove('active')
      }
      this.classList.add('active')
      activeColor = this.style.backgroundColor
      ctx.fillStyle = activeColor
      ctx.strokeStyle = activeColor
    }
  }
}

// 排他函数
function handleButtonClick(obj) {
  for (let i = 0; i < buttonList.length; i++) {
    buttonList[i].classList.remove('active')
  }
  obj.classList.add('active')
}

function saveData(data) {
  // 上限为储存10步 如果超出 则将存储的第一步删除
  historyData.length === 10 && historyData.shift()
  historyData.push(data)
}

range.onchange = function () {
  lWidth = this.value
}

eraser.onclick = function () {
  clear = true
  handleButtonClick(this)
}

brush.onclick = function () {
  clear = false
  handleButtonClick(this)
}

reSetCanvas.onclick = function () {
  handleButtonClick(this)
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  setCanvasBg('white')
}

undo.onclick = function () {
  handleButtonClick(this)
  if (historyData.length < 1) return false
  ctx.putImageData(historyData[historyData.length - 1], 0, 0)
  historyData.pop()
}

download.onclick = function () {
  handleButtonClick(this)
  let imgUrl = canvas.toDataURL("image/png")
  let saveA = document.createElement("a")
  document.body.appendChild(saveA)
  saveA.href = imgUrl
  saveA.download = (new Date).getTime()
  saveA.target = "_blank"
  saveA.click()
}


