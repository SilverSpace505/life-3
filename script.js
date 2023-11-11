var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")

var n = 500
var dt = 0.02
var frictionHalfLife = 0.040
var rMax = 10
var m = 8
var matrix = makeRandomMatrix()
var forceFactor = 2
var cameraSpeed = 0.1
var camera = {x: 0, y: 0, z: -15}
var beta = 0.1
var border = 10

var frictionFactor = Math.pow(0.5, dt / frictionHalfLife)

function explode(time=2) {
	forceFactor /= 10
	let oldMatrix = JSON.parse(JSON.stringify(matrix))
	for (let i in matrix) {
		for (let j in matrix[i]) {
			matrix[i][j] = -1
		}
	}
	setTimeout(() => {
		forceFactor *= 10
		matrix = oldMatrix
	}, time*1000)
}

function implode(time=2) {
	forceFactor /= 1000
	rMax *= 100
	beta /= 10
	let oldMatrix = JSON.parse(JSON.stringify(matrix))
	for (let i in matrix) {
		for (let j in matrix[i]) {
			matrix[i][j] = 1
		}
	}
	setTimeout(() => {
		forceFactor *= 1000
		rMax /= 100
		beta *= 10
		matrix = oldMatrix
	}, time*1000)
}

function seperate(time=2) {
	forceFactor /= 100
	rMax *= 10
	let oldMatrix = JSON.parse(JSON.stringify(matrix))
	for (let i in matrix) {
		for (let j in matrix[i]) {
			if (i == j) {
				matrix[i][j] = 1
			} else {
				matrix[i][j] = 0
			}

		}
	}
	setTimeout(() => {
		forceFactor *= 100
		rMax /= 10
		matrix = oldMatrix
	}, time*1000)
}

function spawn() {
	for (let i in positionsX) {
		positionsX[i] = (Math.random() * 2 - 1) * 1
		positionsY[i] = (Math.random() * 2 - 1) * 1
		positionsZ[i] = (Math.random() * 2 - 1) * 1
		veloctitiesX[i] = 0
		veloctitiesY[i] = 0
		veloctitiesZ[i] = 0
	}
}

function makeRandomMatrix() {
	var rows = []
	for (let i = 0; i < m; i++) {
		var row = []
		for (let j = 0; j < m; j++) {
			row.push(Math.random() * 2 - 1)
		}
		rows.push(row)
	}
	return rows
}

var colours = new Int32Array(n)
var positionsX = new Float32Array(n)
var positionsY = new Float32Array(n)
var positionsZ = new Float32Array(n)
var veloctitiesX = new Float32Array(n)
var veloctitiesY = new Float32Array(n)
var veloctitiesZ = new Float32Array(n)
for (let i = 0; i < n; i++) {
	colours[i] = Math.floor(Math.random()*m)
	positionsX[i] = Math.random() * 2 - 1
	positionsY[i] = Math.random() * 2 - 1
	positionsZ[i] = Math.random() * 2 - 1
	veloctitiesX[i] = 0
	veloctitiesY[i] = 0
	veloctitiesZ[i] = 0
}

function force(r, a) {
	if (r < beta) {
		return r / beta - 1
	} else if (beta < r && r < 1) {
		return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta))
	} else {
		return 0
	}
}

