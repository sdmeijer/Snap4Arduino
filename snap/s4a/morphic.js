/*
    Changes to WorldMorph for managing Snap4Arduino functions
*/

/**
 * Global object (world.Arduino) used for s4a/arduino properties
 */
WorldMorph.prototype.Arduino = {
    firmata : require('firmata'),
    serialport : require('serialport'),
    portList : [],
    usedPorts : []
};

/**
 * Locks the given port to prevent its use in other connection (until it is unlocked)
 */
WorldMorph.prototype.Arduino.lockPort = function (port) {
    var usedPorts = this.usedPorts;

    if (usedPorts.indexOf(port) === -1) {
        usedPorts.push(port);
    }
}

/**
 * Unlocks a previously Locked port to permit its use in new connections
 * Should be called when closing connections
 */
WorldMorph.prototype.Arduino.unlockPort = function (port) {
    var usedPorts = this.usedPorts;

    if (usedPorts.indexOf(port) > -1) {
        usedPorts.splice(usedPorts.indexOf(port));
    }
}

/**
 * Informs whether the port is locked or unlocked
 */
WorldMorph.prototype.Arduino.isPortLocked = function (port) {
    return (this.usedPorts.indexOf(port) > -1)
}


/**
 * Gets a list of available serial ports (paths) and return it through callback function
 */
WorldMorph.prototype.Arduino.getSerialPorts = function (callback) {
    var myself = this;

    var portList = [];
    var portcheck = /usb|DevB|rfcomm|acm|^com/i; // Not sure about rfcomm! We must dig further how bluetooth works in Gnu/Linux

    myself.serialport.list(function (err, ports) { 
        if (ports) { 
            ports.forEach(function(each) { 
                if(!myself.isPortLocked(each.comName) && portcheck.test(each.comName)) {
                    portList[each.comName] = each.comName; 
                }
            });
        }
        callback(portList);
    });
    
};

