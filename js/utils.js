/* polyfill for assign */
if (typeof Object.assign != 'function') {
  Object.assign = function (target, varArgs) { // .length of function is 2
    'use strict';
    if (target == null) { // TypeError if undefined or null
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);

    for (var index = 1; index < arguments.length; index++) {
      var nextSource = arguments[index];

      if (nextSource != null) { // Skip over if undefined or null
        for (var nextKey in nextSource) {
          // Avoid bugs when hasOwnProperty is shadowed
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

Object.prototype.expand = function(o) { Object.assign(this.prototype || this, o); };

/* copy to clipboard */
function copyText(node) {
	var end; window.getSelection().removeAllRanges();
	if(node.nodeName=="INPUT"||node.nodeName=="TEXTAREA") {node.focus();node.setSelectionRange(0,node.value.length);end=()=>node.blur();}
	else {var range = document.createRange();range.selectNode(node);window.getSelection().addRange(range);end=()=>window.getSelection().removeAllRanges();}
	document.execCommand("Copy");
	end();
};

/* templates */
String.expand({procTmpl:function(d){return this.replace(/%\(([A-Za-z0-9_]*)\)/g,(w,g)=>typeof(d[g]!='undefined'&&d[g]!=null)?d[g]:'');}});

/* DOM utils */
Element.expand({
	toggleDisplay: function(b) { b=b||true; this.style['display'] = (this.style['display'] == 'block' || !b) ? 'none' : 'block'; },
	onlyMe: function(s) {
		var p = this.parentElement; for(var i = 0; i < p.children.length; i++) {
			p.children[i].classList.remove(s);
		}
		this.classList.add(s);
	},
	empty: function() {while(this.firstChild)this.removeChild(this.firstChild);},
	initUI: function() {
		var ui = {}, eaCtrls = this.querySelectorAll('[data-uid], [data-widget], input'), toggles = this.querySelectorAll('[data-toggle]');
		for(var i = 0; i < eaCtrls.length; i++) {
			var t = eaCtrls[i].getAttribute('data-widget'),
				n = eaCtrls[i].getAttribute('data-uid') || eaCtrls[i].id,
				e = (t && ControlTypes[t]) ? ControlTypes[t](eaCtrls[i]) : eaCtrls[i];
			if(n) ui[n] = e;
        }
        

        // forEach because closure is needed
        toggles.forEach(function(e, i, a) {
            var c = e.getAttribute('data-toggle'), dt = e.getAttribute('href').replace('#',''), t = document.getElementById(dt) || ui[dt] || e;
            e.addEventListener('click', function() { t.classList.toggle(c); });
        });
		
		return ui;
	}
});

/* build a UI from a template */
function procUI(def,dx,ui) {
	ui=ui||{};var m={c:'class',s:'style',it:'type',iv:'value'};
	var ele = document.createElement(def.t||def.type||'div');
	Object.keys(def).forEach((x)=>(m[x]?ele.setAttribute(m[x],def[x].procTmpl(dx)):null));
	if(def.cn)def.cn.forEach((x)=>{var p=procUI(x,dx,ui);ele.appendChild(p.e);});
	if(def.d)Object.keys(def.d).forEach((x)=>ele.setAttribute('data-'+x,def.d[x].procTmpl(dx)));
	if(def.ec)ele.addEventListener('click',()=>def.ec(ui));
	if(def.ui)ui[def.ui]=ele;
	return {e:ele,ui:ui};
}

//# sourceMappingURL=utils.js.map