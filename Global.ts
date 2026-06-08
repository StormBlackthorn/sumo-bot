namespace Global {
    export enum DEVICE_TYPE {
        CONTRLLER, BOT
    }

    export let deviceType: DEVICE_TYPE;
    export let radioGroup : number;

    export function init(args : {
        deviceType : DEVICE_TYPE,
        radioGroup : number
    }) {
        Global.deviceType = args.deviceType;

        if(args.radioGroup < 0) throw "Radio group can't be less than 0";
        if(args.radioGroup > 255) throw "Radio group can't be more than 255"
        Global.radioGroup = args.radioGroup;
    }
}