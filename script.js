/*
 * Copyright (c) 2024 ad
 * Alle Rechte vorbehalten.
 */

let buttonId;
// var screenId = 'start';
var woNr = '-';
var buttonsHistory = [];
var screensHistory = [];

insertExternalMenu();

/**
 * Die Funktion "saveButtonId" speichert die ID des geklickten Buttons.
 *
 * @param {string} clickedId - Die ID des geklickten Buttons.
 */
function saveButtonId(clickedId) {
    buttonId = clickedId;
}

/**
 * Die Funktion "backButtonAction" ermöglicht das Navigieren zurück im Bildschirmverlauf.
 * Sie entfernt das letzte Element aus der Navigationsgeschichte und navigiert zum vorherigen Bildschirm.
 */
function backButtonAction() {

    // Entfernen das letzte Element aus der Navigationsgeschichte
    screensHistory.pop();
    buttonsHistory.pop();

    // Navigieren zum vorherigen Bildschirm
    var previousScreenId = screensHistory[screensHistory.length - 1];
    navigateToScreen(previousScreenId);
}

/**
 * Die Funktion "navigateToScreen" ermöglicht das Navigieren zu einem bestimmten Bildschirm.
 * Sie aktualisiert die Bildschirmverlauf und Buttons-Historie und zeigt den gewünschten Bildschirm an.
 *
 * @param {string} screenId - Die ID des Bildschirms, zu dem navigiert werden soll.
 */
function navigateToScreen(screenId) {


    // Vorbereitung für den Aufruf des Start-Bildschirms    
    if (screenId === 'start' || screenId === 'board0') {
        buttonsHistory = [];
        screensHistory = [];
    }

    // Fügen die ID des geklickten Buttons am Anfang der Buttons-Geschichte hinzu, ohne "Zurück"-Button zu speichern
    if (buttonId != 'backButton' && buttonId != 'home' 
        &&
        buttonsHistory[buttonsHistory.length - 1] != buttonId
    ) {
        buttonsHistory.push(buttonId);
    }
    // Fügen die ID des neuen Bildschirms zur Navigationsgeschichte hinzu
    if (
        screensHistory[screensHistory.length - 1] != screenId
    ) {
        screensHistory.push(screenId);
    }
    // Verstecken den aktuellen Bildschirm
    document.querySelector('.active').classList.remove('active');
    // Zeigen den neuen Bildschirm an
    document.getElementById(screenId).classList.add('active');

    // Zeigen die Zurück-Button und Home-Button an, wenn nicht auf dem Startbildschirm
    if (screenId !== 'board0' && screenId !== 'start') {
        document.getElementById('backButton').style.display = 'block';
        document.getElementById('home').style.display = 'block';

    } else {
        document.getElementById('backButton').style.display = 'none';
        document.getElementById('home').style.display = 'none';
    }

    updateVisibility(screenId);

}

/**
 * Die Funktion "updateVisibility" aktualisiert die Sichtbarkeit der Buttons und Items basierend auf dem aktiven Bildschirm.
 * Sie überprüft, ob die Items die gewünschten Attribute haben, und passt die Sichtbarkeit entsprechend an.
 *
 * @param {string} activeScreen - Die ID des aktiven Bildschirms.
 */
