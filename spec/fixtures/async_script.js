'use strict';

require('./chunk1.js');
require('./index1.js');

require.ensure(['./chunk2.js'], () => {}, 'dynamic2');
require.ensure(['./chunk3.js'], () => {}, 'dynamic3');
