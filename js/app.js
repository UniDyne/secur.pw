
/* Add a secure random to Math */
Math.secRandom = (count) => {
	
	/* browser support check for crypto API */
	var crypto=window.crypto||window.msCrypto;
	if(!crypto) throw new Error("Secure random not available in this browser!");

	/* Fill a buffer with random bytes */
	var buff = new Uint8Array(count);
	crypto.getRandomValues(buff);

	return buff;
};


/* set up UI and events */
document.addEventListener('DOMContentLoaded', () => {
	window.ui = document.body.initUI();
	window.ui.syms.value = S_symbols;
	window.ui.btngen.addEventListener('click', () => { try { generate(); } catch(e) { alert(e.message); } });
	window.ui.btncopy.addEventListener('click', () => copyText(window.ui.pwlist) );
	window.ui.btnclear.addEventListener('click', () => clearPasswords() );
	window.ui.mast.addEventListener('click',()=>window.ui.about.classList.toggle('show'));
});

/* This is where the magic happens */
function generate() {
	// update symbols w/ user defined
	S_symbols = window.ui.syms.value;

	// build char list based on user prefs
	var pchars = [];
	if(window.ui.incnum.checked) pchars.push(S_numbers);
	if(window.ui.inclow.checked) pchars.push(S_lowercase);
	if(window.ui.incup.checked) pchars.push(S_uppercase);
	if(window.ui.incsym.checked) pchars.push(S_symbols);
	pchars = pchars.join("");

	// remove ambiguous chars if user specified
	if(window.ui.nosim.checked) pchars = pchars.replace(/[1lIoO0]/g,"");

	// build a list of chars that cannot appear at start
	var nofirst = (window.ui.nosym.checked ? S_symbols : "") + (window.ui.nonum.checked ? S_numbers : "");
	
	// save the no dupes or sequences params
	var nodup = window.ui.nodup.checked, noseq = window.ui.noseq.checked;

	// save length and quantity params, count allowed chars
	var plen = parseInt(window.ui.passlen.value), pqty = parseInt(window.ui.qty.value), count = pchars.length;

	// make sure we don't have bad selections
	// This prevents an infinite loop when user does something silly
	// like specifying numbers and symbols only, but not allowing them
	// to start the password.
	// We also prevent a loop when user requested no duplicate chars
	// but specified a password length longer than the number of
	// chars allowed.
	if(!((window.ui.incnum.checked&&!window.ui.nonum.checked) || (window.ui.incsym.checked&&!window.ui.nosym.checked) || window.ui.inclow.checked || window.ui.incup.checked)) throw new Error("Mutually exclusive options selected.");
	if(window.ui.nodup.checked && plen >= count) throw new Error("Not enough characters to avoid duplicates.");


	// generate random data buffer
	// We pad this by 100% since some of the checks below will need to
	// skip a byte when a sequence or duplicate is encountered.
	var buff = Math.secRandom(Math.ceil(plen * pqty * 2));

	var passwords = [], bpos = 0, last = -1, cur = -1;

	/* loop over quantity */
	for(var i = 0; i < pqty; i++) {
		var curpass = [];

		/* loop over length */
		for(var j = 0; j < plen; j++) {
			/* grab next byte in array and mod by number of allowed chars */
			cur = buff[++bpos] % count;
			
			/* check for dupes */
			if(nodup && curpass.indexOf(cur) >= 0) { j--; continue; }

			/* check for sequential / repeats */
			if(noseq && Math.abs(cur - curpass[curpass.length-1])<2) { j--; continue; }
			
			/* add this number to the array */
			curpass.push(cur);
		}
		
		/* convert numbers to chars */
		curpass = curpass.map(x => pchars.substr(x,1));

		// first char exclusions
		// we rotate the array until we get a good char
		while(nofirst.indexOf(curpass[0])>=0) curpass.push(curpass.shift());

		/* turn char array into string and store */
		passwords.push(curpass.join(""));
	}

	/* results to the UI */
	displayPasswords(passwords);
}

function clearPasswords(){window.ui.pwlist.empty();}

function displayPasswords(passwords) {
	clearPasswords();
	
	/* add UI for each password */
	passwords.forEach( (x) => window.ui.pwlist.appendChild( procUI(pwtmpl,{x:x}).e ) );
}




/*==============
	DATA
==============*/

/* Character lists */
var S_symbols = "`~!@#$%^&*()-_=+{}[]\|:;,<.>/?", S_lowercase = "abcdefghijklmnopqrstuvwxyz", S_uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ", S_numbers = "1234567890";

// This is a JSON template of the password output UI
var pwtmpl = {
	t:"li",
	c:"list-group-item d-flex justify-content-between",
	ui:"li",
	cn:[{
		t:"div",
		c:"input-group",
		cn:[{
				t:"input",
				c:"form-control mono",
				ui:"input",
				it:"text",
				iv:'%(x)'
		},{
			t:"div",
			c:"input-group-append",
			cn:[{
				t:"button",
				c:"btn",
				it:"button",
				d:{
					balloon:"Copy",
					"balloon-pos":"up"
				},
				cn:[{
					t:"i",
					c:"far fa-copy"
				}],
				ec: (ui) => copyText(ui["input"])
			},{
				t:"button",
				c:"btn",
				it:"button",
				d:{
					balloon:"Delete",
					"balloon-pos":"up"
				},
				cn:[{
					t:"i",
					c:"far fa-trash-alt"
				}],
				ec: (ui) => window.ui.pwlist.removeChild(ui["li"])
			}]
		}]
	}]
};

//# sourceMappingURL=app.js.map