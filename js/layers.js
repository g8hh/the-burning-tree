addLayer("a", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            auto: false
        }
    },

    color: "#444444",
    resource: "ashes",
    row: 0,

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires: new Decimal(10),

    type: "normal",
    exponent: 0.5,

    gainMult() {
        let mult = new Decimal(1)
        if (hasUpgrade(this.layer, 21)) {
            mult = mult.mul(upgradeEffect(this.layer, 21))
        }
        if (hasUpgrade(this.layer, 13)) {
            mult = mult.mul(upgradeEffect(this.layer, 13))
        }
        if (hasUpgrade("c", 11)) {
            mult = mult.mul(upgradeEffect("c", 11))
        }
        if (player["e"].unlocked) {
            mult = mult.mul(player["e"].allocatedEffects[1])
        }
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return true
    },

    hotkeys: [
        {
            key: "a",
            description: "a: reset your embers for ashes",
            onPress(){if (player["a"].unlocked) doReset("a")}
        }
    ],

    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            description: "The flame loses strength at half the rate.",
            cost: new Decimal(1)
        },
        12: {
            description: "The flame's effect is stronger based on your ashes.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(2).log(10).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        13: {
            description: "You gain more ashes based on your embers.",
            cost: new Decimal(25),
            effect() {
                return player.points.add(1).log(10).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 12) && hasMilestone("c", 0)
            }
        },
        14: {
            description: "You gain more embers based on your ashes.",
            cost: new Decimal(25),
            effect() {
                return player[this.layer].points.add(2).ssqrt()
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 12) && hasMilestone("e", 0)
            }
        },
        21: {
            description: "The flame now affects your ash gain.",
            cost: new Decimal(5),
            effect() {
                return getFlameStrength().add(1).sqrt()
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
        22: {
            description: "The flame loses strength slower based on your ashes.",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.add(1).log(10).div(player[this.layer].points.add(1).log(10).add(10)).add(1).mul(2).sub(1)
            },
            effectDisplay() {
                return "/" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                return hasUpgrade(this.layer, 21)
            }
        },
        23: {
            description: "The flame's effect is stronger based on your embers.",
            cost: new Decimal(500),
            effect() {
                return player.points.add(2).ssqrt()
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 22) && hasMilestone("c", 0)
            }
        },
        24: {
            description: "The flame's effect boosts ember gain even more.",
            cost: new Decimal(500),
            effect() {
                return getFlameStrength().sqrt().add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 22) && hasMilestone("e", 0)
            }
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = ["unlocked", "auto"]
            if (resettingLayer == "c") {
                if (hasMilestone("c", 2)) {kept.push("upgrades")}
            }
            if (resettingLayer == "e") {
                if (hasMilestone("e", 1)) {kept.push("upgrades")}
            }
            layerDataReset(this.layer, kept)
        }
    },

    automate() {
        if (player[this.layer].auto && hasMilestone("c", 3)) {
            if (player.flame.strength.lt(0.1)) {
                doReset(this.layer)
            }
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {return 'You have ' + format(player.points) + ' embers.'}],
        "blank",
        "upgrades"
    ]
})

