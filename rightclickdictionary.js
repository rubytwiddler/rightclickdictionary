// Copyright (c) 2011 ruby.twiddler@gmail.com. All rights reserved.
// Use of this source code is governed by a MIT-style license that can be
// found in the LICENSE file.

function menuOnClick(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

    var word = info.selectionText.replace(/^\s+/,'').replace(/[^\w\-].*$/,'');
    var dicObj = menuTbl[info.menuItemId];
    var uri = dicObj.uri.replace(/#{word}/g, word);
    uri = uri.replace(/%s/g, word);
    console.log("jump url: " + uri);

    function onCreateTab(tab) {
        console.log("created tab: " + JSON.stringify(tab));
        dicObj.tabId = tab.id;
    };
    if (dicObj.tabId) {
        chrome.tabs.update(dicObj.tabId, {"url":uri});
    } else {
        chrome.tabs.create({"url":uri}, onCreateTab);
    }
}


function onRemovedTab(tabId) {
    console.log("tab removed: " + tabId);
    for(id in menuTbl) {
        dicObj = menuTbl[id];
        console.log("check dicObj: " + JSON.stringify(dicObj));
        if (dicObj.tabId == tabId) {
            dicObj.tabId = false;
        }
    }
}

menuTbl = new Array();

function addDictionarySite(site) {
    var title = "the word in " + site.match(/\/\/[^\/]*/)[0].substr(2);
    var menuId = chrome.contextMenus.create(
  {"title": title, "contexts":["selection"], "onclick": menuOnClick});
    var dicObj = new Object();
    dicObj.uri = site;
    menuTbl[menuId] = dicObj;
}

addDictionarySite("http://eow.alc.co.jp/#{word}/UTF-8/");
addDictionarySite("http://thefreedictionary.com/#{word}");
addDictionarySite("http://www.vocabulary.com/definition/#{word}");

/**
 *
*/
var cusDictionaries = JSON.parse(window.localStorage.getItem('dictionaries'));
if (cusDictionaries) {
    for (var i = 0; i < cusDictionaries.length; i++) {
        addDictionarySite(cusDictionaries[i]);
    }
}

chrome.tabs.onRemoved.addListener(onRemovedTab);
