import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

export function useSignalR(url, events, deps = []) {
  const connectionRef = useRef(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          return user?.token || '';
        }
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    Object.entries(events).forEach(([event, handler]) => {
      connection.on(event, handler);
    });

    connection.start().catch(err => console.warn('SignalR error:', url, err));

    return () => {
      connection.stop();
    };
  }, deps);
}