addLayer("c", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            unlockOrder: 0,
        }
    },

    color: "#666666",
    resource: "coal",
    row: 1,

    effect() {
        let effect = player[this.layer].points.add(1).pow(0.75)
        if (hasUpgrade(this.layer, 12)) {
            effect = effect.mul(upgradeEffect(this.layer, 12))
        }
        return effect
    },

    effectDescription() {
        return "boosting the flame effect by " + format(tmp[this.layer].effect) + "x"
    },

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires() {
        if (player[this.layer].unlockOrder == 0) {
            return new Decimal(50)
        } else {
            return new Decimal(5e6)
        }
   },

    type: "static",
    base: 2,
    exponent: 1.1,

    roundUpCost: true,

    canBuyMax() {
        return hasMilestone(this.layer, 1)
    },

    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return player["a"].unlocked
    },

    hotkeys: [
        {
            key: "c",
            description: "c: reset your embers for coal",
            onPress(){if (player["c"].unlocked) doReset("c")}
        }
    ],

    branches: [
        "a"
    ],

    increaseUnlockOrder: [
        "e"
    ],

    milestones: {
        0: {
            requirementDescription: "1 coal",
            effectDescription: "Unlock a new column of ash upgrades",
            done() {
                return player[this.layer].best.gte(1)
            }
        },
        1: {
            requirementDescription: "3 coal",
            effectDescription: "You can buy max coal",
            done() {
                return player[this.layer].best.gte(3)
            }
        },
        2: {
            requirementDescription: "5 coal",
            effectDescription: "You keep ash upgrades on coal reset",
            done() {
                return player[this.layer].best.gte(5)
            }
        },
        3: {
            requirementDescription: "10 coal",
            effectDescription: "You can now automatically do an ash reset when your flame strength drops below 10%",
            done() {
                return player[this.layer].best.gte(10)
            },
            toggles: [
                ["a", "auto"]
            ]
        }
    },

    upgrades: {
        rows: 1,
        cols: 4,
        11: {
            description: "Your ash gain is boosted by your coal.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.add(2).pow(1.25)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return player[this.layer].unlocked
            }
        },
        12: {
            description: "The flame's effect boosts coal's effect.",
            cost: new Decimal(5),
            effect() {
                return getFlameStrength().add(1).log(10).add(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 11)
            }
        },
        13: {
            description: "The flame's effect is impacted less by the flame's strength.",
            cost: new Decimal(7),
            unlocked() {
                return hasUpgrade(this.layer, 12)
            }
        },
        14: {
            description: "Your coal boosts your ember gain.",
            cost: new Decimal(8),
            effect() {
                return player[this.layer].points.add(2).pow(1.5)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"  
            },
            unlocked() {
                return hasUpgrade(this.layer, 13)
            }
        }
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > layers[this.layer].row) {
            let kept = ["unlocked"]
            layerDataReset(this.layer, kept)
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {return 'You have ' + format(player.points) + ' embers.'}],
        "blank",
        "milestones",
        "blank",
        "upgrades"
    ]
})

