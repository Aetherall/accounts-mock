import { NotificationPlugin } from "../../Types/NotificationPlugin";

export interface NotificationServiceMailgunConfiguration {
  
  from?: string;

  mailgun?: any;

  apiKey?: string;

  domain?: string;

  notificationPlugins: NotificationPlugin[];

}