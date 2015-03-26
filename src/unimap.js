var html = require("!file?name=unimap.html!./unimap.html");
var style = require("!style!css!autoprefixer!less!./unimap.less");
var React = require("react/addons");
var Blocks = require("!unicode-blocks!./Blocks.txt");
var Scripts = require("!unicode-blocks!./Scripts.txt");
var getName = require("!unicode-names!./NamesList.txt");
var debounce = require("lodash/function/debounce");
var all = require("lodash/collection/all");
var trim = require("lodash/string/trim");

var appComponent = null;

var CharRow = React.createClass({
    mixins: [React.addons.PureRenderMixin],
    render: function() {
        var c = this.props.codepoint;
        return (<tr>
            <td>
                <span className="ch">{String.fromCharCode(c)}</span>
                <span className="ch popup">{String.fromCharCode(c)}</span>
            </td>
            <td>{"U+" + c.toString(16).toUpperCase()}</td>
            <td>{getName(c)}</td>
            <td>{Blocks.get(c)}</td>
            <td>{Scripts.get(c)}</td>
        </tr>);
    },
});

var AppComponent = React.createClass({
    getInitialState: function() {
        return {
            search: null,
            block: null,
            script: null,
            matches: [],
            searchTime: "?"
        };
    },
    getOptions: function(list) {
        var options = list.sort().map((name) => <option value={name} key={name}>{name}</option>);
        return [<option value="" key=""></option>].concat(options);
    },
    changeSearchState: function(stateKey) {
        var self = this;
        return function(event) {
            var v = {};
            v[stateKey] = event.target.value || null;
            self.setState(v);
            self.enqueueSearchUpdate();
        };
    },
    enqueueSearchUpdate: function() {
        if(!this.delayedSearchUpdate) {
            this.delayedSearchUpdate = debounce(this.updateSearch, 150);
        }
        this.delayedSearchUpdate();
    },
    getExtendedSearchMatches: function(search) {
        var criteria = [];
        if(this.state.script) {
            var script = this.state.script;
            criteria.push(function(c) { return Scripts.get(c) == script; });
        }
        if(this.state.block) {
            var block = this.state.block;
            criteria.push(function(c) { return Blocks.get(c) == block; });
        }

        if(search) {
            if(search.length >= 3) {
                search = search.toUpperCase();
                criteria.push(function(c) {
                    return getName(c).indexOf(search) > -1;
                });
            } else {
                return [search.charCodeAt(0)];
            }
        }
        var matches = [];
        if(criteria) {
            for(var c = 0; c < 0xF000; c++) {
                if(all(criteria, (pred) => pred(c))) matches.push(c);
                if(matches.length >= 1000) break;
            }
        }
        return matches;
    },
    updateSearch: function() {
        var t0 = performance.now();
        var search = trim(this.state.search || ""), m;
        var matches = [];
        if((m=(/^(u\+*|0?x)([0-9a-f]+)$/i).exec(search))) {
            console.log(m);
            matches = [parseInt(m[2], 16)];
        } else {
            matches = this.getExtendedSearchMatches(search);
        }
        var t1 = performance.now();

        this.setState({
            matches: matches,
            searchTime: (t1 - t0).toFixed(1)
        });
        this.saveSearchToHash();
    },
    saveSearchToHash: function() {
        var hash = {}, state = this.state;
        ["script", "block", "search"].forEach(function(o){if(state[o]) hash[o] = state[o]; });
        location.hash = "#" +  (Object.keys(hash).length ? JSON.stringify(hash) : "");
    },
    loadSearch: function() {
        var params = {};
        try {
            params = JSON.parse(location.hash.replace(/^#/, ''));
        } catch(e) {}
        var state = {};
        ["script", "block", "search"].forEach(function(o){if(params[o]) state[o] = params[o]; });
        this.setState(state);
    },
    componentDidMount: function() {
        this.loadSearch();
        this.enqueueSearchUpdate();
    },
    getCharResults: function() {
        var rows = this.state.matches.map((m) => <CharRow codepoint={m} key={m} />);
        return (<table>
            <thead>
                <tr>
                    <th>Character</th>
                    <th>Codepoint</th>
                    <th>Name</th>
                    <th>Block</th>
                    <th>Script</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>);
    },
    render: function() {
        return <div id="app">
            <div id="search">
            <form>
                <div>
                    <input placeholder="Name or Codepoint" value={this.state.search}
                        onInput={this.changeSearchState('search')}
                        onChange={this.changeSearchState('search')}
                    />
                </div>
                <div>
                    <label>Unicode Block</label>
                    <select value={this.state.block} onChange={this.changeSearchState('block')}>{this.getOptions(Blocks.list)}</select>
                </div>
                <div>
                    <label>Script</label>
                    <select value={this.state.script} onChange={this.changeSearchState('script')}>{this.getOptions(Scripts.list)}</select>
                </div>
                <div>
                    Search time: {this.state.searchTime} ms for {this.state.matches.length} results
                </div>
            </form>
            </div>
            <div id="results">
                {this.getCharResults()}
            </div>
        </div>;
    }
});

function init() {
    appComponent = React.render(<AppComponent />, document.body);
}

window.addEventListener("load", init);
