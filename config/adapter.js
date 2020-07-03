'use strict';

// Enzyme Internal Error: Enzyme expects an adapter to be configured, but found none. To
// configure an adapter, you should call `Enzyme.configure({ adapter: new Adapter() })`
// before using any of Enzyme's top level APIs, where `Adapter` is the adapter
// corresponding to the library currently being tested. For example:

// import Adapter from 'enzyme-adapter-react-16';

// To find out more about this, see http://airbnb.io/enzyme/docs/installation/index.html

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
Enzyme.configure({ adapter: new  Adapter() });