function updateParticles() {

	// update velocities
	for (let i = 0; i < n; i++) {
		let totalForceX = 0
		let totalForceY = 0
		let totalForceZ = 0

		for (let j = 0; j < n; j++) {
			if (j === i) { continue }
			var rx = positionsX[j] - positionsX[i]
			var ry = positionsY[j] - positionsY[i]
			var rz = positionsZ[j] - positionsZ[i]
			var r = Math.sqrt(rx*rx + ry*ry + rz*rz)
			if (r > 0 && r < rMax) {
				var f = force(r / rMax, matrix[colours[i]][colours[j]])
				totalForceX += rx / r * f
				totalForceY += ry / r * f
				totalForceZ += rz / r * f
			}
		}

		totalForceX *= rMax * forceFactor
		totalForceY *= rMax * forceFactor
		totalForceZ *= rMax * forceFactor

		veloctitiesX[i] *= frictionFactor
		veloctitiesY[i] *= frictionFactor
		veloctitiesZ[i] *= frictionFactor

		veloctitiesX[i] += totalForceX * dt
		veloctitiesY[i] += totalForceY * dt
		veloctitiesZ[i] += totalForceZ * dt
	}

	// update positions
	for (let i = 0; i < n; i++) {

		positionsX[i] += veloctitiesX[i] * dt
		positionsY[i] += veloctitiesY[i] * dt
		positionsZ[i] += veloctitiesZ[i] * dt

		veloctitiesX[i] -= positionsX[i] / (border / 2)
		veloctitiesY[i] -= positionsY[i] / (border / 2)
		veloctitiesZ[i] -= positionsZ[i] / (border / 2)


		// let dx = Math.sqrt(positionsX[i]**2 + positionsY[i]**2 + positionsZ[i]**2) 
		// if (dx > border) {
		//     positionsX[i] -= veloctitiesX[i] * dt

		//     veloctitiesX[i] -= dx
		// }



		// if (Math.sqrt(positionsX[i]**2 + positionsY[i]**2 + positionsZ[i]**2) > border) {
		//     positionsY[i] -= veloctitiesY[i] * dt
		// }



		// if (Math.sqrt(positionsX[i]**2 + positionsY[i]**2 + positionsZ[i]**2) > border) {
		//     positionsZ[i] -= veloctitiesZ[i] * dt
		// }
	}
}


function loop() {

	let min = window.innerWidth
	if (window.innerHeight < min) {
		min = window.innerHeight
	}

	canvas.width = min
	canvas.height = min

	canvas.style.left = window.innerWidth/2 - min/2
	canvas.style.top = window.innerHeight/2 - min/2

	updateParticles() 

	if (keys["KeyW"]) {
		camera.z += cameraSpeed
	}
	if (keys["KeyS"]) {
		camera.z -= cameraSpeed
	}
	if (keys["KeyA"]) {
		camera.x -= cameraSpeed
	}
	if (keys["KeyD"]) {
		camera.x += cameraSpeed
	}
	if (keys["Space"]) {
		camera.y -= cameraSpeed
	}
	if (keys["ShiftLeft"]) {
		camera.y += cameraSpeed
	}

	var totalX = 0
	var totalY = 0
	var leastZ = 0
	var totalZ = 0
	for (let i in positionsX) {
		totalX += positionsX[i]
		totalY += positionsY[i]
		totalZ += positionsZ[i]
		if (positionsZ[i] < leastZ) {
			leastZ = positionsZ[i]
		}
	}
	// camera.x += (totalX/positionsX.length - camera.x) / 15
	// camera.y += (totalY/positionsY.length - camera.y) / 15
	// camera.z += (totalZ/positionsZ.length-15 - camera.z) / 15

	// draw particles
	ctx.fillStyle = "black"
	ctx.fillRect(0, 0, canvas.width, canvas.height)

	for (let i = 0; i < n; i++) {
		if (positionsZ[i]-camera.z < -2) {
			continue
		}
		ctx.beginPath()
		var f = 1 / ((positionsZ[i]-camera.z) + 2)
		var screenX = (f * (positionsX[i]-camera.x) + 1) * 0.5 * canvas.width
		var screenY = (f * (positionsY[i]-camera.y) + 1) * 0.5 * canvas.height
		let size = -positionsZ[i] + camera.z
		if (size < 1) {
			size = 1
		}
		if (size > 5) {
			size = 5
		}
		ctx.arc(screenX, screenY, size + 1, 0, 2 * Math.PI)
		ctx.fillStyle = `hsl(${360 * (colours[i] / m)},100%,50%)`
		ctx.fill()
	}

	requestAnimationFrame(loop)
}

requestAnimationFrame(loop)

var keys = {}

addEventListener("keydown", (event) => {
	keys[event.code] = true
})

addEventListener("keyup", (event) => {
	delete keys[event.code]
})