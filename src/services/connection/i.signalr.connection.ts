import { Observable } from 'rxjs';
import { BroadcastEventListener } from "../eventing/broadcast.event.listener";
import { ConnectionStatus } from "./connection.status";

export interface ISignalRConnection {
    readonly status: Observable<ConnectionStatus>;
    readonly errors: Observable<any>;
    readonly id: string;
    invoke(method: string, ...parameters: any[]): Promise<any>;
    listen<T>(listener: BroadcastEventListener<T>, sproxy?: string): void;
    listenFor<T>(listener: string, sproxy?: string): BroadcastEventListener<T>;
    stop(): void;
    setQs(qs: any): void;
    getQs(): string;
    start(): Promise<any>;
}
