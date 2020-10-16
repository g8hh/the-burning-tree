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
            key: this.layer,
            desc: "a: reset your embers for ashes",
            onPress(){if (player[this.layer].unlocked) doReset(this.layer)}
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
            description: "The flame's effect is stronger based on your ashes.",
            cost: new Decimal(2),
            effect() {
                return player[this.layer].points.plus(2).log(10).plus(1)
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
            cost: new Decimal(15),
            effect() {
                return player.points.plus(1).log(10).plus(1)
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 12) && hasMilestone("c", 0)
            }
        },
        21: {
            description: "The flame now affects your ash gain.",
            cost: new Decimal(5),
            effect() {
                return getFlameStrength().plus(1).sqrt()
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
                return player[this.layer].points.div(player[this.layer].points.add(100)).plus(1).mul(1.5)
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
            cost: new Decimal(150),
            effect() {
                return player.points.plus(2).ssqrt()
            },
            effectDisplay() {
                return format(upgradeEffect(this.layer, this.id)) + "x"
            },
            unlocked() {
                return hasUpgrade(this.layer, 22) && hasMilestone("c", 0)
            }
        },
    },

    doReset(resettingLayer) {
        if (layers[resettingLayer].row > layers[this.layer].row) {
            var kept = ["unlocked"]
            if (resettingLayer == "c") {
                if (hasMilestone("c", 2)) {kept.push("upgrades")}
                if (hasMilestone("c", 3)) {kept.push("auto")}
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
        }
    },

    color: "#666666",
    resource: "coal",
    row: 1,

    effect() {
        var effect = player[this.layer].points.plus(1).pow(0.75)
        if (hasUpgrade(this.layer, 12)) {
            effect = effect.mul(upgradeEffect(this.layer, 12))
        }
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
        return hasMilestone(this.layer, 1)
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
            key: this.layer,
            desc: "c: reset your embers for coal",
            onPress(){if (player[this.layer].unlocked) doReset(this.layer)}
        }
    ],

    branches: [
        "a"
    ],

    milestones: {
        0: {
            requirementDescription: "1 coal",
            effectDescription: "Unlock a new column of prestige upgrades",
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