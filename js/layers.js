addLayer("p", {
    startData() {
        return {
            unl: false,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
        }
    },

    color:() => "#AACCFF",
    resource: "prestige points",
    row: 0,

    baseResource: "points",
    baseAmount() {
        return player.points
    },

    requires:() => new Decimal(10),

    type: "normal",
    exponent: 0.5,

    gainMult() {
        mult = new Decimal(1)
        if (player[this.layer].upgrades.includes(12)) mult = mult.mul(this.upgrades[12].effect())
        if (player[this.layer].upgrades.includes(22)) mult = mult.mul(this.upgrades[22].effect())
        mult = mult.mul(tmp.buyables["e"][12].effect)
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
            desc: "p: reset your points for prestige points",
            onPress() {
                if (player[this.layer]) {
                    doReset(this.layer)
                }
            }
        }
    ],

    upgrades: {
        rows: 2,
        cols: 2,
        11: {
            desc:() => "Your Point gain is boosted by your unspent Prestige Points.",
            cost:() => new Decimal(1),
            unl() {
                return player[this.layer].unl
            },
            effect() {
                let ret = player[this.layer].points.add(1).sqrt()
                return ret
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        12: {
            desc:() => "Your Prestige Point gain is boosted by your unspent Prestige Points.",
            cost:() => new Decimal(5),
            unl() {
                return player[this.layer].upgrades.includes(11)
            },
            effect() {
                let ret = player[this.layer].points.add(1).log(100).add(1)
                return ret
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        21: {
            desc:() => "Your Point gain is boosted by your Points.",
            cost:() => new Decimal(15),
            unl() {
                return player[this.layer].upgrades.includes(12)
            },
            effect() {
                let ret = player.points.add(1).log(10).add(1)
                return ret
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
        22: {
            desc:() => "Your Prestige Point gain is boosted by your Points.",
            cost:() => new Decimal(15),
            unl() {
                return player[this.layer].upgrades.includes(12)
            },
            effect() {
                let ret = player.points.add(1).log(10000).add(1)
                return ret
            },
            effectDisplay(fx) {
                return format(fx) + "x"
            },
        },
    },

    update(diff) {
        player.points = player.points.add(tmp.pointGen.mul(diff)).max(0)
        if (player["e"].milestones.includes("1")) {
            generatePoints("p", diff)
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
        } else if (layers[resettingLayer].row > this.row) {
            fullLayerReset(this.layer)
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
})

addLayer("e", {
    startData() {
        return {
            unl: false,
            points: new Decimal(0),
            total: new Decimal(0),
            best: new Decimal(0),
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

    baseResource: "prestige points",
    baseAmount() {
        return player["p"].points
    },

    requires() {
        return new Decimal(50)
    },

    type: "normal",
    exponent: "0.5",

    gainMult() {
        let mult = new Decimal(1)
        mult = mult.mul(layers[this.layer].buyables[13].effect(player[this.layer].buyables[13]))
        return mult
    },

    gainExp() {
        return new Decimal(1)
    },

    layerShown() {
        return true
    },

    milestones: {
        0: {
            requirementDesc:() => "3 electricity",
            effectDesc:() => "You keep prestige upgrades on reset",
            done() {
                return player[this.layer].best.gte(3)
            }
        },
        1: {
            requirementDesc:() => "10 electricity",
            effectDesc:() => "You gain 100% of prestige point gain per second",
            done() {
                return player[this.layer].total.gte(10)
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
                return x.plus(1).pow(2).floor()
            },
            effect(x) {
                let divisor = player[this.layer].buyables[12].add(player[this.layer].buyables[13]).div(4).add(1)
                return x.div(divisor).add(1).pow(2)
            },
            display() {
                let data = tmp.buyables[this.layer][this.id]
                return "\nIncreases point gain.\n\nCurrently: " + format(data.effect)
                    + "x\n\nCost: " + format(data.cost) + " power cells"
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
                return x.plus(1).pow(2).floor()
            },
            effect(x) {
                let divisor = player[this.layer].buyables[11].add(player[this.layer].buyables[13]).div(4).add(1)
                return x.div(divisor).add(1).pow(1.5)
            },
            display() {
                let data = tmp.buyables[this.layer][this.id]
                return "\nIncreases prestige point gain.\n\nCurrently: " + format(data.effect)
                    + "x\n\nCost: " + format(data.cost) + " power cells"
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
                return x.plus(1).pow(2).floor()
            },
            effect(x) {
                let divisor = player[this.layer].buyables[11].add(player[this.layer].buyables[12]).div(4).add(1)
                return x.div(divisor).add(1).pow(1.2)
            },
            display() {
                let data = tmp.buyables[this.layer][this.id]
                return "\nIncreases electricity gain.\n\nCurrently: " + format(data.effect)
                    + "x\n\nCost: " + format(data.cost) + " power cells"
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
        if (player[this.layer].totalcells.lt(player[this.layer].points.root(1.5).floor())) {
            amount = player[this.layer].points.root(1.5).floor().sub(player[this.layer].totalcells)
            player[this.layer].totalcells = player[this.layer].totalcells.add(amount)
            player[this.layer].cells = player[this.layer].cells.add(amount)
            if (player[this.layer].cells.gte(player[this.layer].bestcells)) {
                player[this.layer].bestcells = player[this.layer].cells
            }
        }
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
            function() {return 'Your electricity is giving you ' + format(player[this.layer].cells, 0) + ' power cells'},
            {"color": "white", "font-size": "17px"}],
        ["display-text",
            function() {return 'Each building bought decreases the effectiveness of the others!'},
            {"color": "white", "font-size": "17px"}],
        "blank",
        "buyables"
    ],
})