"use strict";

/**
 * ThusSpokeNpc
 * A dialog/interaction system for non-player characters in games.
 * @author Patrick Ryan <patrick.ryan@codeotter.com>
 * @example
 * 
 */
(function() {

	var root = this;

	// List of speaking NPCs
	var npcs = {};

	/*********************
	 * Public Definition *
	 *********************/
	
	/**
	 * Creates an NPC
	 * @param	Number		The ID of the entity you'd like to create
	 * @param	Number		Delay (in microseconds) between messages.  0 means you can always ask it a question.  (0 is default)
	 * @param	Number		How close you have to be to ask the NPC a question.  0 means you can always ask it a question no matter the distance (0 is default)
	 * @param	Number		Percent chance an NPC will randomly speaking banter.  0 is default. 
	 * @param	Number		How often (in microseconds) banter might happen.
	 * @param	Array		An array of NPC messages Ex. [ { conditions: { objectId: 1 }, message: 'You found my ring!' }, { conditions: { race: 'orc' }, message: 'I hate orcs...' } ]
	 * @param	Function	A JavaScript callback that handles when an NPC speaks.  (Requires an id:Int and a message:String parameter)
	 */
	function ThusSpokeNpc(id /* Int */, tolerance /* Int */, range /* Float */, chatty /* Int */, chattyDelay /* Int */, speak /* Function */, messages /* Array */) {
		var self = this;

		npcs[id] = {
			messages: messages || [],
			tolerance: tolerance || 0,
			range: range || 0.0,
			chatty: chatty || 0,
			speak: speak,
			timers: {
				banterCheck: null,
				lastInteraction: null
			},
		};

		if(chattyDelay) {
			npcs[id].timers.banterCheck = setInterval(function() {
				if(getRandomRange(0, 100) < chatty) {
					// Chatty check passed, chat away!
					var message = findMessages({ banter: 1}, npcs[id]);
					if(messages) {
						speak(id, messages[getRandomRange(0, messages.length - 1)].message);
					}
				}
			}, chattyDelay);
		}
	}
	
	/**
	 * Add a message to an NPC if it exists
	 * @api
	 * @param	Number		The ID of the entity you'd like to add a message to
	 * @param	Object		A flattened object/key-value pair of conditions.
	 * @param	String		The message
	 * @returns	Null
	 */
	ThusSpokeNpc.prototype.add = function(id /* Int */, conditions /* Object */, message /* String */) {
		if(npcs[id] !== undefined) {
			npcs[id].messages.push({
				conditions: conditions,
				message: message || "Placeholder message!"
			});
		}
	};
	
	/**
	 * Ask the NPC a question
	 * @api
	 * @param	Number		The ID of the entity you'd like to ask a question to
	 * @param	Object		A flattened object/key-value pair of conditions.
	 * @returns	Null
	 */
	ThusSpokeNpc.prototype.ask = function(id /* Int */, conditions /* Object */) {
		var npc = npcs[id];
		if(npc !== undefined) {
			var message = isValidAsking(conditions, npc);
			if(message) {
				if(npc.tolerance > 0) {
					npc.lastInteraction = setTimeout(function() { 
						// Prevent the user from badgering this NPC over and over again
						clearInterval(npc.lastInteraction);
						npc.lastInteraction = null;
					}, npc.tolerance);
				}
				npc.speak(id, message.message);
			}
		}
	};
	
	/**
	 * Destroy the NPC
	 * @api
	 * @param	Number		The ID of the entity
	 * @returns	Null
	 */
	ThusSpokeNpc.prototype.destroy = function(id /* Int */) {
		var npc = npcs[id];
		if(npc !== undefined) {
			clearInterval(npc.timers.banterCheck);
			clearInterval(npc.timers.lastInteraction);
		}
		delete npcs[id];
	};
	
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////// API COMMANDS ONLY EXIST ABOVE THIS LINE ///////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////// WARNING: All code below this line are internal structures knee-deep in esoteric JavaScriptisms!!! //////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////// API COMMANDS ONLY EXIST ABOVE THIS LINE ///////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	/*******************
	 * Private Helpers *
	 *******************/

	/**
	 * Returns a random number between a specified range
	 * @param	Number	Minimum range
	 * @param	Number	Maximum range
	 * @returns	Number
	 */
	function getRandomRange(bottom, top) {
		return Math.floor( Math.random() * ( 1 + top - bottom ) ) + bottom;
	};
	
	/**
	 * Finds a list of messages that matches a flattened object/key-value pair of conditions
	 * @param	Object			A flattened object/key-value pair of conditions.
	 * @param	ThusSpokeNpc	An NPC
	 * @returns	Array 
	 */
	function findMessages(conditions /* Object */, npc /* ThusSpokeNpc */) {
		var results = [];
		for(var i in npc.messages) {
			// Go through all messages an NPC has
			var message = npc.messages[i];
			for(var j in message.conditions) {
				// Go through the conditions required for each message
				if(message.conditions.hasOwnProperty(j) && conditions.hasOwnProperty(j)) {
					results.push(message);
					break;
				}
			}
		}
		return results;
	};

	/**
	 * Finds a message based on a flattened object/key-value pair of conditions
	 * @param	Object			A flattened object/key-value pair of conditions.
	 * @param	ThusSpokeNpc	An NPC
	 * @returns	Object			Or false if no match was found
	 */
	function isValidAsking(conditions /* Object */, npc /* ThusSpokeNpc */) {
		if((npc.range !== 0 && conditions.range > npc.range) || npc.lastInteraction) {
			return false;
		}

		for(var i in npc.messages) {
			var message = npc.messages[i];
			var match = true;
			for(var j in message.conditions) {
				// Go through the conditions required for each message
				if(message.conditions.hasOwnProperty(j)) {
					if(!conditions.hasOwnProperty(j) || conditions[i] !== message.conditions[i]) {
						// The conditions are not fulfilled, move on to the next message
						match = false;
						break;
					}
				}
			}
			if(match) {
				// Message was matched to the conditions, return it
				return message;
			} 
		}
		return false;
	}
	
	/*****************
	 * Factorization *
	 *****************/
	
	/**
	 * Initializes an NPC
	 * @param	Number		The ID of the entity you'd like to create
	 * @param	Number		Delay (in microseconds) between messages.  0 means you can always ask it a question.  (0 is default)
	 * @param	Number		How close you have to be to ask the NPC a question.  0 means you can always ask it a question no matter the distance (0 is default)
	 * @param	Number		Percent chance an NPC will randomly speaking banter.  0 is default. 
	 * @param	Number		How often (in microseconds) banter might happen.
	 * @param	Array		An array of NPC messages Ex. [ { conditions: { objectId: 1 }, message: 'You found my ring!' }, { conditions: { race: 'orc' }, message: 'I hate orcs...' } ]
	 * @param	Function	A JavaScript callback that handles when an NPC speaks.  (Requires an id:Int and a message:String parameter)
	 */
	function factory(id /* Int */, tolerance /* Int */, range /* Float */, chatty /* Int */, chattyDelay /* Int */, speak /* Function */, messages /* Array */) {
		return new ThusSpokeNpc(id, tolerance, range, chatty, chattyDelay, speak, messages);
	}
	
	/*************
	 * Packaging *
	 *************/

	if( typeof exports !== 'undefined' ) {
		// We are dealing with NodeJS
		if( typeof module !== 'undefined' && module.exports ) {
			// We are exporting the entire package
			exports = module.exports = factory;
		}
		// We are exporting to a specific property
		exports.ThusSpokeNpc = factory;
	} else {
		// We are exporting to the global context
		root.ThusSpokeNpc = factory;
	}
}).call(this);