WorldMorph.prototype.Arduino.processC = function (body) {
    var lines = body.split('\n'),
        header = '/* ============================================\n'
               + ' *        AUTO-Generated by Snap4Arduino\n'
               + ' * ============================================\n'
               + ' *\n'
               + ' * Please review this sketch before pushing it.\n'
               + ' *\n'
               + ' * This is an experimental feature, and there\n'
               + ' * are _several_ Snap!-related functionalities\n'
               + ' * that are, by definition, untranslatable to\n'
               + ' * static languages.\n'
               + ' *\n'
               + ' * There is NO WARRANTY whatsoever that this\n'
               + ' * sketch is going to work exactly in the same\n'
               + ' * way as the original Snap4Arduino script.\n'
               + ' */\n\n',
        setup = 'void setup() {\n',
        servoLines,
        servoPins,
        digitalOutputLines,
        digitalOutputPins,
        digitalInputLines,
        digitalInputPins;
    
    unique = function(anArray) {
        return anArray.filter(function(elem, pos) { 
            return anArray.indexOf(elem) == pos; 
        })
    }

    // let's find out what pins are we using, and for what purpose
	//SDM: changed regex so variables can be used for pin numbers
    servoLines = lines.filter(function(each) { return each.match(/servo[A-Za-z0-9]*\.write/)} );
    servoPins = unique(servoLines.map(function(each) { return each.replace(/.*servo([A-Za-z0-9]*)\.write.*/g, '$1') }));

    digitalOutputLines = lines.filter(function(each) { return each.match(/digitalWrite/)});
    digitalOutputPins = unique(digitalOutputLines.map(function(each) { return each.replace(/.*digitalWrite\(([A-Za-z0-9]*),.*\).*/g, '$1') }));

    digitalInputLines = lines.filter(function(each) { return each.match(/digitalRead/)});
    digitalInputPins = unique(digitalInputLines.map(function(each) { return each.replace(/.*digitalRead\(([A-Za-z0-9]*)\).*/g, '$1') }));
	
	//SDM
	//detect variables and declaration and assignment to header, so they can be used in setup()
	//only for variables outside of loops a type detection is build in (only int or char)
	//usefull for using variables holding the pin numbers of Arduino
	//TODO: type detection for vars in loops
	var headertemp = '';
	var headerVar = '';

	variableDeclareLines = lines.filter(function(each) { return each.match(/int/)});
	variableDeclareLines.forEach( function(varNames) { //declaration lines (int a,b,c,d;)
		body = body.replace(varNames + '\n', '') //remove declaration line in body, will be added later in head
		lines = body.split('\n')
		var variables = varNames.split(',');
		variables.forEach( function(varName) { //lines with assignment of variable
			varName = varName.replace('int ', '')
			varName = varName.replace(';', '')
			var reName = new RegExp(varName + ' = ', 'g');
			variableLines = lines.filter(function(each) { return each.match(reName)});
			var reValue = new RegExp('/.*' + varName + ' \= ([A-Za-z0-9]*)', 'g');
			variableSetValues = unique(variableLines.map(function(each) { return each.replace(reValue, '$1') }));
			variableSetValues.forEach( function(valueString) { if (valueString.substring(0, 1) != ' ') {
																body = body.replace(valueString + '\n', '') //remove assignment line in body, will be added later in head
																var value = valueString.substring(valueString.lastIndexOf(" ")+1,valueString.lastIndexOf(";"))
																if (isNaN(value)) { //detect type of assignment (only int or char)
																	//detect if assignment is an Analog pin number (i.e. A0, A1) then type is int
																	if ((value.length == 2) && ((value.substring(0,1) == 'A' || value.substring(0,1) == 'a') && !isNaN(value.substring(1,2)))) {
																		headertemp += 'int ' + valueString + '\n'
																	} else {
																		headertemp += 'char ' + valueString + '\n'
																	}
																} else {
																	headertemp += 'int ' + valueString + '\n'
																};
																varNames = varNames.replace(',' + varName + ';', ';')
																varNames = varNames.replace(varName + ',', '')
																if (varNames.substring(varNames.lastIndexOf(" ")+1,varNames.lastIndexOf(";")) == varName) {
																	varNames = varNames.replace(varName + ';', ';')
																}
															} });
		});
		
		//add variable lines to header (only for vars outside of loops)
		if (varNames != 'int ;') {
			headerVar += varNames + '\n' + headertemp + '\n'
		} else {
			headerVar += headertemp + '\n'
		};
	});
	//SDM
	
	//SDM
	var buzPin = '0';
	buzPinVariableDeclareLines = lines.filter(function(each) { return each.match(/buzPin_iQMaak/)});
	buzPinVariableDeclareLines.forEach( function(buzPinVar) {
																body = body.replace(buzPinVar + '\n', '') //remove assignment line in body, will be added later in head
																buzPin = buzPinVar.substring(buzPinVar.lastIndexOf(" ")+1,buzPinVar.lastIndexOf(";"))
															});
	
	//recode the melody so that two variables are made (int melody[]) and (int duration[])
	body = body.replace('tempmelody(\n', '')
	body = body.replace('tempmelody)', '')
	melodyNoteLines = lines.filter(function(each) { return each.match(/.*playnote/)});
	var notes = '';
	melodyNoteLines.forEach (function(line) {
												note = line.substring(line.lastIndexOf(" ")+1,line.lastIndexOf(";"))
												note = note.substring(note.lastIndexOf("_")+1,note.length)
												notes += note + ','
												body = body.replace(line + '\n', '')
											});
	notes = notes.substring(0, notes.length - 1)
	
	melodyDurationLines = lines.filter(function(each) { return each.match(/.*duration/)});
	var durations = '';
	melodyDurationLines.forEach (function(durLine) {
												duration = durLine.substring(durLine.lastIndexOf(" ")+1,durLine.lastIndexOf(";"))
												//durations += 1.0/duration + ','
												durations += duration + ','
												body = body.replace(durLine + '\n', '')
											});
	
	durations = durations.substring(0, durations.length - 1)
	
	var defMelody = 'int melody[] = {\n  ' + notes + '\n};\n\n'
	var defDurations = 'int noteDurations[] = {\n ' + durations + '\n};\n\n'
	
	//option for predefining songs
	//search other files for 'predefSongs' to find all places to add code
	var song = '';
	songLines = lines.filter(function(each) { return each.match(/.*song/)});
	songLines.forEach (function(songLine) {
											body = body.replace(songLine + '\n', '')
											song = songLine.substring(songLine.lastIndexOf(" ")+1,songLine.lastIndexOf(";"))
										});
	//predefSongs
	if (song === 'Happy') {
		defMelody = 'int melody[] = {\n'
		+'  262,262,311,349,\n'
		+'  349,349,311,349,\n'
		+'  349,349,349,349,\n'
		+'  311,349,349,349,\n'
		+'  311,349,262,0,\n'
		+'  262,262,311,349,\n'
		+'  349\n'
		+'};\n\n'

		defDurations = 'int noteDurations[] = {\n'
		+' 8,4,4,8,\n'
		+' 8,8,8,3,\n'
		+' 4,4,3,8,\n'
		+' 8,4,4,4,\n'
		+' 8,4,8,8,\n'
		+' 8,4,4,8,\n'
		+' 8\n'
		+'};\n\n'
	}
	//end predefining songs
	
	var voidMelody = 'void Melody() {\n'
					+ '  int size = sizeof(melody) / sizeof(int);\n'
					+ '  for (int thisNote = 0; thisNote < size; thisNote++) {\n'
					+ '    int noteDuration = 1000/noteDurations[thisNote];\n'
					+ '    tone(' + buzPin + ', melody[thisNote],noteDuration);\n'
					+ '    int pauseBetweenNotes = noteDuration * 1.30;\n'
					+ '    delay(pauseBetweenNotes);\n'
					+ '    noTone(' + buzPin + ');\n'
					+ '    pinMode(' + buzPin + ', INPUT);\n'
					+ '  }\n'
					+ '}\n\n'
	
	//SDM
	
	//SDM
	//crossFadeColor
	var crossFadeInit = '/*\n'
					+ '* Code for cross-fading 3 LEDs, red, green and blue (RGB)\n'
					+ '* https://www.arduino.cc/en/Tutorial/ColorCrossfader\n'
					+ '* April 2007, Clay Shirky <clay.shirky@nyu.edu>\n'
					+ '*/ \n'
					+ '\n'
					+ '// Color arrays\n'
					+ 'int black[3]  = { 0, 0, 0 };\n'
					+ 'int white[3]  = { 100, 100, 100 };\n'
					+ 'int red[3]    = { 100, 0, 0 };\n'
					+ 'int green[3]  = { 0, 100, 0 };\n'
					+ 'int blue[3]   = { 0, 0, 100 };\n'
					+ 'int yellow[3] = { 40, 95, 0 };\n'
					+ 'int softWhite[3] = { 30, 30, 30 };\n'
					+ '//etc.\n'
					+ '\n'
					+ 'int redVal = black[0];\n'
					+ 'int grnVal = black[1];\n'
					+ 'int bluVal = black[2];\n'
					+ '\n'
					+ 'int wait = 5;\n'
					+ 'int hold = 0;\n'
					+ '\n'
					+ 'int prevR = redVal;\n'
					+ 'int prevG = grnVal;\n'
					+ 'int prevB = bluVal;\n\n'
	
	var crossFadeCode = '\n\n/* BELOW THIS LINE IS THE MATH -- YOU SHOULDN\'T NEED TO CHANGE THIS FOR THE BASICS */\n'
						+ '\n'
						+ 'int calculateStep(int prevValue, int endValue) {\n'
						+ '  int step = endValue - prevValue;\n'
						+ '  if (step) {\n'
						+ '    step = 1020/step;\n'
						+ '  }\n'
						+ '  return step;\n'
						+ '}\n'
						+ '\n'
						+ 'int calculateVal(int step, int val, int i) {\n'
						+ '\n'
						+ '  if ((step) && i % step == 0) {\n'
						+ '    if (step > 0) {\n'
						+ '      val += 1;\n'     
						+ '    }\n'
						+ '    else if (step < 0) {\n'
						+ '      val -= 1;\n'
						+ '    }\n'
						+ '  }\n'
						+ '  if (val > 255) {\n'
						+ '    val = 255;\n'
						+ '  }\n'
						+ '  else if (val < 0) {\n'
						+ '    val = 0;\n'
						+ '  }\n'
						+ '  return val;\n'
						+ '}\n'
						+ '\n'
						+ 'void crossFade(int color[3], int redPin, int grnPin, int bluPin) {\n'
						+ 'int R = (color[0] * 255) / 100;\n'
						+ '  int G = (color[1] * 255) / 100;\n'
						+ '  int B = (color[2] * 255) / 100;\n'
						+ '\n'
						+ '  int stepR = calculateStep(prevR, R);\n'
						+ '  int stepG = calculateStep(prevG, G);\n' 
						+ '  int stepB = calculateStep(prevB, B);\n'
						+ '\n'
						+ '  for (int i = 0; i <= 1020; i++) {\n'
						+ '    redVal = calculateVal(stepR, redVal, i);\n'
						+ '    grnVal = calculateVal(stepG, grnVal, i);\n'
						+ '    bluVal = calculateVal(stepB, bluVal, i);\n'
						+ '\n'
						+ '    analogWrite(redPin, redVal);\n'
						+ '    analogWrite(grnPin, grnVal);\n'     
						+ '    analogWrite(bluPin, bluVal);\n' 
						+ '\n'
						+ '    delay(wait);\n'
						+ '  }\n'
						+ '  prevR = redVal;\n'
						+ '  prevG = grnVal;\n'
						+ '  prevB = bluVal;\n'
						+ '  delay(hold);\n'
						+ '}\n'
						
	if (body.indexOf("crossFade(") > -1) {
		header += crossFadeInit
		body += crossFadeCode
		
		RGBLines = lines.filter(function(each) { return each.match(/RGBPin/)});
		RGBLines.forEach ( function(RGBLine) { body = body.replace(RGBLine + '\n', '') });
		RGBPins = unique(RGBLines.map(function(each) { return each.substring(each.lastIndexOf(" ")+1,each.lastIndexOf(";")) }));
		RGBPins.forEach ( function(RGBPin) { setup += '  pinMode(' + RGBPin + ', OUTPUT);\n' });
	};
	//SDM
	
	//SDM
	//translate servo values into ints (not tested!)
	body = body.replace('.write(clockwise);', '.write(0);') //1200 (https://github.com/edutec/Snap4Arduino/issues/62)
	body = body.replace('.write(stopped);', '.write(90);') //1500
	body = body.replace('.write(counter-clockwise);', '.write(180);') //1700
	//SDM
	
    // now let's construct the header and the setup body
    if (servoLines.length > 0) { header += '#include <Servo.h>\n\n' };

    servoPins.forEach( function(pin) { 
        header += 'Servo servo' + pin + ';\n'
        setup += '  servo' + pin + '.attach(' + pin + ');\n'
    });

    header += '\n';

    digitalOutputPins.forEach( function(pin){ setup += '  pinMode(' + pin + ', OUTPUT);\n' });
    digitalInputPins.forEach( function(pin){ setup += '  pinMode(' + pin + ', INPUT);\n' });

	//SDM
	//Detect if the Melody-block is inside the loop() or not
	//if not, move it to setup()
	melodyLines = lines.filter(function(each) { return each.match(/Melody\(\)/)});
	melodyLines.forEach ( function(melodytest) { if (melodytest === 'Melody();') {
													body = body.replace(melodytest + '\n', '')
													setup += '  ' + melodytest + '\n'
												}
												});
	//Detect if the crossFade-blocks are inside the loop() or not
	//if not, move it to setup()
	crossFadeLines = lines.filter(function(each) { return each.match(/crossFade\(/)});
	crossFadeLines.forEach ( function(crossfadetest) { if (crossfadetest.substring(0,10) === 'crossFade(') {
													crossfadetestNew = crossfadetest.substring(0, crossfadetest.indexOf("(")+1) + crossfadetest.substring(crossfadetest.lastIndexOf("_")+1, crossfadetest.length)
													crossfadetestNew = crossfadetestNew.replace('"', '') 
													body = body.replace(crossfadetest + '\n', '')
													setup += '  ' + crossfadetestNew + '\n'
												} else {
													crossfadetestNew = crossfadetest.substring(0, crossfadetest.indexOf("(")+1) + crossfadetest.substring(crossfadetest.lastIndexOf("_")+1, crossfadetest.length)
													crossfadetestNew = crossfadetestNew.replace('"', '')
													body = body.replace(crossfadetest + '\n', crossfadetestNew + '\n')
												}
												});
	//SDM
	
    setup += '}\n\n';
	
	//SDM
	//if no forever loop is in the code, it will be added (is mandatory for an Arduino sketch)
	if (body.indexOf("void loop()") == -1) {
		body = body + 'void loop() {\n}\n'
	};
	//SDM
	
	//SDM: added headerVar
	if (notes.length > 0 || song.length > 0) {
		return (header + headerVar + defMelody + defDurations + voidMelody + setup + body);
	} else {
		return (header + headerVar + setup + body);
	};
}
