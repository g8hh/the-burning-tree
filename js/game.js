var player;
var needCanvasUpdate = true;
var NaNalert = false;
var gameEnded = false;


let modInfo = {
	name: "The Burning Tree",
	id: "uptake-theburningtree",
	pointsName: "embers",
	discordName: "",
	discordLink: "",
	changelogLink: "https://github.com/thefinaluptake/The-Burning-Tree/blob/master/changelog.md",
	offlineLimit: 1  // In hours
}

// Set your version in num and name, but leave the tmt values so people know what version it is
let VERSION = {
	num: "0.0.1",
	name: "Initial Release",
	tmtNum: "2.0",
	tmtName: "Pinnacle of Achievement Mountain"
}

// Determines if it should show points/sec
function canGenPoints(){
	return player.flame.strength > 0
}

// Calculate points/sec!
function getPointGen() {
	if (canGenPoints()) {
		var pointGen = new Decimal(4)
		pointGen = pointGen.mul(getFlameStrength())
		return pointGen
	} else return new Decimal(0)
}

// Get flame strength
function getFlameStrength() {
	var strength = player.flame.strength
	if (hasUpgrade("p", 12)) {
		strength = strength.mul(upgradeEffect("p", 12))
	}
	return strength
}

// Get flame depletion
function getFlameDepletion() {
	var depletion = new Decimal(0.2)
	if (hasUpgrade("p", 11)) {
		depletion = depletion.div(2)
	}
	if (hasUpgrade("p", 22)) {
		depletion = depletion.div(upgradeEffect("p", 22))
	}
	return depletion
}


function getResetGain(layer, useType = null) {
	let type = useType
	if (!useType) type = layers[layer].type
	if(tmp[layer].type == "none")
		return new Decimal (0)
	if (tmp[layer].gainExp.eq(0)) return new Decimal(0)
	if (type=="static") {
		if ((!layers[layer].canBuyMax()) || tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(1)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).div(tmp[layer].gainMult).max(1).log(layers[layer].base).times(tmp[layer].gainExp).pow(Decimal.pow(layers[layer].exponent, -1))
		return gain.floor().sub(player[layer].points).add(1).max(1);
	} else if (type=="normal"){
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return new Decimal(0)
		let gain = tmp[layer].baseAmount.div(tmp[layer].requires).pow(layers[layer].exponent).times(tmp[layer].gainMult).pow(tmp[layer].gainExp)
		if (gain.gte("e1e7")) gain = gain.sqrt().times("e5e6")
		return gain.floor().max(0);
	} else if (type=="custom"){
		return layers[layer].getResetGain()
	} else {
		return new Decimal(0)
	}
}

function getNextAt(layer, canMax=false, useType = null) {
	let type = useType
	if (!useType) type = layers[layer].type
	if(tmp[layer].type == "none")
		return new Decimal (Infinity)

	if (tmp[layer].gainMult.lte(0)) return new Decimal(Infinity)
	if (tmp[layer].gainExp.lte(0)) return new Decimal(Infinity)

	if (type=="static") 
	{
		if (!layers[layer].canBuyMax()) canMax = false
		let amt = player[layer].points.plus((canMax&&tmp[layer].baseAmount.gte(tmp[layer].nextAt))?tmp[layer].resetGain:0)
		let extraCost = Decimal.pow(layers[layer].base, amt.pow(tmp[layer].exponent).div(tmp[layer].gainExp)).times(tmp[layer].gainMult)
		let cost = extraCost.times(tmp[layer].requires).max(tmp[layer].requires)
		if (layers[layer].roundUpCost) cost = cost.ceil()
		return cost;
	} else if (type=="normal"){
		let next = tmp[layer].resetGain.add(1)
		if (next.gte("e1e7")) next = next.div("e5e6").pow(2)
		next = next.root(tmp[layer].gainExp).div(tmp[layer].gainMult).root(tmp[layer].exponent).times(tmp[layer].requires).max(tmp[layer].requires)
		if (layers[layer].roundUpCost) next = next.ceil()
		return next;
	} else if (type=="custom"){
		return layers[layer].getNextAt(canMax)
	} else {
		return new Decimal(0)
	}}