function updateVisibility(activeScreen) {

    // updateScreenTitle(activeScreen);

    const collectedAttributes = collectItemsAttributes();

    // Wenn der aktive Bildschirm "board" ist, wird die "Klickgeschichte" gelöscht.
    if (activeScreen === 'board0' || activeScreen === 'start') {
        buttonsHistory = [];
        //screensHistory = [];
    }

    updateScreenTitle(activeScreen);


    // Hier werden alle Buttons auf dem aktiven Bildschirm ausgewählt.
    const allButtonsOnActiveScreen = document.querySelectorAll(`#${activeScreen} button`);

    // Für jeden Button wird eine Überprüfung durchgeführt, um zu bestimmen, ob er sichtbar sein soll.
    allButtonsOnActiveScreen.forEach(buttonToCheck => {
        let isVisible = false; // Standardmäßig ist der Button unsichtbar.
        let buttonFromStart = false; // Zusätzliches Check,ob ein Button auf dem "board0" ist.
        const idOfTheButton = buttonToCheck.getAttribute('data-id'); // Die ID des Buttons wird gespeichert.
        const attributeToCheck = [idOfTheButton]; // Ein Array mit der ID des Buttons als gewünschtes Attribut.

        // Am Anfang werden einzelne Buttons aus dem Bildschirm "board0" auf die Sichtbarkeit geprüft. 
        if (idOfTheButton === 'From Sections' || idOfTheButton === 'From Qualifications') {
            isVisible = false;
            buttonFromStart = true;
            if (CheckScreenForVisibleButtons('progress-jobcards', collectedAttributes, ['Ready'])) {
                isVisible = true;
            }
        };

        if (idOfTheButton === 'Packages: ') {
            isVisible = false;
            buttonFromStart = true;
            if (checkItemHasSpecificNoExcluded(collectedAttributes, ['AVI-001', 'AVI-002', 'MECH-001', 'MECH-002', 'MECH-003'], ['Ready'])) {
                isVisible = true;
            }
        };

        if (idOfTheButton === 'Tests, Inside' || idOfTheButton === 'Tests, Outside' || idOfTheButton === '---') {
            isVisible = false;
            buttonFromStart = true;
            if (checkItemAttributesMatch(collectedAttributes, attributeToCheck, ['Ready']).length > 0) {
                isVisible = true; // Wenn der Button hat einmal oder öfter passende Werte in Items, wird es sichtbar gemacht.
            }
        };

        if (idOfTheButton === 'AVI-001' || idOfTheButton === 'AVI-002' || idOfTheButton === 'MECH-001' || idOfTheButton === 'MECH-002' || idOfTheButton === 'MECH-003') {
            isVisible = false;
            if (CheckScreenForVisibleButtons('jobcards', collectedAttributes, ['Ready'])) {
                isVisible = true;
            }
        };

        // Wenn der aktive Bildschirm kein "board0" oder kein Bildschirm mit Items ist, wird überprüft, ob der Button ein passendes Wert in Items hat. Dabei wird auch geprüft, ob auch Buttons aus "Klickverlauf" dabei sind.
        if (activeScreen === 'packages-jobcards' || activeScreen === 'progress-jobcards' || activeScreen === 'jobcards') {

            isVisible = false;

            if (buttonsHistory[0] === 'From Sections' || buttonsHistory[0] === 'From Qualifications' || buttonsHistory[0] === 'Packages: ' || buttonsHistory[0] === 'AVI-001' || buttonsHistory[0] === 'AVI-002' || buttonsHistory[0] === 'MECH-001' || buttonsHistory[0] === 'MECH-002' || buttonsHistory[0] === 'MECH-003') {
                const buttonStack = buttonsHistory.shift();

                if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
                    isVisible = true; // Wenn der Button hat einmal oder öfter passende Werte in Items, wird es sichtbar gemacht.
                }
                buttonsHistory.unshift(buttonStack);
            } else {
                if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
                    isVisible = true;
                }
            }
        };


        
        // if (activeScreen === 'progress-jobcards') {

        //     isVisible = false;

        //     if (buttonsHistory[0] === 'From Sections') {
        //         const buttonStack = buttonsHistory.shift();

        //         if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
        //             isVisible = true; // Wenn der Button hat einmal oder öfter passende Werte in Items, wird es sichtbar gemacht.
        //         }
        //         buttonsHistory.unshift(buttonStack);
        //     } else {
        //         if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
        //             isVisible = true;
        //         }
        //     }
        // };

        if (activeScreen === 'section-progress' || activeScreen === 'qualification-section') {
            isVisible = false;
            const buttonStack = buttonsHistory.shift();

            if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready', '---', 'Tests, Inside', 'Tests, Outside']).length > 0) {
                isVisible = true; // Wenn der Button alle gewünschten Attribute hat, wird er sichtbar.
            }
            buttonsHistory.unshift(buttonStack);

        };

        // if (activeScreen === 'packages-jobcards') {
        //     isVisible = false;
        //     if (checkItemAttributesMatch(collectedAttributes, attributeToCheck, ['Ready']).length > 0) {
        //         // console.log("Test für packages-jobcards");
        //         isVisible = true; // Wenn der Button alle gewünschten Attribute hat, wird er sichtbar.
        //     }
        // };

        // Abhängig davon, ob der Button sichtbar ist oder nicht, wird die Klasse des Buttons entsprechend angepasst.
        buttonToCheck.classList = isVisible ? 'button-style' : 'inaktiverButton';

        if (!isVisible && buttonFromStart) {
            buttonToCheck.classList = 'inaktiverButtonStart';
        }

    });

    // Wenn der aktive Bildschirm "itemsJC1", "itemsJC2" oder "itemsJC3" ist, wird überprüft,
    // ob das Item gewünschten Attribute aus der ButtonsHistory hat.
    if (activeScreen === 'itemsJC080' || activeScreen === 'itemsJC102' || activeScreen === 'itemsJC118') {
        // Hier werden alle Items auf dem aktiven Bildschirm ausgewählt, falls sie ein Attribut 'data-Item' haben.
        const allItemsOnActiveScreen = document.querySelectorAll(`#${activeScreen} .row`);

        allItemsOnActiveScreen.forEach(itemRow => {
            const itemToCheck = itemRow.querySelector('[data-Item]');
            if (itemToCheck) {
                let isVisible = false; // Standardmäßig ist das Item unsichtbar.
                
                // Für jedes dieser Items wird eine Überprüfung durchgeführt, um zu bestimmen, ob es sichtbar sein soll.
                const valueInItemToCheck = itemToCheck.getAttribute('id'); // Die ID des Items wird gespeichert.
                const attributeToCheck = [valueInItemToCheck]; // Ein Array mit der ID des Items als gewünschtes Attribut.

                if (buttonsHistory[0] === 'From Sections' || buttonsHistory[0] === 'From Qualifications' || buttonsHistory[0] === 'Packages: ') {
                    const buttonStack = buttonsHistory.shift();

                    if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
                        isVisible = true; // Wenn das Item alle durch früherer Auswahl (buttonsHistory) gewünschten Attribute hat, wird es sichtbar.
                    }
                    buttonsHistory.unshift(buttonStack);
                } else {
                    if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
                        isVisible = true; // Wenn das Item alle durch früherer Auswahl (buttonsHistory) gewünschten Attribute hat, wird es sichtbar.
                    }
                }

                // Setzen spezifische Klassen für bestimmte Elemente
                const packageElement = itemRow.querySelector('[data-packageName]');
                if (packageElement) {
                    packageElement.classList = isVisible ? 'package-style' : 'inaktiverItem';
                }

                const textareaElement = itemRow.querySelector('textarea');
                if (textareaElement) {
                    textareaElement.classList = isVisible ? 'custom-textarea' : 'inaktiverItem';
                }

                const itemElement = itemRow.querySelector('[data-Item]');
                if (itemElement) {
                    itemElement.classList = isVisible ? 'item-style' : 'inaktiverItem';
                }
            }
        });
    };
}

