/// <reference path="global.d.ts" />

import Util from './util'

export default class DevApi {
    static async toggleDevTool() {
        await Util.try(window?.dev?.toggleDevTool).with()
    }
}