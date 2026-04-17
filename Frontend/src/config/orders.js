export const ORDER_STATUS_CONFIG = {
    AWAITING_PAYMENT   : { color: '#94a3b8', label: 'Awaiting Payment',   lc: -1, isAwaiting: true },
    PENDING_PAYMENT    : { color: '#94a3b8', label: 'Awaiting Payment',   lc: -1, isAwaiting: true },
    CONFIRMED          : { color: '#60a5fa', label: 'Paid & Confirmed',  lc: 0 },
    IN_PREPARATION     : { color: '#fbbf24', label: 'In Preparation',    lc: 1 },
    READY_FOR_PICKUP   : { color: '#c0d72d', label: 'Ready for Pickup',  lc: 2 },
    OUT_FOR_DELIVERY   : { color: '#fb923c', label: 'Out for Delivery',  lc: 3 },
    DELIVERED          : { color: '#4ade80', label: 'Delivered',         lc: 4 },
    CANCELLED          : { color: '#f87171', label: 'Cancelled',         lc: -1, isCancelled: true },
    ISSUE_FLAGGED      : { color: '#f87171', label: 'Issue Flagged',     lc: -1, isCancelled: true },
};

export const ORDER_LIFECYCLE_STEPS = [
    { key: 'CONFIRMED',        label: 'Confirmed'  },
    { key: 'IN_PREPARATION',   label: 'Preparing'  },
    { key: 'READY_FOR_PICKUP', label: 'Ready'      },
    { key: 'OUT_FOR_DELIVERY', label: 'On the Way' },
    { key: 'DELIVERED',        label: 'Delivered'  },
];
