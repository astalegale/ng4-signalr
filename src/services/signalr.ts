import { ISignalRConnection } from './connection/i.signalr.connection';
import { SignalRConfiguration } from './signalr.configuration';
import { SignalRConnection } from './connection/signalr.connection';
import { IConnectionOptions } from './connection/connection.options';
import { Observable } from 'rxjs';
import { ConnectionStatus } from './connection/connection.status';
import { SIGNALR_JCONNECTION_TOKEN } from "./signalr.module";
import { NgZone, Inject, Injectable } from '@angular/core';

declare var jQuery: any;

@Injectable()
export class SignalR {
    private _configuration: SignalRConfiguration;
    private _zone: NgZone;
    private _jHubConnectionFn: any;

    public constructor(
        configuration: SignalRConfiguration,
        zone: NgZone,
        @Inject(SIGNALR_JCONNECTION_TOKEN) jHubConnectionFn: Function
    ) {
        this._configuration = configuration;
        this._zone = zone;
        this._jHubConnectionFn = jHubConnectionFn;
    }

    public createConnection(options?: IConnectionOptions): SignalRConnection {
        let status: Observable<ConnectionStatus>;
        let configuration = this.merge(options ? options : {});

        try {

            let serializedQs = JSON.stringify(configuration.qs);
            let serializedTransport = JSON.stringify(configuration.transport);

            if (configuration.logging) {
                console.log(`Creating connecting with multiple HUBS support!...`);
                console.log(`configuration:[url: '${configuration.url}'] ...`);
                configuration.hubNames.forEach(element => {
                    console.log(`configuration:[hubName: '${element}'] ...`);
                });
                console.log(`configuration:[qs: '${serializedQs}'] ...`);
                console.log(`configuration:[transport: '${serializedTransport}'] ...`);
            }
        } catch (err) { }

        // create connection object
        let jConnection = this._jHubConnectionFn(configuration.url);
        jConnection.logging = configuration.logging;
        jConnection.qs = configuration.qs;

        let jProxies: Map<string, any> = new Map<string, any>();
        configuration.hubNames.forEach(element => {
            // create a proxy        
            let jp = jConnection.createHubProxy(element);
            jp.on('noOp', function () { });
            jProxies.set(element, jp);
            // !!! important. We need to register at least one function otherwise server callbacks will not work.
        });




        let hubConnection = new SignalRConnection(jConnection, jProxies, this._zone, configuration);

        return hubConnection;
    }


    public connect(options?: IConnectionOptions): Promise<ISignalRConnection> {

        return this.createConnection(options).start();
    }

    private merge(overrides: IConnectionOptions): SignalRConfiguration {
        let merged: SignalRConfiguration = new SignalRConfiguration();
        merged.hubNames = overrides.hubNames || this._configuration.hubNames;
        merged.url = overrides.url || this._configuration.url;
        merged.qs = overrides.qs || this._configuration.qs;
        merged.logging = this._configuration.logging;
        merged.jsonp = overrides.jsonp || this._configuration.jsonp;
        merged.withCredentials = overrides.withCredentials || this._configuration.withCredentials;
        merged.transport = overrides.transport || this._configuration.transport;
        return merged;
    }

}
