addLayer("p", {
    startData() {
        return {
            unlocked: false,
            points: new Decimal(0),
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
            mult = mult.times(upgradeEffect(this.layer, 21))
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

    upgrades: {
        rows: 2,
        cols: 2,
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
                return player[this.layer].points.div(player[this.layer].points.add(100)).plus(1)
            },
            effectDisplay() {
                return "/" + format(upgradeEffect(this.layer, this.id))
            },
            unlocked() {
                return hasUpgrade("p", 21)
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