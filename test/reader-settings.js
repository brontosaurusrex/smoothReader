"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs.readFileSync(path.join(__dirname,"..","renderer-v36.js"),"utf8");
const properties = new Map(), saved = [];
const c = vm.createContext({
  DEFAULT_MAX_BRIGHTNESS:100, MIN_MAX_BRIGHTNESS:20, MAX_MAX_BRIGHTNESS:100,
  MAX_BRIGHTNESS_KEY:"brightness", maxBrightness:100,
  document:{documentElement:{style:{setProperty:(k,v)=>properties.set(k,v)}}},
  saveCurrentReadingSettings:(key,value)=>saved.push([key,value]),
  syncSettingsControls(){}, showStatus(){}
});
vm.runInContext(source.slice(source.indexOf("const applyMaxBrightness ="),source.indexOf("const applyFont =")),c);
for(const [value,expected] of [[50,50],[0,20],[200,100],["75",75],[NaN,100]]){
  c.testValue=value;vm.runInContext("applyMaxBrightness(testValue)",c);
  assert.equal(c.maxBrightness,expected);
  assert.ok(Math.abs(Number(properties.get("--brightness-ceiling"))-expected*2.55)<.001);
  assert.equal(saved.at(-1)[1],expected);
}
const bindings=new Map(), called=[];
const resetContext=vm.createContext({});
const defaults={settingsContrast:["applyContrast","DEFAULT_CONTRAST"],settingsMaxBrightness:["applyMaxBrightness","DEFAULT_MAX_BRIGHTNESS"],settingsFontSize:["applyFontSize","DEFAULT_FONT_SIZE_PX"],settingsLineHeight:["applyLineHeight","DEFAULT_LINE_HEIGHT"],settingsWidth:["applyWidth","DEFAULT_WIDTH_CH"],settingsSpeechMax:["applySpeechBounds","DEFAULT_SPEECH_MAX_LENGTH"],settingsSpeechPosition:["applySpeechCenterOffset","DEFAULT_SPEECH_CENTER_OFFSET_PERCENT"],settingsSpeechSpeed:["applySpeechSpeed","DEFAULT_SPEECH_SPEED_PERCENT"]};
for(const [name,[setter,constant]] of Object.entries(defaults)){
  resetContext[name]={addEventListener:(event,handler)=>bindings.set(name,handler)};
  resetContext[setter]=(...args)=>called.push([setter,...args]);
  resetContext[constant]=Object.keys(defaults).indexOf(name)+10;
}
resetContext.DEFAULT_SPEECH_MIN_LENGTH=1;
vm.runInContext(source.slice(source.indexOf("const sliderResets ="),source.indexOf('settingsToggle.addEventListener("click"')),resetContext);
for(const [name,[setter,constant]] of Object.entries(defaults)){
  let prevented=false,stopped=false;
  bindings.get(name)({preventDefault(){prevented=true;},stopPropagation(){stopped=true;}});
  const call=called.at(-1);
  assert.equal(call[0],setter);
  assert.equal(call[setter==="applySpeechBounds"?2:1],resetContext[constant]);
  assert.equal(prevented,true);assert.equal(stopped,true);
  assert.match(resetContext[name].title,/Right-click/);
}
assert.equal(called.length,8,"Each reset invokes only its own setter");
console.log("Brightness limits and individual slider resets passed");