document.getElementById('wosearch').addEventListener('submit', function (event) {
    // Verhindert das Neuladen der Seite
    event.preventDefault();

    // Erfasst den Wert des Eingabefeldes
    const woValue = document.getElementById('wos').value;
    woNr = woValue;

    // Aufrufen einer Funktion nach dem Absenden des Formulars
    navigateToScreen('board0');
});

/**
 * Die Funktion "addListenerToMenu" fügt EventListener zu Menü-Elementen hinzu.
 * Sie ermöglicht das Ändern der Attribute eines Items basierend auf der Auswahl im Dropdown-Menü.
 *
 * @param {Element} itemElement - Das Element, an das der EventListener hinzugefügt wird.
 */
function addListenerToMenu(itemElement) {
    var menuElement = itemElement.querySelectorAll('.attributs-list');

    menuElement.forEach(element => {
        element.addEventListener('change', handleDropdownChange);
        function handleDropdownChange() {
            if (element.hasAttribute('data-boardMenu')) {
                itemElement.setAttribute('data-board', this.value);
            };
            if (element.hasAttribute('data-sectionMenu')) {
                itemElement.setAttribute('data-section', this.value);
            };
            if (element.hasAttribute('data-qualificationMenu')) {
                itemElement.setAttribute('data-qualification', this.value);
            };
        }
    });
}

