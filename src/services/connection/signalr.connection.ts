import { ISignalRConnection } from './i.signalr.connection';
import { Observable, Subject } from 'rxjs';
import { BroadcastEventListener } from '../eventing/broadcast.event.listener';
import { ConnectionStatus } from './connection.status';
import { NgZone } from '@angular/core';
import { SignalRConfiguration } from '../signalr.configuration';
import { ConnectionTransport } from './connection.transport';

export class SignalRConnection implements ISignalRConnection {

    private _status: Observable<ConnectionStatus>;
    private _errors: Observable<any>;
    private _jConnection: any;
    private _defaultProxy: any;
    private _jProxies: Map<string, any>;
    private _zone: NgZone;
    private _configuration: SignalRConfiguration;

    constructor(jConnection: any, jProxies: Map<string, any>, zone: NgZone, configuration: SignalRConfiguration) {
        this._jProxies = jProxies;
        this._defaultProxy = jProxies.values().next().value;
        this._jConnection = jConnection;
        this._zone = zone;
        this._errors = this.wireUpErrorsAsObservable();
        this._status = this.wireUpStatusEventsAsObservable();
        this._configuration = configuration;
    }

    public get errors(): Observable<any> {
        return this._errors;
    }

    public get status(): Observable<ConnectionStatus> {
        return this._status;
    }

    public setQs(qs: any) {
        this._jConnection.qs = qs;
    }
    public getQs(): string {
        return this._jConnection.qs;
    }

    public start(): Promise<ISignalRConnection> {

        console.log('Starting connection', this._jConnection);

        const jTransports = this.convertTransports(this._configuration.transport);

        const $promise = new Promise<ISignalRConnection>((resolve, reject) => {
            this._jConnection
                .start({
                    jsonp: this._configuration.jsonp,
                    transport: jTransports,
                    withCredentials: this._configuration.withCredentials,
                })
                .done(() => {
                    console.log('Connection established, ID: ' + this._jConnection.id);
                    console.log('Connection established, Transport: ' + this._jConnection.transport.name);
                    resolve(this);
                })
                .fail((error: any) => {
                    console.log('Could not connect');
                    reject('Failed to connect. Error: ' + error.message); // ex: Error during negotiation request.
                });
        });
        return $promise;
    }

    public stop(): void {
        console.log('Stopping connection', this._jConnection);
        this._jConnection.stop();
    }

    public get id(): string {
        return this._jConnection.id;
    }

    public invoke(method: string, sproxy?: string, ...parameters: any[]): Promise<any> {
        if (method == null) {
            throw new Error('SignalRConnection: Failed to invoke. Argument \'method\' can not be null');
        }
        this.log(`SignalRConnection. Start invoking \'${method}\'...`);

        const $promise = new Promise<any>((resolve, reject) => {
            this.getCurrentProxy(sproxy).invoke(method, ...parameters)
                .done((result: any) => {
                    this.log(`\'${method}\' invoked succesfully. Resolving promise...`);
                    resolve(result);
                    this.log(`Promise resolved.`);
                })
                .fail((err: any) => {
                    console.log(`Invoking \'${method}\' failed. Rejecting promise...`);
                    reject(err);
                    console.log(`Promise rejected.`);
                });
        });
        return $promise;
    }

    public listen<T>(listener: BroadcastEventListener<T>, sproxy?: string): void {
        if (listener == null) {
            throw new Error('Failed to listen. Argument \'listener\' can not be null');
        }

        this.log(`SignalRConnection: Starting to listen to server event with name ${listener.event}`);
        this.getCurrentProxy(sproxy).on(listener.event, (...args: any[]) => {

            this._zone.run(() => {
                let casted: T = null;
                if (args.length > 0) {
                    casted = args[0] as T;
                    this.log('SignalRConnection.proxy.on invoked. Calling listener next() ...');
                    listener.next(casted);
                    this.log('listener next() called.');
                }
            });
        });
    }

    public listenFor<T>(event: string, sproxy?: string): BroadcastEventListener<T> {
        if (event == null || event === '') {
            throw new Error('Failed to listen. Argument \'event\' can not be empty');
        }

        const listener = new BroadcastEventListener<T>(event);

        this.listen(listener, sproxy);

        return listener;
    }

    private getCurrentProxy(sproxy?: string) {
        if (!sproxy) {
            return this._defaultProxy;
        } else {
            return this._jProxies.get(sproxy);
        }
    }

    private convertTransports(transports: ConnectionTransport | ConnectionTransport[]): any {
        if (transports instanceof Array) {
            return transports.map((t: ConnectionTransport) => t.name);
        }
        return transports.name;
    }

    private wireUpErrorsAsObservable(): Observable<any> {
        const sError = new Subject<any>();

        this._jConnection.error((error: any) => {
            // this._zone.run(() => {  /*errors don't need to run in a  zone*/
            sError.next(error);
            // });
        });
        return sError;
    }

    private wireUpStatusEventsAsObservable(): Observable<ConnectionStatus> {
        const sStatus = new Subject<ConnectionStatus>();
        // aggregate all signalr connection status handlers into 1 observable.
        // handler wire up, for signalr connection status callback.
        this._jConnection.stateChanged((change: any) => {
            this._zone.run(() => {
                sStatus.next(new ConnectionStatus(change.newState));
            });
        });
        return sStatus.asObservable();
    }

    /*private onBroadcastEventReceived<T>(listener: BroadcastEventListener<T>, ...args: any[]) {
        this.log('SignalRConnection.proxy.on invoked. Calling listener next() ...');

        let casted: T = null;
        if (args.length > 0) {
            casted = (args[0] as T);
        }

        this._zone.run(() => {
            listener.next(casted);
        });

        this.log('listener next() called.');
    }*/

    private log(...args: any[]) {
        if (this._jConnection.logging === false) {
            return;
        }
        console.log(args.join(', '));
    }
}
