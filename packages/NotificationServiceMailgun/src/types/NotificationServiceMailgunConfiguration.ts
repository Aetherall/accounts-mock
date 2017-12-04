import { NotificationPlugin } from '@types/accounts';

export interface NotificationServiceMailgunConfiguration {
  
  from?: string;

  mailgun?: any;

  apiKey?: string;

  domain?: string;

  notificationPlugins: NotificationPlugin[];

}