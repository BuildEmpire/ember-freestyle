'use strict';
const mergeTrees = require('broccoli-merge-trees');
const fs = require('fs');
const flatiron = require('broccoli-flatiron');
const FreestyleUsageSnippetFinder = require('./freestyle-usage-snippet-finder');

module.exports = {
  name: 'ember-freestyle',

  treeForApp(tree) {
    let treesToMerge = [tree];
    let snippets = mergeTrees(this.snippetPaths().filter((path) => fs.existsSync(path)));

    snippets = mergeTrees(this.snippetSearchPaths().map((path) => {
      return new FreestyleUsageSnippetFinder([path], this.ui);
    }).concat(snippets));

    snippets = flatiron(snippets, {
      outputFile: 'freestyle-snippets.js'
    });
    treesToMerge.push(snippets);

    return mergeTrees(treesToMerge);
  },

  snippetPaths() {
    if (this.app) {
      let freestyleOptions = this.app.options.freestyle || {};
      return freestyleOptions.snippetPaths || ['snippets'];
    }
    return ['snippets'];
  },

  snippetSearchPaths() {
    if (this.app) {
      let freestyleOptions = this.app.options.freestyle || {};
      return freestyleOptions.snippetSearchPaths || ['app'];
    }
    return ['app'];
  },

  included: function(app, parentAddon) {
    this._super.included.apply(this, arguments);
    // support for nested addon
    // see: https://github.com/ember-cli/ember-cli/issues/3718
    var target = parentAddon || app;
    if (!this.app && target.app) {
      this.app = target.app;
    }
  },

  isDevelopingAddon() {
    return false;
  }
};
