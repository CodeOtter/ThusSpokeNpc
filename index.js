"use strict";

/**
 * ThusSpokeNpc
 * A dialog/interaction system for non-player characters in games.  Please read README.md for a detailed explanation of how this system works.
 * @author Patrick Ryan <patrick.ryan@codeotter.com>
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
	 * @param	Function	A JavaScript callback that handles when an NPC speaks.  (Requires an id:Int and a message:String parameter)
	 * @param	Number		Delay (in microseconds) between messages.  0 means you can always ask it a question.  (0 is default)
	 * @param	Number		How close you have to be to ask the NPC a question.  0 means you can always ask it a question no matter the distance. (0 is default)
	 * @param	Number		Percent chance an NPC will randomly speaking banter.  (0 is default) 
	 * @param	Number		How often (in microseconds) banter might happen. (0 is default)
	 * @param	Array		An array of object literal NPC Messages
	 * 
	 */
	function ThusSpokeNpc(id /* Int */, speak /* Function */, tolerance /* Int */, range /* Float */, banter /* Int */, banterDelay /* Int */, messages /* Array */) {
		var self = this;

		var normalizedMessages = [];
		for(var i in messages) {
			normalizedMessages.push(new NpcMessage(messages[i]));
		}

		npcs[id] = {
			messages: normalizedMessages,
			tolerance: tolerance || 0,
			range: range || 0.0,
			banter: banter || 0,
			banterDelay: banterDelay || 0,
			speak: speak,
			timers: {
				banterCheck: null,
				lastInteraction: null
			},
		};

		if(banterDelay) {
			npcs[id].timers.banterCheck = setInterval(getBanterCheck(id), banterDelay);
		}
		
		return npcs[id];
	}

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/////////////////////////////////////////////////////// API Begins here ///////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	/**
	 * Add a message to an NPC if it exists
	 * @api
	 * @param	Number		The ID of the entity you'd like to add a message to
	 * @param	Object		A flattened object/key-value pair of conditions.
	 * @param	String		The message
	 * @param	Object		A flattened object/key-value pair of reward indictators.
	 * @returns	Null
	 */
	ThusSpokeNpc.add = function(id /* Int */, conditions /* Object */, message /* String */, rewards /* Object */) {
		if(npcs[id] !== undefined) {
			npcs[id].messages.push(new NpcMessage(conditions, message, rewards));
		}
	};

	/**
	 * Ask the NPC a question
	 * @api
	 * @param	Number		The ID of the entity you'd like to ask a question to
	 * @param	Object		A flattened object/key-value pair of condition criteria.
	 * @returns	Null
	 */
	ThusSpokeNpc.ask = function(id /* Int */, conditions /* Object */) {
		var npc = npcs[id];
		if(npc !== undefined) {
			var message = isValidAsking(conditions, npc);
			if(message) {
				if(npc.timers.lastInteraction === null) {
					clearInterval(npc.timers.banterCheck);
					console.log('cleared');
					npc.timers.lastInteraction = setTimeout(function() { 
						// Prevent the user from badgering this NPC over and over again
						clearInterval(npc.timers.lastInteraction);
						npc.timers.lastInteraction = null;
						npc.timers.banterCheck = setInterval(getBanterCheck(id), npc.banterDelay);
						console.log('restored');
					}, npc.tolerance);
				}
				npc.speak(id, message.message, message.rewards);
			}
		}
	};

	/**
	 * Makes an NPC speak
	 * @api
	 * @param	Number		The ID of the entity you'd like to ask a question to
	 * @param	String		What the NPC says
	 * @param	Object		A flattened object/key-value pair of reward indictators.
	 * @returns	Null
	 */
	ThusSpokeNpc.say = function(id /* Int */, message /* String */, rewards /* Object */) {
		var npc = npcs[id];
		if(npc !== undefined) {
			npc.speak(id, message, rewards || {});
		}
	};

	/**
	 * Destroy the NPC
	 * @api
	 * @param	Number		The ID of the entity
	 * @returns	Null
	 */
	ThusSpokeNpc.destroy = function(id /* Int */) {
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
	
	/**
	 * Returns a Banter interval
	 * @param	Number		The ID of the entity
	 * @returns	Function	The Interval callback
	 */
	function getBanterCheck(id) {
		var npc = npcs[id];
		return function() {
			if(getRandomRange(0, 100) < npc.banter) {
				// banter check passed, chat away!
				var messages = findMessages({ banter: true }, npc);
				if(messages) {
					var message = messages[getRandomRange(0, messages.length - 1)];
					npc.speak(id, message.message, message.rewards);
				}
			}
		};
	}
	
	/**
	 * A container for an NPC Message
	 * @param	Object		A flattened object/key-value pair of conditions.
	 * @param	String		A message
	 * @param	Object		A flattened object/key-value pair of reward indictators.
	 */
	function NpcMessage(conditions, message, rewards) {
		if(conditions instanceof Object) {
			this.conditions = conditions.conditions || false;
			this.message = conditions.message || false;
			this.rewards = conditions.reward || {};
		} else {
			this.conditions = conditions || false;
			this.message = message || false;
			this.rewards = rewards || {};
		}
		
		if(!this.conditions)
			throw new Error('NPC Message requires conditions');
		
		if(!this.message)
			throw new Error('NPC Message requires message');
	}

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
		var greeting = false;

		if((npc.range !== 0 && conditions.range > npc.range) || npc.lastInteraction) {
			return false;
		}

		for(var i in npc.messages) {
			var message = npc.messages[i];
			var match = true;
			for(var j in message.conditions) {
				// Go through the conditions required for each message
				if(!greeting) {
					if(j == 'greeting') {
						greeting = message;
					}
				}
				if(message.conditions.hasOwnProperty(j)) {
					if(!conditions.hasOwnProperty(j) || conditions[j] !== message.conditions[j]) {
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
		return greeting;
	}

	/*************
	 * Packaging *
	 *************/

	if( typeof exports !== 'undefined' ) {
		// We are dealing with NodeJS
		if( typeof module !== 'undefined' && module.exports ) {
			// We are exporting the entire package
			exports = module.exports = ThusSpokeNpc;
		}
		// We are exporting to a specific property
		exports.ThusSpokeNpc = ThusSpokeNpc;
	} else {
		// We are exporting to the global context
		root.ThusSpokeNpc = ThusSpokeNpc;
		root.npcCreate = ThusSpokeNpc.create;
		root.npcAsk = ThusSpokeNpc.ask;
		root.npcAdd = ThusSpokeNpc.add;
		root.npcSay = ThusSpokeNpc.say;
		root.npcDestroy = ThusSpokeNpc.destroy;
	}
}).call(this);