/**
 * Die Funktion "updateScreenTitle" aktualisiert den Titel des aktiven Bildschirms.
 * Sie setzt den Titel basierend auf der aktuellen Navigation und den zuletzt geklickten Buttons.
 *
 * @param {string} activeScreen - Die ID des aktiven Bildschirms.
 */
function updateScreenTitle(activeScreen) {
    const title = document.querySelector(`#${activeScreen} .screen-title`);

    if (title) {

        // Erstellen ein Objekt, das die Buttons mit den entsprechenden Anzeigebegriffen mappt
        const buttonToDisplayMap = {
            'From Sections': 'Sections',
            'From Qualifications': 'Qualifications',
            'Packages: ': 'Packages',
            '---': 'Not assigned',
            'AVI-001': 'AVI-001',
            'AVI-002': 'AVI-002',
            'MECH-001': 'MECH-001',
            'MECH-002': 'MECH-002',
            'MECH-003': 'MECH-003',
            'ToDo': 'To Do',
            'Next': 'Next',
            'InProgress': 'In Progress',
            'ForInspection': 'For Inspection',
            'Tests, Inside': 'Tests Inside',
            'Tests, Outside': 'Tests Outside',
            'Ready': 'Ready',
            'NF': 'NF',
            'FF': 'FF',
            'CF': 'CF',
            'AF': 'AF',
            'WI': 'WI',
            'STA': 'STA',
            'WW': 'WW',
            'LG': 'LG',
            'TAI': 'TAI',
            'ENG': 'ENG',
            'AT': 'AT',
            'INTER': 'INT',
            'CAB': 'CAB',
            'TEST': 'TEST',
            'MFB': 'MFB',
            'AVI': 'AVI',
            'MECH': 'MECH',
            'INT': 'INT',
            'PAINT': 'PAINT',
            'JC080': 'JC 080',
            'JC102': 'JC 102',
            'JC118': 'JC 118',

        };

        // Erstellen einen Array mit den Anzeigebegriffen in der Reihenfolge von buttonsHistory
        const displayTerms = buttonsHistory.map(button => buttonToDisplayMap[button] || '').filter(term => term !== '');

        // Erstellen den neuen Titel
        const newTitle = `WO: ${woNr}<br>${displayTerms.join(' &#x2027;&#x2027;&#x2708; ')}`;

        title.innerHTML = newTitle;

    }
}

/**
 * Die Funktion "collectItemsAttributes" sammelt die Attribute aller Elemente mit dem Attribut 'data-item' auf der Seite.
 * Jedes Element wird durch seine ID identifiziert, und die gesammelten Attribute
 * werden in einem Objekt gespeichert, wobei die ID des Elements der Schlüssel ist.
 *
 * @returns {Object} Ein Objekt, das die gesammelten Attribute für jedes Item enthält.
 *                    Jeder Schlüssel im Objekt ist die ID eines Elements, und der Wert
 *                    ist ein Array der Attribute, die diesem Element zugeordnet sind.
 */
