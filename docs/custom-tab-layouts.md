# Custom tab layouts

Note: If you are using subtabs, tabFormat is used differently, but you still use the same format within each subtabs.
[See here for more on subtabs](subtabs-and-microtabs.md)

Custom tab layouts can be used to do basically anything in a tab window, especially combined with the "style" layer feature. The tabFormat feature is an array of things, like this:

```js
    tabFormat: ["main-display",
            ["prestige-button", function(){return "Melt your points into "}],
            "blank",
            ["display-text",
                function() {return 'I have ' + format(player.points) + ' pointy points!'},
                {"color": "red", "font-size": "32px", "font-family": "Comic Sans MS"}],
            "blank",
            ["toggle", ["c", "beep"]],
            "milestones", "blank", "blank", "upgrades"]
```

It is a list of components, which can be either just a name, or an array with arguments. If it's an array,
the first item is the name of the component, the second is the data passed into it, and the third (optional)
applies a CSS style to it with a "CSS object", where the keys are CSS attributes.

These are the existing components, but you can create more in v.js:

- display-text: Displays some text (can use basic HTML). The argument is the text to display. It can also be a function that returns updating text.

- raw-html: Displays some basic HTML, can also be a function.

- blank: Adds empty space. The default dimensions are 8px x 17px. The argument changes the dimensions.
         If it's a single value (e.g. "20px"), that determines the height.
         If you have a pair of arguments, the first is width and the second is height.

- row: Display a list of components horizontally. The argument is an array of components in the tab layout format.

- column: Display a list of components vertically. The argument is an array of components in the tab layout format.
          This is useful to display columns within a row.

- main-display: The text that displays the main currency for the layer and its effects.

- prestige-button: The argument is a string that the prestige button should say before the amount of
                   currency you will gain. It can also be a function that returns updating text.

- upgrades, milestones, challs, achievements: Display the upgrades, milestones, and challenges for a layer, as appropriate.

- buyables, clickables: Display all of the buyables/clickables for this layer, as appropriate. The argument optional,
            and is the size of the boxes in pixels.

- microtabs: Display a set of subtabs for an area. The argument is the name of the set of microtabs in the "microtabs" feature.

- upgrade, milestone, chall, buyable, clickable, achievement: An individual upgrade, challenge, etc. The argument is the id.
        This can be used if you want to have upgrades split up across multiple subtabs, for example.

- bar: Display a bar. The argument is the id of the bar to display.

- toggle: A toggle button that toggles a bool value. The data is a pair that identifies what bool to toggle, [layer, id]

- respec-button, master-button: The respec and master buttons for buyables and clickables, respectively.