// Return true if the layer should be highlighted. By default checks for upgrades only.
function shouldNotify(layer){
	for (id in layers[layer].upgrades){
		if (!isNaN(id)){
			if (canAffordUpgrade(layer, id) && !hasUpgrade(layer, id) && tmp[layer].upgrades[id].unlocked){
				return true
			}
		}
	}

	if (layers[layer].shouldNotify){
		return layers[layer].shouldNotify()
	}
	else 
		return false
}

function canReset(layer)
{
	if(tmp[layer].type == "normal")
		return tmp[layer].baseAmount.gte(tmp[layer].requires)
	else if(tmp[layer].type== "static")
		return tmp[layer].baseAmount.gte(tmp[layer].nextAt) 
	if(tmp[layer].type == "none")
		return false
	else
		return layers[layer].canReset()
}

function rowReset(row, layer) {
	for (lr in ROW_LAYERS[row]){
		if(layers[lr].doReset) {
			player[lr].activeChallenge = null // Exit challenges on any row reset on an equal or higher row
			layers[lr].doReset(layer)
		}
		else
			if(layers[layer].row > layers[lr].row && row !== "side") layerDataReset(lr)
	}
}

function layerDataReset(layer, keep = []) {
	let storedData = {}

	for (thing in keep) {
		if (player[layer][keep[thing]] !== undefined)
			storedData[keep[thing]] = player[layer][keep[thing]]
	}
	console.log(storedData)

	player[layer] = layers[layer].startData();
	player[layer].upgrades = []
	player[layer].milestones = []
	player[layer].challenges = []
	resetBuyables(layer)

	for (thing in storedData) {
		player[layer][thing] =storedData[thing]
	}
}

function resetBuyables(layer){
	if (layers[layer].buyables) 
		player[layer].buyables = getStartBuyables(layer)
	player[layer].spentOnBuyables = new Decimal(0)
}


function addPoints(layer, gain) {
	player[layer].points = player[layer].points.add(gain).max(0)
	if (player[layer].best) player[layer].best = player[layer].best.max(player[layer].points)
	if (player[layer].total) player[layer].total = player[layer].total.add(gain)
}

function generatePoints(layer, diff) {
	addPoints(layer, tmp[layer].resetGain.times(diff))
}

var prevOnReset

function doReset(layer, force=false) {
	let row = layers[layer].row
	if (!force) {
		if (tmp[layer].baseAmount.lt(tmp[layer].requires)) return;
		let gain = tmp[layer].resetGain
		if (layers[layer].type=="static") {
			if (tmp[layer].baseAmount.lt(tmp[layer].nextAt)) return;
			gain =(layers[layer].canBuyMax() ? gain : 1)
		} 
		if (layers[layer].type=="custom") {
			if (!tmp[layer].canReset) return;
		} 

		if (layers[layer].onPrestige)
			layers[layer].onPrestige(gain)
		
		addPoints(layer, gain)
		updateMilestones(layer)
		updateAchievements(layer)

		if (!player[layer].unlocked) {
			player[layer].unlocked = true;
			needCanvasUpdate = true;

			if (layers[layer].increaseUnlockOrder){
				lrs = layers[layer].increaseUnlockOrder
				for (lr in lrs)
					if (!player[lrs[lr]].unlocked) player[lrs[lr]].unlockOrder++
			}
		}
	
		tmp[layer].baseAmount = new Decimal(0) // quick fix
	}

	if (tmp[layer].resetsNothing) return


	for (layerResetting in layers) {
		if (row >= layers[layerResetting].row && (!force || layerResetting != layer)) completeChallenge(layerResetting)
	}

	prevOnReset = {...player} //Deep Copy
	player.points = new Decimal(0)
	player.flame.strength = player.flame.startingStrength

	for (let x = row; x >= 0; x--) rowReset(x, layer)
	rowReset("side", layer)
	prevOnReset = undefined

	updateTemp()
	updateTemp()
}

function resetRow(row) {
	if (prompt('Are you sure you want to reset this row? It is highly recommended that you wait until the end of your current run before doing this! Type "I WANT TO RESET THIS" to confirm')!="I WANT TO RESET THIS") return
	let pre_layers = ROW_LAYERS[row-1]
	let layers = ROW_LAYERS[row]
	let post_layers = ROW_LAYERS[row+1]
	rowReset(row+1, post_layers[0])
	doReset(pre_layers[0], true)
	for (let layer in layers) {
		player[layers[layer]].unlocked = false
		if (player[layers[layer]].unlockOrder) player[layers[layer]].unlockOrder = 0
	}
	player.points = new Decimal(0)
	updateTemp();
	resizeCanvas();
}