function collectItemsAttributes() {
    // Selektieren die div mit der ID "item"
    const itemsDiv = document.querySelectorAll('[data-item]');
    // Initialisieren ein Objekt, um die gesammelten Attribute zu speichern
    const collectedAttributes = {};

    // Durchlaufen alle Elemente innerhalb der div "items"
    itemsDiv.forEach(itemDiv => {
        // Überprüfen, ob das Element die Attribute hat
        const itemId = itemDiv.getAttribute('id');
        const boardAttribute = itemDiv.getAttribute('data-board');
        const sectionAttribute = itemDiv.getAttribute('data-section');
        const qualificationAttribute = itemDiv.getAttribute('data-qualification');
        const jcAttribute = itemDiv.getAttribute('data-JC');
        // const statusAttribute = itemDiv.getAttribute('data-lineitemstatus');
        // const testAttribute = itemDiv.getAttribute('data-test');
        const packageValue = itemDiv.getAttribute('data-package');

        // Erstellen ein Array mit den Attributen für das aktuelle Item
        const itemAttributes = [itemId, jcAttribute, boardAttribute, sectionAttribute, qualificationAttribute, packageValue];

        // Fügen die Attribute für das aktuelle Item in das gesammelte Attribut-Objekt ein
        collectedAttributes[itemId] = itemAttributes;
    });
    // Geben die gesammelten Attribute zurück
    return collectedAttributes;
}


/**
 * Diese Funktion prüft, ob die gesammelten Attributes aller Items die gewünschten
 * Attribute enthalten und keine ausgeschlossenen Attribute haben.
 * 
 * @param {Object} collectedAttributes - Ein Objekt mit allen gesammelten Attributes.
 * @param {Array} attributesToCheck - Ein Array der zu überprüfenden Attributes.
 * @param {Array} attributesToExclude - Ein Array der auszuschließenden Attributes.
 * @returns {Array} Ein Array der IDs der Items, die die Bedingungen erfüllen.
 */
function checkItemAttributesMatch(collectedAttributes, attributesToCheck, attributesToExclude = null) {
    // Filtern die IDs der Items, die die Bedingungen erfüllen
    return Object.keys(collectedAttributes).filter(itemId => {
        // Holen die Attributes des aktuellen Items
        const itemAttributes = collectedAttributes[itemId];
        
        // Überprüfen, ob das Item alle gewünschten Attributes hat
        const hasAllRequiredAttributes = attributesToCheck.every(attr => itemAttributes.includes(attr));
        
        // Überprüfen, ob das Item keine ausgeschlossenen Attributes hat
        const lacksExcludedValues = checkExcludedValues(itemAttributes, attributesToExclude);
        
        // Das Item erfüllt die Bedingungen, wenn es alle gewünschten und keine ausgeschlossenen Attributes hat
        return hasAllRequiredAttributes && lacksExcludedValues;
    });
}

/**
 * Diese Funktion sucht nach einem Item, das mindestens ein spezifisches Attribut
 * hat und keine der ausgeschlossenen Attribute.
 * 
 * @param {Object} collectedAttributes - Ein Objekt mit allen gesammelten Attributes.
 * @param {Array} specificValues - Ein Array der spezifischen Attribute zu suchen.
 * @param {Array} attributesToExclude - Ein Array der auszuschließenden Attribute.
 * @returns {boolean} True, wenn ein solches Item gefunden wurde, sonst False.
 */
function checkItemHasSpecificNoExcluded(collectedAttributes, specificValues, attributesToExclude) {
    // Suchen nach einem Item, das die Bedingungen erfüllt
    return Object.values(collectedAttributes).some(itemAttributes => {
        // Überprüfen, ob das Item mindestens ein spezifisches Attribut hat
        const hasSomeSpecificValue = specificValues.some(value => 
            itemAttributes.includes(value));
        
        // Überprüfen, ob das Item keine ausgeschlossenen Attribute hat
        const lacksExcludedValues = checkExcludedValues(itemAttributes, attributesToExclude);
        
        // Das Item erfüllt die Bedingungen, wenn es ein spezifisches Attribut hat und keine ausgeschlossenen
        return hasSomeSpecificValue && lacksExcludedValues;
    });
}

/**
 * Diese Funktion überprüft, ob die Attribute eines Items keine ausgeschlossenen Werte enthalten.
 * 
 * @param {Array} itemAttributes - Die Attribute des Items.
 * @param {Array} excludedValues - Die auszuschließenden Attribute.
 * @returns {boolean} True, wenn das Item keine ausgeschlossenen Attribute hat.
 */
