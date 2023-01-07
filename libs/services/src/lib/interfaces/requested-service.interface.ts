export interface RequestedServiceItemTableKeys {
	transactionId: string /** Partition key */;
	service: string /** Sort key */;
}
export interface RequestedServiceItem extends RequestedServiceItemTableKeys {
	idempotencyKey: string;
	provider?: string;
	invokeCount?: number;
	tenantId?: string;
}