function startChallenge(layer, x) {
	let enter = false
	if (!player[layer].unlocked) return
	if (player[layer].activeChallenge == x) {
		completeChallenge(layer, x)
		delete player[layer].activeChallenge
	} else {
		enter = true
	}	
	doReset(layer, true)
	if(enter) player[layer].activeChallenge = x

	updateChallengeTemp(layer)
}

function canCompleteChallenge(layer, x)
{
	if (x != player[layer].activeChallenge) return

	let challenge = layers[layer].challenges[x]

	if (challenge.currencyInternalName){
		let name = challenge.currencyInternalName
		if (challenge.currencyLayer){
			let lr = challenge.currencyLayer
			return !(player[lr][name].lt(readData(challenge.goal))) 
		}
		else {
			return !(player[name].lt(challenge.cost))
		}
	}
	else {
		return !(player[layer].points.lt(challenge.cost))
	}

}

function completeChallenge(layer, x) {
	var x = player[layer].activeChallenge
	if (!x) return
	if (! canCompleteChallenge(layer, x)){
		delete player[layer].activeChallenge
		return
	}
	if (player[layer].challenges[x] < tmp[layer].challenges[x].completionLimit) {
		needCanvasUpdate = true
		player[layer].challenges[x] += 1
		if (layers[layer].challenges[x].onComplete) layers[layer].challenges[x].onComplete()
	}
	delete player[layer].activeChallenge
	updateChallengeTemp(layer)
}

VERSION.withoutName = "v" + VERSION.num + (VERSION.pre ? " Pre-Release " + VERSION.pre : VERSION.pre ? " Beta " + VERSION.beta : "")
VERSION.withName = VERSION.withoutName + (VERSION.name ? ": " + VERSION.name : "")


const ENDGAME = new Decimal("e280000000");

function gameLoop(diff) {
	if (player.points.gte(ENDGAME) || gameEnded) gameEnded = 1

	if (isNaN(diff)) diff = 0
	if (gameEnded && !player.keepGoing) {
		diff = 0
		player.tab = "gameEnded"
	}
	if (player.devSpeed) diff *= player.devSpeed

	addTime(diff)
	
	if (player.flame.strength.gt(0)) {
		player.flame.strength = player.flame.strength.sub(getFlameDepletion().times(diff)).max(0)
	}

	player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
	for (layer in layers){
		if (layers[layer].update) layers[layer].update(diff);
	}

	for (layer in layers){
		if (layers[layer].automate) layers[layer].automate();
	}

	for (layer in layers){
		if (layers[layer].milestones) updateMilestones(layer);
		if (layers[layer].achievements) updateAchievements(layer)
	}

	if (player.hasNaN&&!NaNalert) {
		clearInterval(interval);
		player.autosave = false;
		NaNalert = true;

		alert("We have detected a corruption in your save. Please visit https://discord.gg/wwQfgPa for help.")
	}
}

function hardReset() {
	if (!confirm("Are you sure you want to do this? You will lose all your progress!")) return
	player = getStartPlayer()
	save();
	window.location.reload();
}

var ticking = false

var interval = setInterval(function() {
	if (player===undefined||tmp===undefined) return;
	if (ticking) return;
	if (gameEnded&&!player.keepGoing) return;
	ticking = true
	let now = Date.now()
	let diff = (now - player.time) / 1e3
	if (player.offTime !== undefined) {
		if (player.offTime.remain > modInfo.offlineLimit * 3600000) player.offlineTime.remain = modInfo.offlineLimit * 3600000
		if (player.offTime.remain > 0) {
			let offlineDiff = Math.max(player.offTime.remain / 10, diff)
			player.offTime.remain -= offlineDiff
			diff += offlineDiff
		}
		if (!player.offlineProd || player.offTime.remain <= 0) delete player.offTime
	}
	if (player.devSpeed) diff *= player.devSpeed
	player.time = now
	if (needCanvasUpdate) resizeCanvas();
	updateTemp();
	gameLoop(diff)
	ticking = false
}, 50)
