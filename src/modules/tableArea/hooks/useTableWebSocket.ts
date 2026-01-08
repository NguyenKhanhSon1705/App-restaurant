import { useSignalREvent } from '@/lib/services/socket';
import { useCallback, useEffect, useRef } from 'react';

export type TableUpdate = {
    id: number;
    nameTable: string;
    areaName: string;
    isActive: boolean;
    isBooking: boolean;
    hasHourlyRate: boolean | null;
    priceOfMunite: number | null;
    timeStart: string | null;
    timeEnd: string | null;
};

type UseTableWebSocketProps = {
    areaId?: number;
    onTableUpdated?: (tables: TableUpdate[]) => void;
    enabled?: boolean;
};

/**
 * Hook để nhận real-time table updates từ backend
 */
export const useTableWebSocket = ({
    areaId,
    onTableUpdated,
    enabled = true
}: UseTableWebSocketProps) => {

    const previousAreaIdRef = useRef<number | null>(null);

    const handleTableUpdated = useCallback((tables: TableUpdate[]) => {
        console.log('[WebSocket] TableUpdated received:', {
            timestamp: new Date().toISOString(),
            areaId,
            tablesCount: tables.length,
        });

        onTableUpdated?.(tables);
    }, [areaId, onTableUpdated]);

    const { data, connection } = useSignalREvent('TableUpdated',
        enabled && areaId ? {
            handler: handleTableUpdated
        } : {}
    );

    // Dynamically join area group
    useEffect(() => {
        if (!connection || !enabled || !areaId) return;

        if (connection.state !== 'Connected') {
            console.log('[WebSocket] Waiting for connection...');
            return;
        }

        // Leave previous area
        if (previousAreaIdRef.current && previousAreaIdRef.current !== areaId) {
            connection.invoke('LeaveArea', previousAreaIdRef.current)
                .catch(() => { });
        }

        // Join new area
        connection.invoke('JoinArea', areaId)
            .then(() => {
                console.log(`[WebSocket] Joined Area-${areaId} group`);
                previousAreaIdRef.current = areaId;
            })
            .catch(() => {
                console.log(`[WebSocket] JoinArea not available, using static connection`);
            });

        return () => {
            if (areaId && connection.state === 'Connected') {
                connection.invoke('LeaveArea', areaId).catch(() => { });
            }
        };
    }, [connection, areaId, enabled]);

    return { data, connection };
};
