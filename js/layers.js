var layers = {
    p: {
        startData() { 
			return {                  
            	unl: false,
            	points: new Decimal(0),
            	total: new Decimal(0),
				best: new Decimal(0),
			}
		},

        color: "#aaccff",
        resource: "prestige points",            
        row: 0,                                 

        baseResource: "points",
        baseAmount() {
			return player.points
		},

        requires() {
        	return new Decimal(10)
		},
        
        type: "normal",
        exponent: 0.5,

        gainMult() {
			let gain = new Decimal(1)
			if (player.p.upgrades.includes(21)) {
				gain = gain.mul(layers.p.upgrades[21].effect())
			}
			if (player.p.upgrades.includes(22)) {
				gain = gain.mul(layers.p.upgrades[22].effect())
			}
			gain = gain.mul(layers.e.buyables[12].effect(player.e.buyables[12]))
            return gain
        },
		
        gainExp() {                  
            return new Decimal(1)
        },

        layerShown() {
			return true
		},   
		
		hotkeys: [
			{
				key: "p",
				desc: "p: reset your points for prestige points",
				onPress() {
					if (player.p.unl) {
						doReset("p")
					}
				}
			}
		],
		
		upgrades: {
			rows: 2,
			cols: 2,
			11: {
				desc: "You gain 1 point per second.",
				cost: new Decimal(1),
				unl() {
					return player.p.unl
				}
			},
			12: {
				desc: "Your Point gain is boosted by your unspent Prestige Points.",
				cost: new Decimal(1),
				unl() {
					return player.p.upgrades.includes(11)
				},
				effect() {
					return player.p.points.sqrt().plus(1)
				},
				effDisp(fx) {
					return format(fx) + "x"
				},
			},
			21: {
				desc: "Your Prestige Point gain is boosted by your unspent Prestige Points.",
				cost: new Decimal(5),
				unl() {
					return player.p.upgrades.includes(12)
				},
				effect() {
					return player.p.points.plus(1).log10().plus(1)
				},
				effDisp(fx) {
					return format(fx) + "x"
				},
			},
			22: {
				desc: "Your unspent Points and unspent Prestige Points now boost the gain of both.",
				cost: new Decimal(15),
				unl() {
					return player.p.upgrades.includes(21)
				},
				effect() {
					return player.points.plus(1).log10().mul(player.p.points.plus(1).log10()).plus(1).sqrt().plus(1)
				},
				effDisp(fx) {
					return format(fx) + "x"
				}
			},
		},
		
		update(diff) {
			if (player.p.upgrades.includes(11)) {
				player.points = player.points.add(tmp.pointGen.mul(diff)).max(0)
			}
			if (player.e.milestones.includes("1")) {
				generatePoints("p", diff)
			}
		},

		doReset(layer) {
        	if(layer == "c") {
        		if (player.e.milestones.includes("0")) {
        			player.p.points = new Decimal(0)
					player.p.best = new Decimal(0)
					player.p.total = new Decimal(0)
				} else {
        			fullLayerReset("p")
				}
			}
		},

		tabFormat: ["main-display",
			["prestige-button", function(){return "Reset for "}],
			["display-text",
				function() {return 'You have ' + format(player.points) + ' points'},
				{"color": "white", "font-size": "15px"}],
			"blank",
			"upgrades"
		],
    },

	e: {
    	startData() {
    		return {
    			unl: false,
				points: new Decimal(0),
				total: new Decimal(0),
				best: new Decimal(0),
				totalcells: new Decimal(0),
				spentcells: new Decimal(0)
			}
		},

		color: "#cccc33",
		resource: "electricity",
		row: 1,

		convertToDecimal() {
    		player.e.totalcells = new Decimal(player.e.totalcells)
			player.e.spentcells = new Decimal(player.e.spentcells)
		},

		baseResource: "prestige points",
		baseAmount() {
    		return player.p.points
		},

		requires() {
    		return new Decimal(50)
		},

		type: "normal",
		exponent: "0.5",

		gainMult() {
    		let gain = new Decimal(1)
			gain = gain.mul(layers.e.buyables[13].effect(player.e.buyables[13]))
			return gain
		},

		gainExp() {
    		return new Decimal(1)
		},

		layerShown() {
    		return true
		},

		milestones: {
    		0: {
    			requirementDesc: "3 electricity",
				effectDesc: "You keep prestige upgrades on reset",
				done() {
    				return player.e.total.gte(3)
				}
			},
			1: {
				requirementDesc: "10 electricity",
				effectDesc: "You gain 100% of prestige point gain per second",
				done() {
					return player.e.total.gte(10)
				}
			}
		},

		buyables: {
    		rows: 1,
			cols: 3,
			respec() {
    			player.e.spentcells = new Decimal(0)
				player.e.buyables[11] = new Decimal(0)
				player.e.buyables[12] = new Decimal(0)
				player.e.buyables[13] = new Decimal(0)
				doReset('c', true)
			},
			respecText: "Respec your buildings and regain your spent power cells",
			11: {
    			title: "Building 1",
    			cost(x) {
    				return x.pow(2)
				},
				effect(x) {
    				let divisor = player.e.buyables[12].plus(player.e.buyables[13]).div(4).plus(1)
    				return x.pow(2).div(divisor).plus(1)
				},
				display() {
    				return "\nIncreases point gain.\n\nCurrently: " + format(layers.e.buyables[11].effect(player.e.buyables[11]))
					+ "x\n\nCost: " + format(layers.e.buyables[11].cost(player.e.buyables[11].plus(1))) + " power cells"
				},
				unl() {
    				return true
				},
				canAfford() {
					return player.e.totalcells.minus(player.e.spentcells).gte(layers.e.buyables[11].cost(player.e.buyables[11].plus(1)))
				},
				buy() {
					if (layers.e.buyables[11].canAfford()) {
						player.e.spentcells = player.e.spentcells.plus(layers.e.buyables[11].cost(player.e.buyables[11].plus(1)))
						player.e.buyables[11] = player.e.buyables[11].plus(1)
						return true
					} else {
						return false
					}
				}
			},
			12: {
				title: "Building 2",
				cost(x) {
					return x.pow(2)
				},
				effect(x) {
					let divisor = player.e.buyables[11].plus(player.e.buyables[13]).div(4).plus(1)
					return x.pow(1.5).div(divisor).plus(1)
				},
				display() {
					return "\nIncreases prestige point gain.\n\nCurrently: " + format(layers.e.buyables[12].effect(player.e.buyables[12]))
						+ "x\n\nCost: " + format(layers.e.buyables[12].cost(player.e.buyables[12].plus(1))) + " power cells"
				},
				unl() {
					return true
				},
				canAfford() {
					return player.e.totalcells.minus(player.e.spentcells).gte(layers.e.buyables[12].cost(player.e.buyables[12].plus(1)))
				},
				buy() {
					if (layers.e.buyables[12].canAfford()) {
						player.e.spentcells = player.e.spentcells.plus(layers.e.buyables[12].cost(player.e.buyables[12].plus(1)))
						player.e.buyables[12] = player.e.buyables[12].plus(1)
						return true
					} else {
						return false
					}
				}
			},
			13: {
				title: "Building 3",
				cost(x) {
					return x.pow(2)
				},
				effect(x) {
					let divisor = player.e.buyables[11].plus(player.e.buyables[12]).div(4).plus(1)
					return x.div(divisor).plus(1)
				},
				display() {
					return "\nIncreases electricity gain.\n\nCurrently: " + format(layers.e.buyables[13].effect(player.e.buyables[13]))
						+ "x\n\nCost: " + format(layers.e.buyables[13].cost(player.e.buyables[13].plus(1))) + " power cells"
				},
				unl() {
					return true
				},
				canAfford() {
					return player.e.totalcells.minus(player.e.spentcells).gte(layers.e.buyables[13].cost(player.e.buyables[13].plus(1)))
				},
				buy() {
					if (layers.e.buyables[13].canAfford()) {
						player.e.spentcells = player.e.spentcells.plus(layers.e.buyables[13].cost(player.e.buyables[13].plus(1)))
						player.e.buyables[13] = player.e.buyables[13].plus(1)
						return true
					} else {
						return false
					}
				}
			},
		},

		update(diff) {
    		player.e.totalcells = player.e.points.root(2).floor()
		},

		branches: [
			["p", 1]
		],

		tabFormat: ["main-display",
			["prestige-button", function(){return "Reset for "}],
			["display-text",
				function() {return 'You have ' + format(player.p.points) + ' prestige points'},
				{"color": "white", "font-size": "15px"}],
			"milestones",
			"blank",
			["display-text",
				function() {return 'Your electricity is giving you ' + format(player.e.totalcells.minus(player.e.spentcells), 0) + ' power cells'},
				{"color": "white", "font-size": "17px"}],
			["display-text",
				function() {return 'Each building bought decreases the effectiveness of the others!'},
				{"color": "white", "font-size": "17px"}],
			"blank",
			"buyables"
		],
	},
} 

function layerShown(layer){
    return layers[layer].layerShown();
}

var LAYERS = Object.keys(layers);

var hotkeys = {};



var ROW_LAYERS = {}
for (layer in layers){
    row = layers[layer].row
    if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}

    ROW_LAYERS[row][layer]=layer;
}

function addLayer(layerName, layerData){ // Call this to add layers from a different file!
    layers[layerName] = layerData
    LAYERS = Object.keys(layers);
    ROW_LAYERS = {}
    for (layer in layers){
        row = layers[layer].row
        if(!ROW_LAYERS[row]) ROW_LAYERS[row] = {}
    
        ROW_LAYERS[row][layer]=layer;
    }
    updateHotkeys()
}