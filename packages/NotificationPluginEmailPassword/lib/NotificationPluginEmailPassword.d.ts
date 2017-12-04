import { NotificationPlugin } from '@types/accounts';
import { NotificationEmailPluginPasswordConfiguration } from './types/NotificationEmailPluginPasswordConfiguration';
export default class NotificationEmailPluginPassword implements NotificationPlugin {
    name: string;
    private from;
    constructor(config?: NotificationEmailPluginPasswordConfiguration);
    enroll: (send: Function) => ({address, user, token}: {
        address: string;
        user: any;
        token: string;
    }) => void;
    resetPassword: (send: Function) => ({address, user, token}: {
        address: string;
        user: any;
        token: string;
    }) => void;
    verification: (send: Function) => ({address, user, token}: {
        address: string;
        user: any;
        token: string;
    }) => void;
}
