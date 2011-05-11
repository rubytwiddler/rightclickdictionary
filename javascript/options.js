/**
 ** 2011 by ruby.twiddler@gmail.com
 **  MIT License
 */

/**
 * Stores number of dictionary on the options page.
 */
var dictionaryCount = 0;

/**
 * Stores maximum count of custom dictionary.
 */
var MAX_CUS_DICTIONARIES = 20;

/**
 * Stores temporary added custom dictionaries which are not yet saved.
 */
var tempCusDictionaries = [];

/**
 * Checks whether ENTER key is pressed or not.
 */
function addCustomDictionary() {
  if (window.event.keyCode == 13) {
    addCusDictionary();
  }
}


/**
 * Displays various messages to user based on user input.
 * @param {String} id Id of status element.
 * @param {Number} timeOut Timeout value of message shown.
 * @param {String} message Message to be shown.
 */
function showUserMessages(id, timeOut, message) {
  $(id).style.setProperty('-webkit-transition',
      'opacity 0s ease-in');
  $(id).style.opacity = 1;
  $(id).innerText = chrome.i18n.getMessage(message);
  window.setTimeout(function() {
    $(id).style.setProperty(
        '-webkit-transition', 'opacity' + timeOut + 's ease-in');
    $(id).style.opacity = 0;
    }, 1E3
  );
}

/**
 * Sets options page CSS according to the browser language(if found), else sets
 * to default locale.
 */
function setOptionPageCSS() {
  if (chrome.i18n.getMessage('direction') == 'rtl') {
    document.querySelector('body').className = 'rtl';
  }
}

/**
 * Initializes the options page
 */
function initialize() {
  setOptionPageCSS();
  setCountAndDictionaryList();
  setLocalizedLabel();

  // Adds a custom dictionary on press of Enter key.
  $('newKeyword').onkeypress = addCustomDictionary;
}


/**
 * localized labels
 */
var deleteLabel = 'delete';

/**
 * Retrieves locale values from locale file.
 */
function setLocalizedLabel() {
  var getI18nMsg = chrome.i18n.getMessage;

  $('save_button').innerText = 'save'; //getI18nMsg('save');
//   $('delete_button').value = 'delete'; //getI18nMsg('deleteTitle');
  deleteLabel = 'delete';
  $('submit_button').value = 'add'; //getI18nMsg('submitButton');
}


/**
 * Sets dictionary list and number of stories retrieved from localstorage(if any)
 * otherwise sets to default.
 */
function setCountAndDictionaryList() {

  // Retrieves list of custom dictionaries from localstorage(if any) and shows it
  // in option page.
  var cusDictionaries = JSON.parse(window.localStorage.getItem('dictionaries'));
  if (cusDictionaries) {
    // Template to store custom dictionarys in a table.
    var template = [];
    var title = chrome.i18n.getMessage('deleteTitle');
    for (var i = 0; i < cusDictionaries.length; i++) {
      dictionaryCount++;

      template.push('<tr style = "height: 22px;">');
      template.push('<td id = "keyword_value" class = "cusDictionariesClass">');
      template.push('<textarea class="noborder" readonly>');
      template.push(cusDictionaries[i]);
      template.push('</textarea>');
      template.push('<button id = "delete_button" type = "button" onclick = "delCusDictionary(this)" style = "vertical-align:middle;">')
      template.push(deleteLabel)
      template.push('</button>')
      template.push('</td>');
      template.push('</tr>');
    }
    $('custom_dictionaries').innerHTML = template.join('');
    if (cusDictionaries.length == MAX_CUS_DICTIONARIES) {
      $('submit_button').disabled = true;
      $('newKeyword').readOnly = 'readonly';
    }
  }

}

/**
 * Saves checked dictionary list(if any), Custom dictionarys(if any), number of
 * stories and country value in local storage.
 */
