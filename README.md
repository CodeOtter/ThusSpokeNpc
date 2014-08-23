ThusSpokeNpc
=============

A dialog/interaction system for non-player characters in games.

## Installation

NodeJS Install:
```
npm install thusspokenpc
```

Client Install (remote):
```
<script type="text/javascript" src="https://raw.githubusercontent.com/CodeOtter/thusspokenpc/master/index.js">
```

## Configuration

**ThusSpokeNpc** is a JavaScript singleton that manages a list of **NPC Messages** (a message, its trigger conditions, and its rewards).  Calling up the singleton as a function will register a new NPC Message like so:

```javascript
// Accessible as npcCreate() as well
var npc = ThusSpokeNpc(1, speakHandler, 0, 0, 0, 0, [{
    conditions: { 'item:1': true },
    message: "You found my ring!",
    rewards: { take: "item:1" }
}]);
```

This will create an NPC Message that uses Entity ID 1, can be asked questions over and over again, does not engage in banter, will only talk if you have Item 1, and indicates that Item 1 should be taken after speaking.  (We also tell the NPC Messages to be routed to the ```speakHandler``` callback)

Let's examine why this is by looking at each parameter in the ```ThusSpokeNpc``` function:

1. The **Entity ID** (Integer) is the ID of the Game Entity you want to be *askable*.  (*This value is required.*)
1. The **speak handler** (Function) is a function that is notified whenever the NPC speaks.  (*This value is required*) The parameters of this function are:
  1. The Entity ID of the speaking NPC (Integer)
  1. The message the NPC is speaking (String)
  1. The reward indicators of triggering this speech. (Object)
1. The **tolerance** (Integer) is the delay (*in milliseconds*) that is imposed in between asks.  If the tolerance was at 3000, this would mean when a Player asks the NPC, the NPC will ignore additional asks for the next three seconds.  If the tolerance is set to 0, an NPC can be asked over and over again without delay.  (*By default the tolerance is set to 0*)
1. The **range** (Float) is how close the Player has to be to the NPC for ask requests to be handled.  If the range is set to 0, the Player can be anywhere to ask an NPC.  (*The default is 0*)
1. The **banter** (Integer) is the percent chance an NPC will engage in banter.  Banter is random speech, indicated by adding ```banter: true``` to the conditions of an NPC message.  If the banter is set to 0, the NPC will never engage in banter.  (*By default this value is 0*)
1. The **banter delay** (Integer) is the delay (*in milliseconds*) that an NPC will wait before checking to engage in banter.  If the banter delay is set to 0, the NPC will never engage in banter.  (*By default this value is 0)
1. The **messages** (Array) are an array of object literals that represent NPC Messages.

## Examples

If we wanted to create an NPC that uses Entity ID 58393, will only respond to asks once every 5 seconds, didn't care how close the Player is to it, has a 25% change to engage in banter every 10 seconds, but doesn't say anything else but banter, we would do the following:

```javascript
var npc = ThusSpokeNpc(58393, speakHandler, 5000, 0, 25, 10000, [{
    conditions: { banter: true }
    message: 'Hey, how ya doing?'
},{
    conditions: { banter: true }
    message: 'Just kidding, I hate you.'
}]);
```

If we wanted to create an NPC that uses Entity ID 482, will only respond to asks once every 1 second, needed the Player to be within 10 units of distance of the NPC, has a 5% change to engage in banter every 15 seconds, and spoke only when the Player was Level 4, we would do the following:

```javascript
var npc = ThusSpokeNpc(482, speakHandler, 1000, 10, 5, 15000, [{
    conditions: { banter: true }
    message: 'I don\'t see what the big deal is...'
},{
    conditions: { banter: true }
    message: 'You have sex with one goat...'
},{
    conditions: { level: 4 },
    message: "You look all grewed up!"
}]);
```

If we wanted to create an NPC that uses Entity ID 143335, does not care about being incessantly badgered, needs the Player to be within 1 units of distance of the NPC, has no desire to engage in banter, greets the player by giving him Quest 43, spoke when the player hadn't completed Quest 43 (the missing taco!), spoke again when the player had Item 34, and thanked the player after the quest was completed,  we would do the following:

```javascript
var npc = ThusSpokeNpc(143335, speakHandler, 0, 1, 0, 0, [{
    conditions: { 'greeeting': true }
    message: 'You must help me find my missing taco!'
    rewards: { 'quest:43': 'active' }
},{
    conditions: { 'quest:43': 'active' }
    message: 'Have you found my missing taco?'
}{
    conditions: { 'item:34': true }
    message: 'You found my taco!!! Yaaaay!',
    rewards: { take: 'item:34', 'quest:43': 'completed' }
},{
    conditions: { 'quest:43': 'completed' },
    message: "Thanks again for finding my taco!"
}]);
```

## API

This will force Entity 1 to say something and trigger rewards.

```javascript
// Accessible as npcSay() as well
ThusSpokeNpc.say(1, "Don't tell me how to live my life!", { 'item:123': true });
```

This will ask Entity 65 a question, based on conditions as criteria.  If it matches a registered NPC message, then the NPC will speak.  
Because the matching engine is a key-value comparison, is best to have your criteria be a flattened object/key-value pairing of the 
properties a player has.  (See *Advanced Usage* below)

```javascript
// Accessible as npcAsk() as well
ThusSpokeNpc.ask(65, {
    range: 1, 
    'item:23': true, 
    'quest:2', 'completed', 
    'quest:84': 'active'
});
```

To add more messages to Entity 7353, do the following:

```javascript
// Accessible as npcAdd() as well
ThusSpokeNpc.add(7353, { greeting: true }, 'Stay a while and listen!', { 'quest:8494': 'active' });
```

To destroy Entity 588's ability to message, do the following:

```javascript
// Accessible as npcDestroy() as well
ThusSpokeNpc.destroy(588);
```

## Advanced Usage

As you may have noticed from the examples above, the NPC Message configuration appears fairly robust, but looks are deceiving.  
There is no formal system in place for ThusSpokeNpc to automatically tick off game progress.  There is an implied step between your Player's data 
and the ThusSpokeNpc system: *flattening*

As mentioned in the ```ThusSpokeNpc.ask``` API example, the condition matching engine is a key-value comparison, which means your ```ask()``` criteria
and your NPC Message conditions have to be a flattened object/key-value pair to work correctly. properties a player has.  For example, if your 
raw Player Object had these properties in it and they were structured like this:

```javascript
{
	items: [{
		id: 4,
		name: 'Dagger',
		damage: 4
	},{
		id: 16,
		name: 'Shield',
		block: 2
	}],
	quests: [{
		id: 778,
		status: 'active'
	}, {
		id: 23,
		status: 'complete'
	}]
}
```

Your flattened condition criteria will have to look like this:

```
{
	'item:4': true,
	'item:16': true,
	'quest:778': 'active',
	'quest:23': 'completed'
}
```

The same rules apply to the Reward indicators of an NPC Message.  You'll have to wire up your own way of converting indicators into actually changing 
the Player object.  So, if a reward is:

```
{
	take: 'item:4',
	'quest:23': 'completed'
	'quest:24': 'active'
}
```

You will need to analyze the properties of the Reward indicator, and when ```take``` is detected, have a function that explodes its value and takes 
Item 4 from the Player.  You'll also have to check for ```/quest\:([0-9]+)/``` and change the status of these quests based on the indicators values.