import { NgModule, ModuleWithProviders, NgZone, InjectionToken } from '@angular/core';
import { SignalR, SIGNALR_JCONNECTION_TOKEN } from './signalr';
import { SignalRConfiguration } from './signalr.configuration';

const SIGNALR_CONFIGURATION = new InjectionToken<SignalRConfiguration>('SIGNALR_CONFIGURATION');

export function createSignalr(configuration: SignalRConfiguration, zone: NgZone) {

    const jConnectionFn = getJConnectionFn();

    return new SignalR(configuration, zone, jConnectionFn);
}

export function getJConnectionFn(): any {
    const jQuery = getJquery();
    const hubConnectionFn = jQuery.hubConnection;
    if (hubConnectionFn == null) {
        // tslint:disable-next-line:max-line-length
        throw new Error('Signalr failed to initialize. Script \'jquery.signalR.js\' is missing. Please make sure to include \'jquery.signalR.js\' script.');
    }
    return hubConnectionFn;
}

function getJquery(): any {
    const jQuery = (window as any).jQuery;
    if (jQuery == null) {
        // tslint:disable-next-line:max-line-length
        throw new Error('Signalr failed to initialize. Script \'jquery.js\' is missing. Please make sure to include jquery script.');
    }
    return jQuery;
}

@NgModule({
    providers: [{
        provide: SignalR,
        useValue: SignalR
    }]
})
export class SignalRModule {
    public static forRoot(getSignalRConfiguration: () => void): ModuleWithProviders<SignalRModule> {
        return {
            ngModule: SignalRModule,
            providers: [
                {
                    provide: SIGNALR_JCONNECTION_TOKEN,
                    useFactory: getJConnectionFn
                },
                {
                    provide: SIGNALR_CONFIGURATION,
                    useFactory: getSignalRConfiguration
                },
                {
                    deps: [SIGNALR_JCONNECTION_TOKEN, SIGNALR_CONFIGURATION, NgZone],
                    provide: SignalR,
                    useFactory: (createSignalr)
                }
            ],
        };
    }
    public static forChild(): ModuleWithProviders<SignalRModule> {
        throw new Error("forChild method not implemented");
    }
}
