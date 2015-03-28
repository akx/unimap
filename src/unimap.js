var html = require("!file?name=unimap.html!./unimap.html");
var style = require("!style!css!autoprefixer!less!./unimap.less");
var m = require("mithril");
var debounce = require("lodash/function/debounce");
var all = require("lodash/collection/all");
var any = require("lodash/collection/any");
var trim = require("lodash/string/trim");
var mainView = require("./mainView.msx");
var uni = require("./uni");


function getExtendedSearchMatches(ctrl, search) {
    var criteria = [];

    var script = ctrl.script();
    var block = ctrl.block();
    if (script) {
        criteria.push(function(c) {
            return uni.scripts.get(c) == script;
        });
    }

    if (block) {
        criteria.push(function(c) {
            return uni.blocks.get(c) == block;
        });
    }

    if (search && search.length) {
        if(search.length == 1) return [search.charCodeAt(0)];
        if (search.length >= 3) {
            search = search.toUpperCase();
            var searchRe = new RegExp("^.*" + search + ".*$", "i");
            criteria.push(function(c) {
                if(uni.getName(c).indexOf(search) > -1) return true;
                if(any(uni.getAliases(c), (alias) => !!searchRe.test(alias))) return true;
                return false;
            });
        }
    }
    var matches = [];
    if (criteria) {
        for (var c = 0; c < uni.highestCodepoint; c++) {
            if (all(criteria, (pred) => pred(c))) matches.push(c);
            if (matches.length >= 1000) break;
        }
    }
    return matches;
}

function controller() {
    var ctrl = this;
    ctrl.search = m.prop(null);
    ctrl.block = m.prop(null);
    ctrl.script = m.prop(null);
    ctrl.matches = m.prop([]);
    ctrl.searchTime = m.prop(0);
    var delayedSearchUpdate = null;
    ctrl.changeSearchState = function changeSearchState(stateKey) {
        return function(event) {
            ctrl[stateKey](event.target.value || null);
            delayedSearchUpdate();
        };
    };


    function updateSearch() {
        m.startComputation();
        var t0 = performance.now();
        var search = trim(ctrl.search() || ""), uniMatch;
        var matches = [];
        if ((uniMatch = (/^(u\+*|0?x)([0-9a-f]+)$/i).exec(search))) {
            matches = [parseInt(uniMatch[2], 16)];
        } else {
            matches = getExtendedSearchMatches(ctrl, search);
        }
        var t1 = performance.now();

        ctrl.matches(matches);
        ctrl.searchTime((t1 - t0).toFixed(1));
        saveSearchToHash();
        m.endComputation();
    }

    function saveSearchToHash() {
        var hash = {};
        ["script", "block", "search"].forEach(function(o) {
            var val = (ctrl[o])();
            if (val) hash[o] = val;
        });
        location.hash = "#" + (Object.keys(hash).length ? JSON.stringify(hash) : "");
    }

    function loadSearch() {
        var params = {};
        try {
            params = JSON.parse(location.hash.replace(/^#/, ''));
        } catch (e) {
        }
        ["script", "block", "search"].forEach(function(o) {
            if (params[o]) (ctrl[o])(params[o]);
        });
    }

    delayedSearchUpdate = debounce(updateSearch, 150);
    loadSearch();
    updateSearch();
}

function init() {
    m.module(document.body, {controller: controller, view: mainView});
}

window.addEventListener("load", init);
