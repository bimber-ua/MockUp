/*
 * Copyright (c) 2024 A.Dinkajew
 * Alle Rechte vorbehalten.
 */

let buttonId;
// var screenId = 'start';
var woNr = '-';
var buttonsHistory = [];
var screensHistory = [];
let currentViewMode = 'normal'; // Mögliche Werte: 'normal', 'readyOnly'

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

    if (!previousScreenId || previousScreenId === 'board0' || previousScreenId === 'start') {
        currentViewMode = 'normal'; // Modus zurücksetzen
        if (!previousScreenId) previousScreenId = 'board0'; // Fallback, falls screensHistory leer ist
    } else if (buttonsHistory.length === 0 && currentViewMode === 'readyOnly') {
        // Wenn wir im readyOnly Modus waren und die History leer ist, zurück zum Normalmodus
         currentViewMode = 'normal';
    }


    navigateToScreen(previousScreenId);
}

/**
 * Die Funktion "navigateToScreen" ermöglicht das Navigieren zu einem bestimmten Bildschirm.
 * Sie aktualisiert die Bildschirmverlauf und Buttons-Historie und zeigt den gewünschten Bildschirm an.
 *
 * @param {string} screenId - Die ID des Bildschirms, zu dem navigiert werden soll.
 */
function navigateToScreen(screenId) {

    // Modus basierend auf der Aktion bestimmen
    if (screenId === 'start' || screenId === 'board0') {
        currentViewMode = 'normal';
        buttonsHistory = [];
        screensHistory = [];
    } else if (buttonId === 'ViewReadyItems') {
        currentViewMode = 'readyOnly';
        // Startet eine neue History für diesen Modus, wenn von board0 geklickt
        if (document.getElementById('board0').classList.contains('active') || screensHistory.length === 0 || screensHistory[screensHistory.length -1] === 'board0') {
            buttonsHistory = [buttonId];
        }
    } else if (document.getElementById('board0').classList.contains('active') && buttonId !== 'backButton' && buttonId !== 'home') {
        // Wenn von board0 ein anderer Filter als "ViewReadyItems" geklickt wird
        currentViewMode = 'normal';
    }


    // Fügen die ID des geklickten Buttons am Anfang der Buttons-Geschichte hinzu, ohne "Zurück"-Button zu speichern
    if (buttonId != 'backButton' && buttonId != 'home') {
        if (currentViewMode === 'normal') {
            // Normale Logik für buttonsHistory
            if (document.getElementById('board0').classList.contains('active') && buttonId !== 'ViewReadyItems') {
                 // Wenn board0 aktiv war und ein neuer Filter geklickt wurde (nicht ViewReadyItems), alte History löschen
                buttonsHistory = [buttonId];
            } else if (buttonsHistory.length === 0 || buttonsHistory[buttonsHistory.length - 1] !== buttonId) {
                buttonsHistory.push(buttonId);
            }
        } else if (currentViewMode === 'readyOnly') {
            // Im readyOnly-Modus: Wenn der geklickte Button nicht schon der erste in der History ist
            // (z.B. beim Klick auf eine JobCard nachdem "ViewReadyItems" geklickt wurde)
            if (buttonId !== buttonsHistory[0] && (buttonsHistory.length === 0 || buttonsHistory[buttonsHistory.length -1] !== buttonId)) {
                buttonsHistory.push(buttonId);
            }
        }
    }

    // Fügen die ID des neuen Bildschirms zur Navigationsgeschichte hinzu
    if (screensHistory.length === 0 || screensHistory[screensHistory.length - 1] !== screenId) {
        screensHistory.push(screenId);
    }

    // Verstecken den aktuellen Bildschirm
    const activeScreenElement = document.querySelector('.screen.active');
    if (activeScreenElement) {
        activeScreenElement.classList.remove('active');
    }
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
    const collectedAttributes = collectItemsAttributes();

    // Stellt sicher, dass der Modus korrekt ist, wenn board0/start erreicht wird
    if (activeScreen === 'board0' || activeScreen === 'start') {
        // currentViewMode und buttonsHistory werden bereits in navigateToScreen korrekt gesetzt
        // Falls man direkt zu board0 springt (z.B. Home Button), sicherstellen, dass der Modus normal ist
        if (buttonId === 'home' || activeScreen === 'start') {
            currentViewMode = 'normal';
            buttonsHistory = [];
        }
    }
    updateScreenTitle(activeScreen);

    const allButtonsOnActiveScreen = document.querySelectorAll(`#${activeScreen} button`);

    allButtonsOnActiveScreen.forEach(buttonToCheck => {
        let isVisible = false;
        let buttonIsOnBoard0AndInactive = false;
        const idOfTheButton = buttonToCheck.getAttribute('data-id');
        const attributeToCheck = [idOfTheButton];

        if (activeScreen === 'board0') {
            // currentViewMode = 'normal'; // Wird schon in navigateToScreen gesetzt
            if (idOfTheButton === 'ViewReadyItems') {
                isVisible = true; // Der neue Button ist immer sichtbar
            } else if (idOfTheButton === 'From Sections' || idOfTheButton === 'From Qualifications') {
                if (CheckScreenForVisibleButtons('progress-jobcards', collectedAttributes, ['Ready'])) {
                    isVisible = true;
                }
                if (!isVisible) buttonIsOnBoard0AndInactive = true;
            } else if (idOfTheButton === 'Packages: ') {
                if (checkItemHasSpecificNoExcluded(collectedAttributes, ['AVI-001', 'AVI-002', 'MECH-001', 'MECH-002', 'MECH-003'], ['Ready'])) {
                    isVisible = true;
                }
                if (!isVisible) buttonIsOnBoard0AndInactive = true;
            } else if (idOfTheButton === 'Tests, Inside' || idOfTheButton === 'Tests, Outside' || idOfTheButton === '---') {
                if (checkItemAttributesMatch(collectedAttributes, attributeToCheck, ['Ready']).length > 0) {
                    isVisible = true;
                }
                if (!isVisible) buttonIsOnBoard0AndInactive = true;
            }
        } else if (currentViewMode === 'readyOnly') {
            if (activeScreen === 'jobcards' && buttonToCheck.hasAttribute('data-JC')) { // JobCard Buttons
                // Sichtbar, wenn die JC mindestens ein 'Ready' Item hat
                isVisible = Object.values(collectedAttributes).some(itemAttrs =>
                    itemAttrs[1] === idOfTheButton && // itemAttrs[1] ist jcAttribute
                    itemAttrs[2] === 'Ready'      // itemAttrs[2] ist boardAttribute
                );
            }
            // Andere Buttons in diesem Modus sind standardmäßig unsichtbar, es sei denn, es gibt spezifische Regeln
        } else { // Normaler Modus, nicht auf board0
            // Bestehende Logik für Button-Sichtbarkeit in anderen Screens
            if (activeScreen === 'packages-jobcards' || activeScreen === 'progress-jobcards' || activeScreen === 'jobcards') {
                if (buttonsHistory.length > 0 && (buttonsHistory[0] === 'From Sections' || buttonsHistory[0] === 'From Qualifications' || buttonsHistory[0] === 'Packages: ' || (buttonsHistory[0] && buttonsHistory[0].startsWith('AVI-')) || (buttonsHistory[0] && buttonsHistory[0].startsWith('MECH-')))) {
                    const historyCopy = [...buttonsHistory]; // Kopie erstellen
                    const firstButton = historyCopy.shift(); // Erstes Element entfernen
                    if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...historyCopy], ['Ready']).length > 0) {
                        isVisible = true;
                    }
                } else if (buttonsHistory.length > 0) {
                     if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...buttonsHistory], ['Ready']).length > 0) {
                        isVisible = true;
                    }
                } else { // Fallback, falls buttonsHistory leer oder nicht passend
                    if (checkItemAttributesMatch(collectedAttributes, attributeToCheck, ['Ready']).length > 0) {
                        isVisible = true;
                    }
                }
            } else if (activeScreen === 'section-progress' || activeScreen === 'qualification-section') {
                 if (buttonsHistory.length > 0) {
                    const historyCopy = [...buttonsHistory]; // Kopie erstellen
                    const firstButton = historyCopy.shift(); // Erstes Element entfernen
                    if (checkItemAttributesMatch(collectedAttributes, [...attributeToCheck, ...historyCopy], ['Ready', '---', 'Tests, Inside', 'Tests, Outside']).length > 0) {
                        isVisible = true;
                    }
                }
            }
        }

        // Klassen setzen
        buttonToCheck.className = isVisible ? 'button-style' : (buttonIsOnBoard0AndInactive ? 'inaktiverButtonStart' : 'inaktiverButton');
    });

    // Sichtbarkeit der Items
    if (activeScreen.startsWith('itemsJC')) {
        const allItemsOnActiveScreen = document.querySelectorAll(`#${activeScreen} .row`);
        allItemsOnActiveScreen.forEach(itemRow => {
            const itemToCheck = itemRow.querySelector('[data-Item]');
            if (itemToCheck) {
                let itemIsVisible = false;
                if (currentViewMode === 'readyOnly') {
                    itemIsVisible = itemToCheck.getAttribute('data-board') === 'Ready';
                } else { // Normaler Modus
                    const itemIdForCheck = itemToCheck.getAttribute('id');
                    const tempAttributeToCheck = [itemIdForCheck]; // Muss ein Array sein für checkItemAttributesMatch

                    if (buttonsHistory.length > 0 && (buttonsHistory[0] === 'From Sections' || buttonsHistory[0] === 'From Qualifications' || buttonsHistory[0] === 'Packages: ')) {
                        const historyCopy = [...buttonsHistory];
                        const firstButton = historyCopy.shift();
                        if (checkItemAttributesMatch(collectedAttributes, [...tempAttributeToCheck, ...historyCopy], ['Ready']).includes(itemIdForCheck)) {
                            itemIsVisible = true;
                        }
                    } else {
                        if (checkItemAttributesMatch(collectedAttributes, [...tempAttributeToCheck, ...buttonsHistory], ['Ready']).includes(itemIdForCheck)) {
                            itemIsVisible = true;
                        }
                    }
                }

                // Klassen für Item-Bestandteile setzen
                const packageElement = itemRow.querySelector('[data-packageName]');
                const textareaElement = itemRow.querySelector('textarea');
                const itemElementItself = itemRow.querySelector('[data-Item]'); // Das ist itemToCheck
                
                if (itemIsVisible) {
                    if (itemElementItself) itemElementItself.className = itemToCheck.getAttribute('data-board') === 'Ready' ? 'item-style-ready' : 'item-style';
                    if (packageElement) packageElement.className = 'package-style';
                    if (textareaElement) textareaElement.className = 'custom-textarea';
                } else {
                    if (itemElementItself) itemElementItself.className = 'inaktiverItem';
                    if (packageElement) packageElement.className = 'inaktiverItem';
                    if (textareaElement) textareaElement.className = 'inaktiverItem';
                }
            }
        });
    }
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
    const isReady = itemElement.getAttribute('data-board') === 'Ready';

    menuElement.forEach(element => {
        if (isReady) {
            element.disabled = true; // Deaktiviere das Dropdown-Menü
            element.style.cursor = 'not-allowed'; // Ändere den Cursor, um anzuzeigen, dass es nicht klickbar ist
            // Optional: Einen anderen Stil für deaktivierte Menüs hinzufügen, falls gewünscht
            // element.classList.add('disabled-menu');
        } else {
            element.disabled = false;
            element.style.cursor = 'pointer';
            // element.classList.remove('disabled-menu'); // Falls eine spezielle Klasse verwendet wird
            element.addEventListener('change', handleDropdownChange);
        }

        function handleDropdownChange() {
            // Nur ausführen, wenn das Element nicht deaktiviert ist (obwohl der Listener bei 'disabled' nicht feuern sollte)
            if (this.disabled) return;

            if (element.hasAttribute('data-boardMenu')) {
                itemElement.setAttribute('data-board', this.value);
            };
            if (element.hasAttribute('data-sectionMenu')) {
                itemElement.setAttribute('data-section', this.value);
            };
            if (element.hasAttribute('data-qualificationMenu')) {
                itemElement.setAttribute('data-qualification', this.value);
            };
            // Nach Änderung die Sichtbarkeit aktualisieren, da sich Filterbedingungen ändern könnten
            // und auch die Menüs neu bewertet werden müssen (z.B. wenn ein Item auf "Ready" gesetzt wird)
            updateVisibility(document.querySelector('.screen.active').id);

            // Wichtig: Wenn ein Item auf "Ready" gesetzt wird, müssen die Listener neu evaluiert werden,
            // um die Menüs dieses Items zu deaktivieren.
            // Da updateVisibility bereits die Item-Klassen aktualisiert,
            // müssen wir hier sicherstellen, dass die Menüs für dieses spezifische Item neu behandelt werden.
            // Eine einfache Möglichkeit ist, die Listener für dieses Item neu zu initialisieren,
            // oder die Deaktivierungslogik direkt hier nach der Attributänderung anzuwenden.
            if (itemElement.getAttribute('data-board') === 'Ready') {
                itemElement.querySelectorAll('.attributs-list').forEach(menu => {
                    menu.disabled = true;
                    menu.style.cursor = 'not-allowed';
                    // menu.classList.add('disabled-menu');
                    // Wichtig: Den EventListener entfernen, um mehrfache Bindungen zu vermeiden,
                    // falls diese Funktion erneut für dasselbe Element aufgerufen wird.
                    // Da wir den Listener nur hinzufügen, wenn nicht 'Ready', ist das hier nicht kritisch,
                    // aber eine gute Praxis wäre, den Listener zu entfernen, bevor man ihn neu hinzufügt oder
                    // die Logik so zu gestalten, dass sie idempotent ist.
                    // Für diesen Fall reicht es, den Zustand zu setzen.
                });
            }
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
    const titleElement = document.querySelector(`#${activeScreen} .screen-title`);

    if (titleElement) {
        const buttonToDisplayMap = {
            'From Sections': 'Sections',
            'From Qualifications': 'Qualifications',
            'Packages: ': 'Packages',
            '---': 'Not assigned',
            'ViewReadyItems': 'Overview: Ready Items', // Neuer Eintrag
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
            'INTER': 'INT', // Beachte: Im HTML ist es INTER, hier INT. Konsistenz prüfen.
            'CAB': 'CAB',
            'TEST': 'TEST',
            'MFB': 'MFB',
            'AVI': 'AVI',
            'MECH': 'MECH',
            // 'INT': 'INT', // Bereits oben, falls es unterschiedliche INTs gibt, anpassen
            'PAINT': 'PAINT',
            'JC080': 'JC .080',
            'JC102': 'JC .102',
            'JC118': 'JC .118',
        };

        let newTitleContent;
        if (currentViewMode === 'readyOnly') {
            let readyTitleParts = [];
            // Füge den "ViewReadyItems" Titel hinzu, wenn er der erste in der History ist
            if (buttonsHistory.length > 0 && buttonsHistory[0] === 'ViewReadyItems' && buttonToDisplayMap[buttonsHistory[0]]) {
                 readyTitleParts.push(buttonToDisplayMap[buttonsHistory[0]]);
            } else if (buttonsHistory.length === 0 && activeScreen === 'jobcards') { // Fall: Direkt zu jobcards im readyOnly Modus (sollte nicht passieren, aber sicherheitshalber)
                readyTitleParts.push(buttonToDisplayMap['ViewReadyItems']);
            }


            // Füge die aktuelle JobCard hinzu, falls ausgewählt und nicht schon der erste Teil des Titels
            const currentJc = buttonsHistory.find(b => b && b.startsWith('JC'));
            if (currentJc && buttonToDisplayMap[currentJc] && (readyTitleParts.length === 0 || readyTitleParts[0] !== buttonToDisplayMap[currentJc])) {
                if (readyTitleParts.length === 0 && buttonsHistory[0] === 'ViewReadyItems') { // Wenn nur ViewReadyItems in History, dann JC als nächstes
                     readyTitleParts.push(buttonToDisplayMap[buttonsHistory[0]]); // "Overview: Ready Items"
                }
                readyTitleParts.push(buttonToDisplayMap[currentJc]);
            }
             // Wenn readyTitleParts leer ist (z.B. nur auf jobcards ohne JC-Klick), Standardtitel für Ready-Modus
            if (readyTitleParts.length === 0 && activeScreen === 'jobcards' && currentViewMode === 'readyOnly') {
                readyTitleParts.push(buttonToDisplayMap['ViewReadyItems']);
            }

            newTitleContent = `WO: ${woNr}<br>${readyTitleParts.join(' &#x2027;&#x2027;&#x2708; ')}`;

        } else {
            // Normaler Titelaufbau
            const displayTerms = buttonsHistory.map(button => buttonToDisplayMap[button] || '').filter(term => term !== '');
            newTitleContent = `WO: ${woNr}<br>${displayTerms.join(' &#x2027;&#x2027;&#x2708; ')}`;
        }
        titleElement.innerHTML = newTitleContent;
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
            externeElementKlon.querySelectorAll('select > option').forEach(optionValue => { // Genauerer Selektor für Optionen
                if (optionValue.value === currentValue) { // Vergleiche mit option.value
                    optionValue.setAttribute("selected", "selected"); // Korrektes Setzen von selected
                    // optionValue.selected = true; // Ist auch möglich, aber setAttribute ist expliziter
                }
            });

            // Anhängen der Kopie an den Platzhalter
            platzhalter.appendChild(externeElementKlon);
        });
        // Verstecken des ursprünglichen externen Elements, da es nur als Vorlage dient
        externesElement.style.display = 'none';
    });
}