addLayer("e", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            allocation: [
                0,
                0,
                0
            ],
            allocatedEffects: [
                new Decimal(1),
                new Decimal(1),
                new Decimal(1)
            ],
            totalAllocation: 0,
            unlockOrder: 0,
        }
    },

    color: "#dddd00",
    resource: "electricity",
    row: 1,

    effect() {
        let effect = player[this.layer].points.sqrt()
        if (effect.gte(50)) {
            effect = player[this.layer].points.log(10).add(1).mul(new Decimal(50).div(new Decimal(2500).log(10).add(1)))
        }
        return effect
    },

    effectDescription() {
        return "providing " + format(tmp[this.layer].effect) + "x strength to allocated electricity."
    },

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires() {
         if (player[this.layer].unlockOrder == 0) {
             return new Decimal(50)
         } else {
             return new Decimal(5e6)
         }
    },

    type: "normal",
    exponent: 0.75,

    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return player["a"].unlocked
    },

    hotkeys: [
        {
            key: "e",
            description: "e: reset your embers for electricity",
            onPress(){if (player["e"].unlocked) doReset("e")}
        }
    ],

    branches: [
        "a"
    ],

    increaseUnlockOrder: [
        "c"
    ],

    milestones: {
        0: {
            requirementDescription: "1 electricity",
            effectDescription: "Unlock a new column of ash upgrades",
            done() {
                return player[this.layer].best.gte(1)
            }
        },
        1: {
            requirementDescription: "25 electricity",
            effectDescription: "You keep ash upgrades on electricity reset",
            done() {
                return player[this.layer].best.gte(25)
            }
        },
    },

    bars: {
        flameBoost: {
            direction: RIGHT,
            width: 600,
            height: 50,
            progress() {
                return player[this.layer].allocation[0] / 100
            },
            display() {
                return "Boost flame effect (" + format(player[this.layer].allocatedEffects[0]) + "x)"
            },
            baseStyle: {
                "background-color": "#FFFFFF"
            },
            fillStyle: {
                "background-color": "#DDDD00"
            },
            textStyle: {
                "color": "#000000"
            }
        },
        ashBoost: {
            direction: RIGHT,
            width: 600,
            height: 50,
            progress() {
                return player[this.layer].allocation[1] / 100
            },
            display() {
                return "Boost ash gain (" + format(player[this.layer].allocatedEffects[1]) + "x)"
            },
            baseStyle: {
                "background-color": "#FFFFFF"
            },
            fillStyle: {
                "background-color": "#DDDD00"
            },
            textStyle: {
                "color": "#000000"
            }
        },
        emberBoost: {
            direction: RIGHT,
            width: 600,
            height: 50,
            progress() {
                return player[this.layer].allocation[2] / 100
            },
            display() {
                return "Boost ember gain (" + format(player[this.layer].allocatedEffects[2]) + "x)"
            },
            baseStyle: {
                "background-color": "#FFFFFF"
            },
            fillStyle: {
                "background-color": "#DDDD00"
            },
            textStyle: {
                "color": "#000000"
            }
        }
    },

    clickables: {
        rows: 3,
        cols: 2,
        11: {
            display() {
                return "<h1><b>-</b></h1>"
            },
            canClick() {
                return player[this.layer].allocation[0] > 0
            },
            onClick(){
                player[this.layer].allocation[0] = Math.round(player[this.layer].allocation[0] - 10)
                player[this.layer].totalAllocation = Math.round(player[this.layer].totalAllocation - 10)
            },
            style: {
                "width": "50px",
                "height": "50px"
            }
        },
        12: {
            display() {
                return "<h1><b>+</b></h1>"
            },
            canClick() {
                return player[this.layer].totalAllocation < 100
            },
            onClick(){
                player[this.layer].allocation[0] = Math.round(player[this.layer].allocation[0] + 10)
                player[this.layer].totalAllocation = Math.round(player[this.layer].totalAllocation + 10)
            },
            style: {
                "width": "50px",
                "height": "50px"
            }
        },
        21: {
            display() {
                return "<h1><b>-</b></h1>"
            },
            canClick() {
                return player[this.layer].allocation[1] > 0
            },
            onClick(){
                player[this.layer].allocation[1] = Math.round(player[this.layer].allocation[1] - 10)
                player[this.layer].totalAllocation = Math.round(player[this.layer].totalAllocation - 10)
            },
            style: {
                "width": "50px",
                "height": "50px"
            }
        },
        22: {
            display() {
                return "<h1><b>+</b></h1>"
            },
            canClick() {
                return player[this.layer].totalAllocation < 100
            },
            onClick(){
                player[this.layer].allocation[1] = Math.round(player[this.layer].allocation[1] + 10)
                player[this.layer].totalAllocation = Math.round(player[this.layer].totalAllocation + 10)
            },
            style: {
                "width": "50px",
                "height": "50px"
            }
        },
        31: {
            display() {
                return "<h1><b>-</b></h1>"
            },
            canClick() {
                return player[this.layer].allocation[2] > 0
            },
            onClick(){
                player[this.layer].allocation[2] = Math.round(player[this.layer].allocation[2] - 10)
                player[this.layer].totalAllocation = Math.round(player[this.layer].totalAllocation - 10)
            },
            style: {
                "width": "50px",
                "height": "50px"
            }
        },
        32: {
            display() {
                return "<h1><b>+</b></h1>"
            },
            canClick() {
                return player[this.layer].totalAllocation < 100
            },
            onClick(){
                player[this.layer].allocation[2] = Math.round(player[this.layer].allocation[2] + 10)
                player[this.layer].totalAllocation = Math.round(player[this.layer].totalAllocation + 10)
            },
            style: {
                "width": "50px",
                "height": "50px"
            }
        },
    },

    update(diff) {
        player[this.layer].allocatedEffects[0] = tmp[this.layer].effect.mul(player[this.layer].allocation[0] / 100).add(1).pow(0.75)
        player[this.layer].allocatedEffects[1] = tmp[this.layer].effect.mul(player[this.layer].allocation[1] / 100).add(1)
        player[this.layer].allocatedEffects[2] = tmp[this.layer].effect.mul(player[this.layer].allocation[2] / 100).add(1).pow(1.25)
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        ["display-text", function() {return 'You have ' + format(player.points) + ' embers.'}],
        "blank",
        "milestones",
        "blank",
        ["display-text", function() {return 'Electricity allocated: ' + player["e"].totalAllocation + '%'}],
        "blank",
        ["row", [["clickable", 11], "blank", ["bar", "flameBoost"], "blank", ["clickable", 12]]],
        "blank",
        ["row", [["clickable", 21], "blank", ["bar", "ashBoost"], "blank", ["clickable", 22]]],
        "blank",
        ["row", [["clickable", 31], "blank", ["bar", "emberBoost"], "blank", ["clickable", 32]]],
    ]
})

