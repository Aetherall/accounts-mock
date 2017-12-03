import { NotificationService } from '../../Types/NotificationService';
import { NotificationPlugins, NotificationPlugin } from '../../Types/NotificationPlugin';
import { NotificationServiceDebugConfiguration } from '../types/NotificationServiceDebugConfiguration';

export default class NotificationServiceDebug implements NotificationService {

  public name: string = 'email';

  private notificationPlugins: NotificationPlugins;
  
  constructor( config: NotificationServiceDebugConfiguration ){

    this.notificationPlugins = config.notificationPlugins.reduce(
      ( a: NotificationPlugins , notificationPlugin: NotificationPlugin ) => a[notificationPlugin.name] = notificationPlugin
    ,{})

  }

  send = ( mail: object ) : void => {
    console.dir(mail);
  }

  notify = ( notificationPluginName: string, actionName:string, params: object ) : void => 
    this.notificationPlugins[ notificationPluginName ][ actionName ](this.send)(params)

}