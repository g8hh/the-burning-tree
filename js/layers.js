addLayer("f", {
    startData() {
        return {
            unl: false,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
        }
    },

    color:() => "#BF2F00",
    resource: "flames",
    row: 0,

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires:() => new Decimal(10),

    type: "normal",
    exponent: 0.5,

    gainMult() {
        mult = new Decimal(1)
        if (hasUpg(this.layer, 13)) mult = mult.mul(2)
        if (hasUpg(this.layer, 21)) mult = mult.mul(upgEffect(this.layer, 21))
        mult = mult.mul(buyableEffect("e",12))
        mult = mult.mul(layers["c"].effect())
        return mult
    },

    gainExp() {
        exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return true
    },

    hotkeys: [
        {
            key: this.layer,
            desc: "f: reset your embers for flames",
            onPress() {
                if (player[this.layer]) {
                    doReset(this.layer)
                }
            }
        }
    ],

    upgrades: {
        rows: 2,
        cols: 4,
        11: {
            desc:() => "You gain 1 ember per second.",
            cost:() => new Decimal(1),
            unl() {
                return player[this.layer].unl
            },
        },
        12: {
            desc:() => "Your ember gain is boosted by your unspent flames.",
            cost:() => new Decimal(1),
            unl() {
                return hasUpg(this.layer, 11)
            },
            effect() {
                return player[this.layer].points.add(2).sqrt().pow(hasUpg(this.layer, 23) ? layers["f"].upgrades[23].effect().div(100).plus(1) : 1)
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        13: {
            desc:() => "Your flame gain is doubled.",
            cost:() => new Decimal(5),
            unl() {
                return hasUpg(this.layer, 12)
            },
        },
        14: {
            desc:() => "Your ember gain is boosted by your embers.",
            cost:() => new Decimal(10),
            unl() {
                return hasUpg(this.layer, 13)
            },
            effect() {
                return player.points.add(1).log(10).add(1)
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        21: {
            desc:() => "Your flame gain is boosted by your embers.",
            cost:() => new Decimal(15),
            unl() {
                return hasUpg(this.layer, 14)
            },
            effect() {
                return player.points.add(1).log(100).add(1)
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        22: {
            desc:() => "Your ember gain is boosted by bought flame upgrades.",
            cost:() => new Decimal(50),
            unl() {
                return hasUpg("c", 11)
            },
            effect() {
                return player[this.layer].upgrades ? new Decimal(player[this.layer].upgrades.length).sqrt() : new Decimal(1)
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        23: {
            desc:() => "The second flame upgrade is stronger based on your flames.",
            cost:() => new Decimal(250),
            unl() {
                return hasUpg(this.layer, 22)
            },
            effect() {
                return player[this.layer].points.plus(1).log(10).plus(1).root(16)
            },
            effectDisplay(fx) {
                return format(fx.sub(1)) + "% stronger"
            },
        },
        24: {
            desc:() => "Unimplemented",
            cost:() => new Decimal(0),
            unl() {
                return false
            },
        },
    },

    update(diff) {
        if (hasUpg(this.layer, 11)) player.points = player.points.add(tmp.pointGen.mul(diff)).max(0)
        if (hasMilestone("e", "1")) {
            generatePoints("f", diff)
        }
    },

    doReset(resettingLayer) {
        if(resettingLayer == "e") {
            if (player["e"].milestones.includes("0")) {
                player[this.layer].points = new Decimal(0)
                player[this.layer].total = new Decimal(0)
            } else {
                fullLayerReset(this.layer)
            }
        } else if (resettingLayer == "c") {
            if (player["c"].milestones.includes("0")) {
                player[this.layer].points = new Decimal(0)
                player[this.layer].total = new Decimal(0)
            } else {
                fullLayerReset(this.layer)
            }
        } else if (layers[resettingLayer].row > this.row) {
            fullLayerReset(this.layer)
        }
    },

    tabFormat: ["main-display",
        ["prestige-button", function(){return "Reset for "}],
        ["display-text",
            function() {return 'You have ' + format(player.points) + ' embers'},
            {"color": "white", "font-size": "15px"}],
        "blank",
        "upgrades"
    ],
})

addLayer("e", {
    startData() {
        return {
            unl: false,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            order: 0,
            cells: new Decimal(0),
            totalcells: new Decimal(0),
            bestcells: new Decimal(0),
        }
    },

    color:() => "#cccc33",
    resource: "electricity",
    row: 1,

    convertToDecimal() {
        player[this.layer].cells = new Decimal(player[this.layer].cells)
        player[this.layer].totalcells = new Decimal(player[this.layer].totalcells)
        player[this.layer].bestcells = new Decimal(player[this.layer].bestcells)
    },

    baseResource: "flames",
    baseAmount() {
        return player["f"].points
    },

    requires() {
        if (player[this.layer].order >= 1) {
            return new Decimal(1e5)
        } else {
            return new Decimal(50)
        }
    },

    effect() {
        return player[this.layer].points.add(1).root(2)
    },

    effectDescription() {
        return "multiplying your ember gain by " + format(layers[this.layer].effect()) + "x"
    },

    type: "normal",
    exponent: "0.5",

    gainMult() {
        let mult = new Decimal(1)
        mult = mult.mul(tmp.buyables[this.layer][13].effect)
        return mult
    },

    gainExp() {
        return new Decimal(1)
    },

    layerShown() {
        return true
    },

    hotkeys: [
        {
            key: this.layer,
            desc: "e: reset your prestige points for electricity",
            onPress() {
                if (player[this.layer]) {
                    doReset(this.layer)
                }
            }
        }
    ],

    milestones: {
        0: {
            requirementDesc:() => "5 electricity",
            effectDesc:() => "You keep flame upgrades on reset",
            done() {
                return player[this.layer].best.gte(5)
            }
        },
        1: {
            requirementDesc:() => "20 electricity",
            effectDesc:() => "You gain 100% of flame gain per second",
            done() {
                return player[this.layer].best.gte(20)
            }
        }
    },

    buyables: {
        rows: 1,
        cols: 3,
        respec() {
            player[this.layer].cells = player[this.layer].cells.add(player[this.layer].spentOnBuyables)
            resetBuyables(this.layer)
            doReset(this.layer, true)
        },
        respecText:() => "Respec your buildings and regain your spent power cells",
        11: {
            title:() => "Building 1",
            cost(x) {
                return new Decimal(1.5).pow(x.add(1)).floor()
            },
            effect(x) {
                let divisor = player[this.layer].buyables[12].add(player[this.layer].buyables[13]).div(4).add(1)
                return x.div(divisor).add(1).sqrt().pow(2.25)
            },
            display() {
                let data = tmp.buyables[this.layer][this.id]
                return "\nIncreases ember gain.\n\nCurrently: " + format(data.effect)
                    + "x\n\nCost: " + format(data.cost, 0) + " power cells\n\nOwned: " + format(player[this.layer].buyables[this.id],0)
            },
            unl() {
                return player[this.layer].unl
            },
            canAfford() { 
                return player[this.layer].cells.gte(tmp.buyables[this.layer][this.id].cost)
            },
            buy() {
                cost = tmp.buyables[this.layer][this.id].cost
                player[this.layer].cells = player[this.layer].cells.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
            },
        },
        12: {
            title:() => "Building 2",
            cost(x) {
                return new Decimal(1.5).pow(x.add(1)).floor()
            },
            effect(x) {
                let divisor = player[this.layer].buyables[11].add(player[this.layer].buyables[13]).div(4).add(1)
                return x.div(divisor).add(1).sqrt().pow(1.75)
            },
            display() {
                let data = tmp.buyables[this.layer][this.id]
                return "\nIncreases flame gain.\n\nCurrently: " + format(data.effect)
                    + "x\n\nCost: " + format(data.cost, 0) + " power cells\n\nOwned: " + format(player[this.layer].buyables[this.id],0)
            },
            unl() {
                return player[this.layer].unl
            },
            canAfford() {
                return player[this.layer].cells.gte(tmp.buyables[this.layer][this.id].cost)
            },
            buy() {
                cost = tmp.buyables[this.layer][this.id].cost
                player[this.layer].cells = player[this.layer].cells.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
            },
        },
        13: {
            title:() => "Building 3",
            cost(x) {
                return new Decimal(1.5).pow(x.add(1)).floor()
            },
            effect(x) {
                let divisor = player[this.layer].buyables[11].add(player[this.layer].buyables[12]).div(4).add(1)
                return x.div(divisor).add(1).sqrt().pow(1.5)
            },
            display() {
                let data = tmp.buyables[this.layer][this.id]
                return "\nIncreases electricity gain.\n\nCurrently: " + format(data.effect)
                    + "x\n\nCost: " + format(data.cost, 0) + " power cells\n\nOwned: " + format(player[this.layer].buyables[this.id],0)
            },
            unl() {
                return player[this.layer].unl
            },
            canAfford() {
                return player[this.layer].cells.gte(tmp.buyables[this.layer][this.id].cost)
            },
            buy() {
                cost = tmp.buyables[this.layer][this.id].cost
                player[this.layer].cells = player[this.layer].cells.sub(cost)
                player[this.layer].buyables[this.id] = player[this.layer].buyables[this.id].add(1)
                player[this.layer].spentOnBuyables = player[this.layer].spentOnBuyables.add(cost)
            },
        },
    },

    update(diff) {
        if (player[this.layer].totalcells.lt(player[this.layer].points.root(1.75).floor())) {
            amount = player[this.layer].points.root(1.75).floor().sub(player[this.layer].totalcells)
            player[this.layer].totalcells = player[this.layer].totalcells.add(amount)
            player[this.layer].cells = player[this.layer].cells.add(amount)
            if (player[this.layer].cells.gte(player[this.layer].bestcells)) {
                player[this.layer].bestcells = player[this.layer].cells
            }
        }
    },

    incr_order: ["c"],

    branches: [
        ["f", 1]
    ],

    tabFormat: ["main-display",
        ["prestige-button", function(){return "Reset for "}],
        ["display-text",
            function() {return 'You have ' + format(player["f"].points) + ' flames'},
            {"color": "white", "font-size": "15px"}],
        "milestones",
        "blank",
        ["display-text",
            function() {return 'Your electricity is giving you ' + format(player["e"].cells, 0) + ' power cells'},
            {"color": "white", "font-size": "17px"}],
        ["display-text",
            function() {return 'Each building bought decreases the effectiveness of the others!'},
            {"color": "white", "font-size": "17px"}],
        "blank",
        "buyables"
    ],
})

addLayer("c", {
    startData() {
        return {
            unl: false,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
            order: 0,
        }
    },

    color:() => "#5B5B5B",
    resource: "coal",
    row: 1,

    baseResource: "flames",
    baseAmount() {
        return player["f"].points
    },

    requires() {
        if (player[this.layer].order >= 1) {
            return new Decimal(1e5)
        } else {
            return new Decimal(50)
        }
    },

    type: "static",
    exponent: 1.25,
    base: 2,

    gainMult() {
        mult = new Decimal(1)
        return mult
    },

    gainExp() {
        exp = new Decimal(1)
        return exp
    },

    canBuyMax() {
        return hasMilestone("c", "1")
    },

    layerShown() {
        return true
    },

    effect() {
        return player[this.layer].points.add(1).pow(1.5)
    },

    effectDescription() {
        return "fueling your flame gain by " + format(layers[this.layer].effect()) + "x"
    },

    hotkeys: [
        {
            key: this.layer,
            desc: "i: reset your flames for coal",
            onPress() {
                if (player[this.layer]) {
                    doReset(this.layer)
                }
            }
        }
    ],

    milestones: {
        0: {
            requirementDesc:() => "2 coal",
            effectDesc:() => "You keep flame upgrades on reset",
            done() {
                return player[this.layer].best.gte(2)
            }
        },
        1: {
            requirementDesc:() => "5 coal",
            effectDesc:() => "You can buy max coal",
            done() {
                return player[this.layer].best.gte(5)
            }
        }
    },

    upgrades: {
        rows: 1,
        cols: 2,
        11: {
            desc:() => "Unlock two new Flame Upgrades.",
            cost:() => new Decimal(2),
            unl() {
                return player[this.layer].unl
            },
        },
        12: {
            desc:() => "Your coal boosts your ember gain.",
            cost:() => new Decimal(5),
            unl() {
                return hasUpg(this.layer, 11)
            },
            effect() {
                let ret = player[this.layer].points.add(2)
                return ret
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
    },

    update(diff) {
    },

    incr_order: ["e"],

    branches: [
        ["f", 1]
    ],

    tabFormat: ["main-display",
        ["prestige-button", function(){return "Reset for "}],
        ["display-text",
            function() {return 'You have ' + format(player["f"].points) + ' flames'},
            {"color": "white", "font-size": "15px"}],
        "milestones",
        "blank",
        "upgrades"
    ],
})