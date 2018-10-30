import { Observable, Subject } from 'rxjs';
import { BroadcastEventListener } from '../eventing/broadcast.event.listener';
import { ConnectionStatus } from '../connection/connection.status';
import { ISignalRConnection } from '../connection/i.signalr.connection';

export interface IListenerCollection {
    [name: string]: BroadcastEventListener<any>;
}

export class SignalRConnectionMock implements ISignalRConnection {
    getQs(): string {
        return null;
    }
    setQs(qs: string): void {

    }
    constructor(
        private _mockErrors$: Subject<any>,
        private _mockStatus$: Subject<ConnectionStatus>,
        private _listeners: IListenerCollection) {
    }

    get errors(): Observable<any> {
        return this._mockErrors$;
    }

    get status(): Observable<ConnectionStatus> {
        return this._mockStatus$.asObservable();
    }

    get id(): string {
        return 'xxxxxxxx-xxxx-xxxx-xxxxxxxxx';
    }

    public stop(): void {
    }

    public start(): Promise<any> {
        return Promise.resolve(null); // TODO: implement
    }

    public invoke(method: string, ...parameters: any[]): Promise<any> {
        return Promise.resolve(null);
    }

    public listen<T>(listener: BroadcastEventListener<T>): void {
        this._listeners[listener.event] = listener;
    }

    public listenFor<T>(event: string): BroadcastEventListener<T> {
        let listener = new BroadcastEventListener<T>(event);
        this.listen(listener);
        return listener;
    }
}


