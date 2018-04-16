# secur.pw

The goal of this project is to provide a browser-based resource for password and secure key generation by leveraging the WebCrypto API and combining that with an intuitive user experience. Most of all, this is a project that gives me a chance to experiment.

## Password Generator
This was the first app for this project. What started out as a simple random password generator grew into something with plenty of options.

### Parameters
#### Length and Quantity
These two fields affect password length and the number of passwords to be generated, respectively. Password lengths between 6 and 64 are supported. Passwords longer than that aren't widely supported and offer little additional advantage since the odds of a potential hash collision are much higher. The maximum number of passwords that can be generated at once is 64, but that is mainly a consideration of resources and the time it takes to produce that many. The 64 password limit with all other options turned on results in a list that still appears nearly instant on most platforms.

#### Include
This section contains toggles for which characters to include in the passwords. There is also a text field where one can specify which symbols to include. This way, characters that are not allowed in a given password system can be removed from the generation.

#### Exclude From Start
Some systems do not allow certain characters at the start of the password. This section allows one to exclude numbers and/or symbols from being used as the first character. Internally, this means that a password starting with one of these characters is rotated until an acceptable character is first. This way, the exclusion occurs without decreasing the amount of entropy in the password. The statistical distribution of characters remains the same.

#### Exceptions
The *Ambiguity* option removes characters that look similar from the set of characters allowed in the generator. These include:  {{ `o O 0 1 l I` }} While this option reduces the amount of password entropy, the tradeoff may be worth it since it improves readability. These characters are removed from the *Include*d characters before the generator executes.

*Duplicates* prevents any single character from appearing more than once in a password. Internally, this is treated as a re-roll to get a different character. This option is not selected by default because it reduces password security.

*Sequences* prevents any neighbouring characters from being repeats or sequential. As with *Duplicates*, this is treated as a re-roll. Once again, this option is not selected by default because it reduces password security.

### Output
The *Output* section is fairly self-explanitory. Once a password or list of passwords is generated, password text will appear here with buttons for copying it to the clipboard or removing it from the list. There are also buttons at the top to allow one to copy or clear the entire list at once. Passwords are displayed in a monospace font for clarity and are in editable text fields for flexibility..

### How It Works

First, we check that the currently selected options are not mutually exclusive. For instance, a user may choose to include only numbers and symbols, but also specify neither can appear as the first character. Once we've confirmed the optons are acceptable, we're ready to generate.

We start by multiplying the password length by the number of passwords to be generated. This gives us the total number of required characters. We double that and use WebCrypto to generate a random buffer of that many numbers between 0 and 255. The reason we double it is to provide for the fact that we will need to re-roll some characters based on what options the user has selected.

We concatenate all the characters specified in *Include* to produce a single string, which we will use as an array. For each position in the random buffer, we can take the value there and divide that by the number of possible password characters, using modular division. The result (remainder) will be used to determine which character we pull out of the string to use as the next character in the password. 

If the user has chosen to exclude sequences or duplicates, we check the character to see if it meets those conditions. If it does, we discard the character and repeat the process.

Once we have the correct number of characters for a password, we then check the first character against the selected configuration. If the first character is unacceptable, we rotate the password (move the first character to the end) until it meets the requirements.

After that, the password is added to the results.

### Framework
I've used part of a custom framework for this project that is very minimalist. The framework is a separate project that may or may not be fleshed out in the future. I have also used Bootstrap, FontAwesome, and Balloon for the UI styling.

### Performance
When running with all options maxed, the generator requires an 8K buffer of random data, an additional 4K and some change as the results array is built, plus the DOM overhead to push the results which is much more data than those two. Using a profiler in Chrome, the generator slowly climbs to a JS heap of about 20M before garbage collection, after which it sheds a couple megs before the DOM manipulation. The DOM portion jumps as high as 14M and as low as just under 7M. There are no persistent resources used other than the event handlers, so the entire heap ends up getting garbage collected later. There is likely room for improvement.

### To-Do
* Entropy / strength indicator for selected config
* Ignore whitespace and normal chars in user-provided symbols list


## Key Generator
This feature is in the works. This will provide cryptographic key generators and exporters for SSH, DKIM, and DNSSEC.

## Second Factor Demo
This feature is in the works. This will provide a means for generating a two-factor authenticator with QR code and a working time-based token. This is only for demonstration purposes since it has no practical use in this context.