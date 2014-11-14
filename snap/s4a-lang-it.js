s4aTempDict = {

/*
    Special characters: (see <http://0xcc.net/jsescape/>)

    �, �   \u00c4, \u00e4
    �, �   \u00d6, \u00f6
    �, �   \u00dc, \u00fc
    �      \u00df
*/
    // primitive blocks:

    /*
        Attention Translators:
        ----------------------
        At this time your translation of block specs will only work
        correctly, if the order of formal parameters and their types
        are unchanged. Placeholders for inputs (formal parameters) are
        indicated by a preceding % prefix and followed by a type
        abbreviation.

        For example:

            'say %s for %n secs'

        can currently not be changed into

            'say %n secs long %s'

        and still work as intended.

        Similarly

            'point towards %dst'

        cannot be changed into

            'point towards %cst'

        without breaking its functionality.
    */

    // arduino:
	
	'digital input':
		'ingresso digitale',

	'digital output':
		'uscita digitale',

	'PWM':
		'PWM',

	'servo':
		'servo',

	'clockwise':
		'senso orario',

	'counter-clockwise':
		'senso anti-orario',

	'stopped':
		'fermo',

	'angle (0-180)':
		'angolo (0-180)',

    'connect to Arduino':
        'collegati ad Arduino',

    'disconnect Arduino':
        'scollega Arduino',

    'Connect Arduino':
        'Collega Arduino',

    'Disconnect Arduino':
        'Scollega Arduino',

    'analog reading %analogPin':
        'lettura analogica %analogPin',

    'digital reading %digitalPin':
        'lettura digitale %digitalPin',

    'connect arduino at %port':
        'collega arduino alla porta %port',

    'setup digital pin %digitalPin as %pinMode':
        'imposta il pin %digitalPin come %pinMode',

    'set digital pin %digitalPin to %b':
        'imposta il pin digitale %digitalPin a %b',

    'set servo %servoPin to %servoValue':
        'imposta servo %servoPin a %servoValue',

    'set PWM pin %pwmPin to %n':
        'imposta il pin PWM %pwmPin a %n',

    'Connecting board at port\n': 
        'Sto collegando la scheda alla porta\n',

    'An Arduino board has been connected. Happy prototyping!':
        'La scheda Arduino � correttamente collegata.\nBuona sperimentazione!',

    'Board was disconnected from port\n':
        'La scheda � stata scollegata dalla porta\n',

    'It seems that someone pulled the cable!':
        'Sembra che qualcuno ha staccato il cavo!',

    'Error connecting the board.':
        'Errore di connessione alla scheda',

    'There is already a board connected to this sprite':
        'C\'� gi� una scheda collegata a questo oggetto',

    'Could not connect an Arduino\nNo boards found':
        'Impossibile collegarsi ad Arduino\nNessuna scheda trovata',

    'Could not talk to Arduino in port\n':
        'Impossibile comunicare con Arduino alla porta\n',

    'Check if firmata is loaded.':
        'Verifica che Firmata sia caricato sulla scheda.',

    'An error was detected on the board\n\n':
        'Un errore � stato riscontrato sulla scheda\n\n',

    'Board is not connected':
        'La scheda non � collegata'

};

// Add attributes to original SnapTranslator.dict.it
for (var attrname in s4aTempDict) { SnapTranslator.dict.it[attrname] = s4aTempDict[attrname]; }