export function getStatusBadgeVariant(status: string) {
    switch (status) {
        case 'OPEN': return 'info' as const;
        case 'IN_PROGRESS': return 'warning' as const;
        case 'RESOLVED': return 'success' as const;
        case 'CLOSED': return 'default' as const;
        default: return 'default' as const;
    }
}

export function getPriorityBadgeVariant(priority: string) {
    switch (priority) {
        case 'LOW': return 'default' as const;
        case 'MEDIUM': return 'primary' as const;
        case 'HIGH': return 'warning' as const;
        case 'CRITICAL': return 'danger' as const;
        default: return 'default' as const;
    }
}