/*addLayer("m", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            best: new Decimal(0),
            total: new Decimal(0),
            resources: {
                stone: new Decimal(0),
                iron: new Decimal(0)
            },
            resourceWeights: {
                stone: 100,
                iron: 1,
            },
            totalWeight: 101,
            heatPenalty: new Decimal(1)
        }
    },

    color: "#CCCC00",
    resource: "miners",
    row: 1,

    effect() {
        let effect = player[this.layer].points.pow(0.75)
        effect = effect.pow(player[this.layer].heatPenalty)
        return effect
    },

    effectDescription() {
        return "producing resources at a rate of " + format(layers[this.layer].effect()) + '/s'
    },

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires: new Decimal(5e6),

    type: "static",
    base: 2,
    exponent: 1.5,

    roundUpCost: true,

    canBuyMax() {
        return false
    },

    gainMult() {
        let mult = new Decimal(1)
        return mult
    },
    gainExp() {
        let exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return true
    },

    hotkeys: [
        {
            key: "m",
            description: "m: reset your embers for miners",
            onPress(){if (player["m"].unlocked) doReset("m")}
        }
    ],

    branches: [
        "c"
    ],

    milestones: {
        0: {
            requirementDescription: "3 miners",
            effectDescription: "You keep ash upgrades on miner reset",
            done() {
                return player[this.layer].best.gte(3)
            }
        },
    },

    upgrades: {
        rows: 1,
        cols: 1,
        11: {
            title: "Furnace",
            description: "The effect of coal is stronger.",
            cost: new Decimal(15),
        },
    },

    update(diff) {
        if (player["m"].totalWeight > 0) {
            for (resource in player["m"].resources) {
                player["m"].resources[resource] = player["m"].resources[resource].add(new Decimal(player["m"].resourceWeights[resource]/player["m"].totalWeight).mul(diff).mul(layers["m"].effect()))
            }
        }
        player["m"].heatPenalty = getFlameStrength().add(1).log(1e10).add(1).sqrt().recip()
    },

    updateTotalWeight() {
        player["m"].totalWeight = 0;
        for (resource in player["m"].resources) {
            player["m"].totalWeight += player["m"].resourceWeights[resource]
        }
    },

    tabFormat: [
        "main-display",
        ["display-text", function() {return "The heat of the flame is raising your worker's mining speed to the power of ^" + format(player["m"].heatPenalty, 5).replace(",","") + "."}],
        "prestige-button",
        ["display-text", function() {return 'You have ' + format(player.points) + ' embers.'}],
        "blank",
        "milestones",
        "blank",
        ["display-text", function() {if (player["m"].resources["stone"].gt(0)) return 'You have ' + format(player["m"].resources["stone"]) + ' stone.'}],
        ["display-text", function() {if (player["m"].resources["iron"].gt(0)) return 'You have ' + format(player["m"].resources["iron"]) + ' iron.'}],
        "blank",
        "upgrades"
    ]
})*/