function checkExcludedValues(itemAttributes, excludedValues = null) {
    // Wenn keine auszuschließenden Attribute angegeben sind, erfüllt jedes Item die Bedingung
    if (!excludedValues) return true;    
    // Überprüfen, ob keines der Attribute des Items in der Liste der auszuschließenden Attribute ist
    return !itemAttributes.some(attr => excludedValues.includes(attr));
}


/**
 * Diese Funktion überprüft, ob auf dem angegebenen Bildschirm sichtbare Buttons vorhanden sind.
 * 
 * @param {*} screenId - Die ID des Bildschirms, auf dem die Buttons überprüft werden sollen. 
 * @param {*} collectedAttributes - Die gesammelten Attribute der Items. 
 * @param {*} attributesToExclude - Die auszuschließenden Attribute.
 * @param {*} definedId - Das Attribut, das die ID der Buttons definiert.
 * @returns 
 */
  function CheckScreenForVisibleButtons(screenId, collectedAttributes, attributesToExclude = [], definedId = 'data-id') {
    const allButtonsOnScreen = document.querySelectorAll(`#${screenId} button`);
    let hasVisibleButton = false;
  
    allButtonsOnScreen.forEach(buttonToCheck => {
      const idOfTheButton = buttonToCheck.getAttribute(definedId);
      const attributeToCheck = [idOfTheButton];
  
      if (checkItemAttributesMatch(collectedAttributes, attributeToCheck, attributesToExclude).length > 0) {
        hasVisibleButton = true;
      }
    });
  
    return hasVisibleButton;
  }




/**
 * Die Funktion "insertExternalMenu" fügt externe Menü-Elemente in die Tabelle ein.
 * Sie klont die Menü-Elemente und fügt sie an den entsprechenden Platzhaltern innerhalb der data-item Elemente an.
 */
function insertExternalMenu() {
    // Array mit den IDs der externen Elemente
    var externeElementIds = ['dataBoardMenu', 'dataSectionMenu', 'dataQualificationMenu'];
    // Array mit den Selektoren für die Platzhalter innerhalb der data-item Elemente
    var platzhalterSelectors = ['[data-item] [data-boardPlaceholder]', '[data-item] [data-sectionPlaceholder]', '[data-item] [data-qualificationPlaceholder]'];

    // Schleife 0. Suchen nach passende Elemente mit Patzhaltern
    externeElementIds.forEach((id, index) => {

        // Externes Element finden
        var externesElement = document.getElementById(id);
        // Alle Platzhalter innerhalb der data-item Elemente finden, die dem Selektor entsprechen
        var platzhalterElements = document.querySelectorAll(platzhalterSelectors[index]);


        // Schleife 1. Ersetzen Platzhalter durch eine Menu
        platzhalterElements.forEach(platzhalter => {

            // Zugriff auf den Namen des ersten Attributs
            var firstAttributeName = platzhalter.attributes[0].name;

            // Entfernen "Placeholder" aus dem Attributnamen
            var modifizierterAttributName = firstAttributeName.replace("placeholder", "");
            // Verwenden den modifizierten Namen, um den Wert des Attributs in dem Item zu erhalten
            var currentValue = platzhalter.parentElement.parentElement.getAttribute(modifizierterAttributName);

            // Klonen des externen Elements, um eine Kopie zu erstellen
            var externeElementKlon = externesElement.cloneNode(true);

            // Schleife 2. Prüfen den existierenden Wert in Item und setzen gleiches Wert im Menu als "select"
            externeElementKlon.querySelectorAll('*').forEach(optionValue => {

                if (optionValue.attributes[0].value === currentValue) {
                    optionValue.setAttribute("selected", "");
                    optionValue.selected = true;
                }
            });

            // Anhängen der Kopie an den Platzhalter
            platzhalter.appendChild(externeElementKlon);
        });
        // Verstecken des ursprünglichen externen Elements, um es sichtbar zu machen
        externesElement.style.display = 'none';
    });
}
