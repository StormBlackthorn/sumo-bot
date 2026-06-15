// tests go here; this will not be compiled when this package is used as an extension.

let testBot = new Bot();

// Test basic move forward and backward
serial.writeLine("Testing Bot.Motors.move...")
testBot.Motors.move(500, Motors.DIR.FORWARD)
basic.pause(500)
testBot.Motors.stop()

testBot.Motors.move(500, Motors.DIR.BACKWARD)
basic.pause(500)
testBot.Motors.stop()

// Test direct spin
serial.writeLine("Testing Bot.Motors.spin...")
testBot.Motors.spin(600, 600)  // straight forward
basic.pause(500)
testBot.Motors.stop()

testBot.Motors.spin(-600, -600) // straight backward
basic.pause(500)
testBot.Motors.stop()

// Test tank turn left and right
serial.writeLine("Testing Bot.Motors.tankTurn...")
testBot.Motors.tankTurnLeft(400)
basic.pause(500)
testBot.Motors.stop()

testBot.Motors.tankTurnRight(400)
basic.pause(500)
testBot.Motors.stop()

serial.writeLine("All tests completed successfully!")
