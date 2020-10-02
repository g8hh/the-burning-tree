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

        color: "#AACCFF",                       
        resource: "prestige points",            
        row: 0,                                 

        baseResource: "points",
        baseAmount() {
			return player.points
		},

        requires() {
			if (player.p.points.lte(10)) {
				return new Decimal(1)
			} else {
				return new Decimal(10)
			}
		},
        
        type: "normal",
        exponent: 0.5,

        gainMult() {
			let gain = new Decimal(1)
			if (player.p.upgrades.includes(21)) {
				gain = gain.mul(player.p.points.plus(1).log10().plus(1))
			}
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
				cost: new Decimal(2),
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
				cost: new Decimal(25),
				unl() {
					return player.p.upgrades.includes(21)
				},
				effect() {
					let a = player.points.pow(2)
				}
			},
		},
		
		update(diff) {
			if (player.p.upgrades.includes(11)) {
				player.points = player.points.add(tmp.pointGen.times(diff)).max(0)
			}
		},
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