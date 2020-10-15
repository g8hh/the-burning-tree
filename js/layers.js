addLayer("p", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
            auto: false
        }
    },

    color: "#CF2000",
    resource: "prestige points",
    row: 0,

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires: new Decimal(10),

    type: "normal",
    exponent: 0.5,

    gainMult() {
        var mult = new Decimal(1)
        if (hasUpgrade(this.layer, 21)) {
            mult = mult.mul(upgradeEffect(this.layer, 21))
        }
        if (hasUpgrade(this.layer, 13)) {
            mult = mult.mul(upgradeEffect(this.layer, 13))
        }
        if (hasUpgrade("c", 11)) {
            mult = mult.mul(upgradeEffect("c", 11))
        }
        return mult
    },
    gainExp() {
        var exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return true
    },

    hotkeys: [
        {
            key: "p",
            desc: "p: reset your embers for prestige points",
            onPress(){if (player["p"].unlocked) doReset("p")}
        }
    ],

    upgrades: {
        rows: 2,
        cols: 3,
        11: {
            description: "The flame loses strength at half the rate.",
            cost: new Decimal(1)
        },
        12: {
            description: "The flame's effect is stronger based on your prestige points.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.plus(2).log(10).plus(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("p", 11)
            }
        },
        13: {
            description: "You gain more prestige points based on your embers.",
            cost: new Decimal(15),
            effect() {
                return player.points.plus(1).log(10).plus(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("p", 12) && player["c"].unlocked
            }
        },
        21: {
            description: "The flame now affects your prestige point gain.",
            cost: new Decimal(5),
            effect() {
                return getFlameStrength().plus(1).sqrt()
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("p", 12)
            }
        },
        22: {
            description: "The flame loses strength slower based on your prestige points.",
            cost: new Decimal(10),
            effect() {
                return player[this.layer].points.div(player[this.layer].points.add(100)).plus(1).mul(1.5)
            },
            effectDisplay() {
                return "/" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                return hasUpgrade("p", 21)
            }
        },
        23: {
            description: "The flame's effect is stronger based on your embers.",
            cost: new Decimal(150),
            effect() {
                return player.points.plus(2).ssqrt()
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade("p", 22) && player["c"].unlocked
            }
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > layers[this.layer].row) {
            if (resettingLayer == "c" && hasMilestone("c", 1)) {
                layerDataReset(this.layer, ["unlocked", "upgrades"])
            } else {
                layerDataReset(this.layer, ["unlocked"])
            }
        }
    },

    automate() {
        if (player[this.layer].auto && hasMilestone("c", 2)) {
            if (player.flame.strength.lt(0.1)) {
                doReset("p")
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
        }
    },

    color: "#666666",
    resource: "coal",
    row: 1,

    effect() {
        var effect = player[this.layer].points.plus(1).pow(0.75)
        effect = effect.mul(upgradeEffect(this.layer, 12))
        return effect
    },

    effectDescription() {
        return "boosting the flame effect by " + format(layers[this.layer].effect()) + "x"
    },

    baseResource: "embers",
    baseAmount() {
        return player.points
    },

    requires: new Decimal(50),

    type: "static",
    base: 2,
    exponent: 1.1,

    roundUpCost: true,

    canBuyMax() {
        return hasMilestone(this.layer, 0)
    },

    gainMult() {
        var mult = new Decimal(1)
        return mult
    },
    gainExp() {
        var exp = new Decimal(1)
        return exp
    },

    layerShown() {
        return true
    },

    hotkeys: [
        {
            key: "c",
            desc: "c: reset your embers for coal",
            onPress(){if (player["c"].unlocked) doReset("c")}
        }
    ],

    branches: [
        "p"
    ],

    milestones: {
        0: {
            requirementDescription: "3 coal",
            effectDescription: "You can buy max coal",
            done() {
                return player[this.layer].best.gte(3)
            }
        },
        1: {
            requirementDescription: "5 coal",
            effectDescription: "You keep prestige upgrades on coal reset",
            done() {
                return player[this.layer].best.gte(5)
            }
        },
        2: {
            requirementDescription: "10 coal",
            effectDescription: "You can now automatically do a prestige reset when your flame strength drops below 10%",
            done() {
                return player[this.layer].best.gte(10)
            },
            toggles: [
                ["p", "auto"]
            ]
        }
    },

    upgrades: {
        rows: 1,
        cols: 4,
        11: {
            description: "Your prestige point gain is boosted by your coal.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.plus(2).pow(1.25)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            }
        },
        12: {
            description: "The flame's effect boosts coal's effect.",
            cost: new Decimal(5),
            effect() {
                return getFlameStrength().plus(1).log(10).plus(1)
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
            cost: new Decimal(9),
            effect() {
                return player[this.layer].points.plus(2).pow(1.5)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"  
            },
            unlocked() {
                return hasUpgrade(this.layer, 13)
            }
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