function saveOptions() {
  var dictionaries = JSON.parse(window.localStorage.getItem('dictionaries'));

  // Saves custom dictionries to local storage(if any).
  if (tempCusDictionaries.length > 0) {
    if (dictionaries) {
      dictionaries = dictionaries.concat(tempCusDictionaries);
      window.localStorage.setItem('dictionaries', JSON.stringify(dictionaries));
    } else {
      window.localStorage.setItem('dictionaries', JSON.stringify(tempCusDictionaries));
    }
    tempCusDictionaries.splice(0, tempCusDictionaries.length);
  }

  showUserMessages('save_status', 0.5, 'saveStatus');
//   $('save_button').disabled = true;
}



/**
 * Adds new entered custom dictionary.
 */
function addCusDictionary() {
  // Retrieves custom dictionary list from local storage(if any), else create new
  // array list.
  var cusDictionaries = JSON.parse(window.localStorage.getItem('dictionaries') || "[]");

  // Adds dictionary only if total number of added custom dictionarys are less than 10.
  if (cusDictionaries.length + tempCusDictionaries.length <= (MAX_CUS_DICTIONARIES - 1)) {

    // Stores new entered value in input textbox.
    var val = $('newKeyword').value;
    if (val) {
      val = val.trim();
      if (val.length > 0) {
        var pattern = /,/g;

        // Runs if comma(,) is not present in dictionary entered.
        if (val.match(pattern) == null) {
          dictionaryCount++;
          tempCusDictionaries.push(val);

          // Template to store custom dictionarys in a table.
          var template = [];
          var title = chrome.i18n.getMessage('deleteTitle');

          template.push('<tr style = "height: 22px;">');
          template.push('<td id = "keyword_value" class = "cusDictionariesClass">');
          template.push('<textarea class="noborder" readonly>');
          template.push(val);
          template.push('</textarea>');
          template.push('<button id = "delete_button" type = "button" onclick = "delCusDictionary(this)" style = "vertical-align:middle;">')
          template.push(deleteLabel)
          template.push('</button>')
          template.push('</td>');
          template.push('</tr>');

          $('custom_dictionaries').innerHTML += template.join('');
        } else {
          showUserMessages('invalid_status', 2.5, 'invalidChars');
        }
      }
      $('newKeyword').value = '';
    }
  }

  if ((cusDictionaries.length + tempCusDictionaries.length) == (MAX_CUS_DICTIONARIES)) {
    $('submit_button').disabled = true;
    $('newKeyword').readOnly = 'readonly';
  }
}

/**
 * Delete custom dictionary whenever users click on delete icon.
 * @param {HTMLTableColElement} obj HTML table column element to be deleted.
 */
function delCusDictionary(obj) {
    var value;

    // Extract custom dictionary value.
    value = obj.parentNode.querySelector('.cusDictionariesClass textarea').value;

    // Removes custom dictionary element from UI.
    $('custom_dictionaries').removeChild(obj.parentNode.parentNode);

    // Removes custom dictionary element either from temporary array(if dictionary is
    // not yet saved) or from saved dictionary list and saves new list to
    // local storage.
    var flag = 0;
    for (var i = 0; i < tempCusDictionaries.length; i++) {
        if (tempCusDictionaries[i] == value) {
        tempCusDictionaries.splice(i, 1);
        flag = 1;
        break;
        }
    }

    if (flag == 0) {
        var cusDictionaries = JSON.parse(window.localStorage.getItem('dictionaries'));
        for (i = 0; i < cusDictionaries.length; i++) {
            if (cusDictionaries[i] == value) {
                cusDictionaries.splice(i, 1);
                break;
            }
        }
        if (cusDictionaries.length > 0) {
            window.localStorage.setItem('dictionaries', JSON.stringify(cusDictionaries));
        } else {
            window.localStorage.removeItem('dictionaries');
        }
    }

    dictionaryCount--;
    $('submit_button').disabled = false;
    $('newKeyword').readOnly = false;
}
