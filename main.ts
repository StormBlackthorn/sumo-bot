Network.setRadioGroup(2048);
Network.onRecieve((packet : Network.NetworkPacket<Network.NetworkPacketTypes.RecievedPacket>) => {
    switch(packet.name) {   
        case Network.NetworkPacketTypes.RecievedPacket.RED_BUTTON_PRESSED:
            break;
        default:
            //handleUnknownPacket();
            break;
    }
})
