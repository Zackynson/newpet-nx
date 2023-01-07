import { TransactionLeanDocument } from '@libs/transactions';
import { HttpStatus } from '@nestjs/common';

export interface ServiceInterface {
	idempotencyKey: string;
	service: string;
	returnData?: boolean;
	tenantId?: string;
	executionId?: string;
	cpf?: string;
}
export interface ServiceResultInterface {
	status: HttpStatus;
	data?: any;
}

export interface ServiceCrudInterface {
	docs: any[];
}

export interface RequestServiceExecution extends TransactionLeanDocument {
	idempotencyKey: string;
	service: string;
	provider: string;
	transactionId: string;
}
