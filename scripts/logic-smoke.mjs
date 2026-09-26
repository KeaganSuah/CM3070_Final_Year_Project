import assert from 'node:assert/strict';
import { haversineDistanceKm, isWithinRadiusKm } from '../src/utils/distanceUtils.js';
import { normalizeContentBlocks, sanitizeGuides, getGuidePromotionThreshold } from '../src/utils/guideStorage.js';

let passed=0; const check=(name,fn)=>{fn();passed+=1;console.log('PASS',name)};
check('distance same point',()=>assert.equal(haversineDistanceKm({latitude:1,longitude:103},{latitude:1,longitude:103}),0));
check('distance within one km',()=>assert.equal(isWithinRadiusKm({latitude:1.3521,longitude:103.8198},{latitude:1.36,longitude:103.82},1),true));
check('distance outside 200m',()=>assert.equal(isWithinRadiusKm({latitude:1.3521,longitude:103.8198},{latitude:1.36,longitude:103.82},0.2),false));
check('promotion threshold',()=>assert.equal(getGuidePromotionThreshold(),150));
check('149 remains community',()=>assert.equal(sanitizeGuides([{id:'x',votes:149,body:'x'}])[0].category,'community'));
check('150 becomes team',()=>assert.equal(sanitizeGuides([{id:'x',votes:150,body:'x'}])[0].category,'team'));
check('built in remains team',()=>assert.equal(sanitizeGuides([{id:'tg-1',votes:0,body:'x'}])[0].category,'team'));
check('legacy guide migrates text block',()=>assert.deepEqual(normalizeContentBlocks({body:'Legacy'})[0].type,'text'));
check('mixed blocks retained',()=>assert.equal(normalizeContentBlocks({contentBlocks:[{id:'a',type:'text',text:'T'},{id:'b',type:'image',imageUri:'x'}]}).length,2));
console.log(`TOTAL ${passed} assertions passed`);
