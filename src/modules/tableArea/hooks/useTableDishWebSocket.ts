import { useSignalREvent } from '@/lib/services/socket';
import { useCallback, useEffect, useRef } from 'react';

export type DishUpdate = {
    id: number;
    dish_Name: string;
    image: string | null;
    selling_Price: number;
    quantity: number;
    notes: string | null;
};

type UseTableDishWebSocketProps = {
    tableId?: number;
    onDishesUpdated?: (dishes: DishUpdate[]) => void;
    enabled?: boolean;
};

/**
 * Custom hook to listen for real-time dish updates on a specific table
 * Automatically subscribes/unsubscribes when component mounts/unmounts
 */
export const useTableDishWebSocket = ({
    tableId,
    onDishesUpdated,
    enabled = true
}: UseTableDishWebSocketProps) => {

    const previousTableIdRef = useRef<number | undefined>();

    const handleDishesUpdated = useCallback((dishes: DishUpdate[]) => {
        console.log('[WebSocket] DishesUpdated received:', {
            timestamp: new Date().toISOString(),
            tableId,
            dishCount: dishes.length,
            dishes: dishes.map(d => ({
                id: d.id,
                name: d.dish_Name,
                quantity: d.quantity
            }))
        });

        onDishesUpdated?.(dishes);
    }, [tableId, onDishesUpdated]);

    // Subscribe to DishesUpdated event with handler
    const { data, connection } = useSignalREvent('DishesUpdated',
        enabled && tableId ? {
            handler: handleDishesUpdated
        } : {}
    );

    // Join/leave table groups dynamically
    useEffect(() => {
        if (!connection || !enabled || !tableId) return;

        // Check if connection is in Connected state
        if (connection.state !== 'Connected') {
            console.log('[WebSocket] Connection not ready yet, skipping JoinTable');
            return;
        }

        // Leave previous table group if exists
        if (previousTableIdRef.current && previousTableIdRef.current !== tableId) {
            connection.invoke('LeaveTable', previousTableIdRef.current)
                .catch(err => console.error('[WebSocket] Failed to leave table:', err));
        }

        // Join new table group
        connection.invoke('JoinTable', tableId)
            .then(() => {
                console.log(`[WebSocket] Joined Table-${tableId} group`);
                previousTableIdRef.current = tableId;
            })
            .catch(err => console.error('[WebSocket] Failed to join table:', err));

        // Cleanup: leave table group when unmounting or tableId changes
        return () => {
            if (tableId && connection.state === 'Connected') {
                connection.invoke('LeaveTable', tableId)
                    .catch(err => console.error('[WebSocket] Failed to leave table on unmount:', err));
            }
        };
    }, [connection, tableId, enabled]);

    return { data, connection };
};

