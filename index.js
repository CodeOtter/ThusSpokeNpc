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

	/**************
	 * Definition *
	 **************/
	
	/**
	 * 
	 */
	function ThusSpokeNpc() {
		
	}
	
	/*****************
	 * Factorization *
	 *****************/
	
	/**
	 * 
	 */
	function factory(options) {
		return new ThusSpokeNpc(options);
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