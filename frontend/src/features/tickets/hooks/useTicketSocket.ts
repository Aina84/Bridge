import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/constants';

export const useTicketSocket = (ticketId: number | undefined) => {
    const queryClient = useQueryClient();
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!ticketId) return;
        const apiHost = API_BASE_URL.replace(/https?:\/\//, '').split('/')[0];
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socketUrl = `${protocol}//${apiHost}/ws/ticket/${ticketId}/`;

        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);

            queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
            
        };

        socket.onopen = () => {
            console.log(`WebSocket connected for ticket ${ticketId}`);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log(`WebSocket disconnected for ticket ${ticketId}`);
        };

        return () => {
            socket.close();
            socketRef.current = null;
        };
    }, [ticketId, queryClient]);

    return socketRef.current;
};
