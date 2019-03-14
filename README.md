# node-red-flow-linter
Flow linter for Node-RED

_**WORK IN PROGRESS.  Current code is just a mock-up which is aimed for  investigating pluggable architecture of linter.**_

This repository contains following 3 modules.

- nrlint
  - main module for Node-RED flow linter. 
- nrlint-plugin-func-style-eslint
  - flow linter plugin to check JavaScript coding style in function node.
- nrlint-plugin-no-func-name
  - flow linter plugin to check whether a  function node is properly named.

## Usage

### From Node-RED Editor
- clone this repository
```
 % git clone https://github.com/node-red-hitachi/node-red-flow-linter.git
```
- install nrlint and plugin
```
 % cd $HOME/.node-red
 % npm install /path/to/nrlint
 % npm install /path/to/nrlint-plugin-func-style-eslint
 % npm install /path/to/nrlint-plugin-no-func-name
```
- add lint configuration to $HOME/settings.js
```
...
    nrlint: {
        rules: {
            "no-func-name": "warn",
            "func-style-eslint": { semi: 2 }
        }
    }
...
```
- run Node-RED
```
 % npm start
```
...then, lint tab (marked with paw) will be appeared.

### From Command-line
- clone this repository
```
 % git clone https://github.com/node-red-hitachi/node-red-flow-linter.git
```
- install nrlint and plugin
```
 % npm install -g /path/to/nrlint
 % npm install -g /path/to/nrlint-plugin-func-style-eslint
 % npm install -g /path/to/nrlint-plugin-no-func-name
```
- add lint configuration to $HOME/.nrlintrc.js
```
module.exports = {
    "rules": {
        "no-func-name": "warn",
        "func-style-eslint": { semi: 2 }
    }
}
```
- set module path to environment variable NODE_PATH
```
 % export NODE_PATH=$(npm root -g)
```

- run nrlint command
```
 % nrlint /path/to/flow.json
```